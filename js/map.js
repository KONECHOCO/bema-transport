/**
 * BEMA TRANSPORT - Moteur de Suivi GPS en Temps Réel (Radar Live Korhogo - Abidjan)
 * Utilise Leaflet avec tracé de route officiel, télémétrie HUD et simulation animée
 */

class BemaMap {
    constructor() {
        this.map = null;
        this.busMarker = null;
        this.routePolyline = null;
        this.waypointMarkers = [];
        this.waypoints = BEMA_DATA.korhogoAbidjanRoute;

        // État de la simulation en direct
        this.isPlaying = true;
        this.simSpeed = 5; // Facteur d'accélération (1x, 5x, 25x)
        this.currentProgress = 0.48; // Commence à 48% (entre Katiola et Bouaké)
        this.delayMinutes = 0;
        this.currentSpeedKmh = 84;
        this.activeTripCode = "BEMA-401";
        this.activePlate = "1428 HG 01";
        this.activeDriver = "Amadou Koné";
        this.animInterval = null;
    }

    initMap() {
        if (this.map) {
            setTimeout(() => {
                this.map.invalidateSize();
            }, 200);
            return;
        }

        const mapContainer = document.getElementById('liveMapContainer');
        if (!mapContainer) return;

        // Initialiser Leaflet centré sur la Côte d'Ivoire
        this.map = L.map('liveMapContainer', {
            center: [7.5, -5.2],
            zoom: 7,
            zoomControl: true,
            attributionControl: false
        });

        // Tuiles cartographiques haute résolution ArcGIS World Street Map (sans filigrane ni blocage)
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 18,
            attribution: 'Esri & Côte d\'Ivoire GeoData'
        }).addTo(this.map);

        // Dessiner le tracé de la route Korhogo - Abidjan
        this.drawRoute();

        // Placer les arrêts et gares
        this.drawWaypoints();

        // Placer le marqueur du car BEMA
        this.initBusMarker();

        // Démarrer la boucle d'animation
        this.startSimulation();

        // Mettre à jour l'affichage télémétrique HUD
        this.updateTelemetryHUD();
    }

    drawRoute() {
        const latLngs = this.waypoints.map(wp => [wp.lat, wp.lng]);

        // Ligne de lueur d'arrière-plan (effet néon autoroutier)
        L.polyline(latLngs, {
            color: '#10b981',
            weight: 8,
            opacity: 0.25,
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(this.map);

        // Ligne principale de la Nationale A3 et Autoroute du Nord
        this.routePolyline = L.polyline(latLngs, {
            color: '#059669',
            weight: 4,
            opacity: 0.9,
            dashArray: '8, 6',
            lineCap: 'round'
        }).addTo(this.map);
    }

    drawWaypoints() {
        const majorCities = ["KORHOGO", "BOUAKE", "YAMOUSSOUKRO", "ABIDJAN"];

        this.waypoints.forEach((wp, index) => {
            const isMajor = wp.stopType === 'major_stop' || wp.stopType === 'origin' || wp.stopType === 'destination';
            const isOrigin = wp.stopType === 'origin';
            const isDest = wp.stopType === 'destination';

            let iconHtml = '';
            let markerClass = 'station-marker';

            if (isOrigin) {
                markerClass += ' origin-marker';
                iconHtml = '<i class="fa-solid fa-flag-checkered"></i>';
            } else if (isDest) {
                markerClass += ' dest-marker';
                iconHtml = '<i class="fa-solid fa-location-dot"></i>';
            } else if (isMajor) {
                markerClass += ' major-marker';
                iconHtml = '<i class="fa-solid fa-building"></i>';
            } else {
                markerClass += ' waypoint-marker';
                iconHtml = '<span class="waypoint-dot"></span>';
            }

            const customIcon = L.divIcon({
                className: 'custom-map-icon-container',
                html: `
                    <div class="${markerClass}">
                        ${iconHtml}
                        <span class="station-label-popup">${wp.name}</span>
                    </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker([wp.lat, wp.lng], { icon: customIcon }).addTo(this.map);

            marker.bindPopup(`
                <div class="map-popup-card">
                    <span class="popup-tag">Étape BEMA TRANSPORT</span>
                    <h4>${wp.name}</h4>
                    <p>Distance depuis Korhogo : <strong>${wp.km} km</strong></p>
                    <p>Ligne : <strong>Korhogo ➔ Abidjan</strong></p>
                </div>
            `);

            this.waypointMarkers.push(marker);
        });
    }

    initBusMarker() {
        const currentCoord = this.getPositionAtProgress(this.currentProgress);

        const busIcon = L.divIcon({
            className: 'bema-bus-radar-icon',
            html: `
                <div class="bus-radar-pulse"></div>
                <div class="bus-radar-pulse-ring"></div>
                <div class="bus-vehicle-symbol">
                    <i class="fa-solid fa-bus"></i>
                </div>
                <div class="bus-plate-tooltip">
                    <strong>BEMA-401</strong>
                    <span>84 km/h</span>
                </div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 22]
        });

        this.busMarker = L.marker([currentCoord.lat, currentCoord.lng], { icon: busIcon }).addTo(this.map);

        this.busMarker.bindPopup(`
            <div class="bus-live-popup">
                <div class="popup-header">
                    <span class="live-dot-green"></span>
                    <strong>CAR BEMA EN DIRECT</strong>
                </div>
                <div class="popup-bus-details">
                    <p>Matricule : <strong>${this.activePlate}</strong></p>
                    <p>Chauffeur : <strong>${this.activeDriver}</strong></p>
                    <p>Vitesse : <strong id="popupSpeed">${this.currentSpeedKmh} km/h</strong></p>
                    <p>Ligne : <strong>Korhogo ➔ Abidjan</strong></p>
                </div>
            </div>
        `);
    }

    // Calcul de la position géographique par interpolation le long des étapes
    getPositionAtProgress(t) {
        // t entre 0.0 et 1.0
        const n = this.waypoints.length - 1;
        const totalDistance = this.waypoints[n].km;
        const currentTargetKm = t * totalDistance;

        // Trouver le segment correspondant
        let segmentIndex = 0;
        for (let i = 0; i < n; i++) {
            if (currentTargetKm >= this.waypoints[i].km && currentTargetKm <= this.waypoints[i + 1].km) {
                segmentIndex = i;
                break;
            }
        }

        const p1 = this.waypoints[segmentIndex];
        const p2 = this.waypoints[segmentIndex + 1];

        const segmentKm = p2.km - p1.km;
        const fraction = segmentKm === 0 ? 0 : (currentTargetKm - p1.km) / segmentKm;

        const lat = p1.lat + (p2.lat - p1.lat) * fraction;
        const lng = p1.lng + (p2.lng - p1.lng) * fraction;

        return {
            lat: lat,
            lng: lng,
            currentKm: Math.round(currentTargetKm),
            currentStop: p1.name,
            nextStop: p2.name,
            kmToNextStop: Math.max(1, Math.round(p2.km - currentTargetKm))
        };
    }

    startSimulation() {
        if (this.animInterval) clearInterval(this.animInterval);

        this.animInterval = setInterval(() => {
            if (!this.isPlaying) return;

            // Avancement fluide proportionnel à la vitesse
            const step = (0.0004 * this.simSpeed);
            this.currentProgress += step;

            if (this.currentProgress >= 1.0) {
                this.currentProgress = 1.0;
                this.isPlaying = false;
                this.currentSpeedKmh = 0;
                this.onTripArrival();
            } else {
                // Variation naturelle de vitesse (entre 78 et 89 km/h sur autoroute)
                this.currentSpeedKmh = Math.round(82 + Math.sin(Date.now() / 1500) * 6);
            }

            this.updateBusPosition();
            this.updateTelemetryHUD();
        }, 300);
    }

    updateBusPosition() {
        if (!this.busMarker) return;
        const pos = this.getPositionAtProgress(this.currentProgress);
        this.busMarker.setLatLng([pos.lat, pos.lng]);

        // Mettre à jour l'étiquette de vitesse sur le marqueur
        const tooltip = document.querySelector('.bus-plate-tooltip span');
        if (tooltip) {
            tooltip.textContent = `${this.currentSpeedKmh} km/h`;
        }
    }

    updateTelemetryHUD() {
        const pos = this.getPositionAtProgress(this.currentProgress);
        const totalKm = 580;
        const percent = Math.min(100, Math.round(this.currentProgress * 100));

        // Vitesse
        const speedElem = document.getElementById('hudSpeedValue');
        if (speedElem) speedElem.textContent = this.currentSpeedKmh;

        // Progression
        const progElem = document.getElementById('hudProgressPercent');
        const progBar = document.getElementById('hudProgressBarFill');
        if (progElem) progElem.textContent = `${percent}%`;
        if (progBar) progBar.style.width = `${percent}%`;

        // Distances
        const coveredElem = document.getElementById('hudKmCovered');
        const remainElem = document.getElementById('hudKmRemaining');
        if (coveredElem) coveredElem.textContent = `${pos.currentKm} km`;
        if (remainElem) remainElem.textContent = `${Math.max(0, totalKm - pos.currentKm)} km`;

        // Prochain arrêt
        const nextElem = document.getElementById('hudNextStopName');
        const distNextElem = document.getElementById('hudNextStopDist');
        if (nextElem) nextElem.textContent = pos.nextStop;
        if (distNextElem) distNextElem.textContent = `à ${pos.kmToNextStop} km`;

        // Statut & ETA
        const statusPill = document.getElementById('hudTripStatusPill');
        const etaElem = document.getElementById('hudEstimatedArrival');

        // Calcul de l'ETA (base 15:15 + retard)
        const baseHour = 15;
        const baseMin = 15 + this.delayMinutes;
        const etaDate = new Date();
        etaDate.setHours(baseHour, baseMin, 0);
        const etaStr = etaDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        if (etaElem) etaElem.textContent = etaStr;

        if (statusPill) {
            if (this.delayMinutes > 0) {
                statusPill.className = 'status-pill-hud badge-delayed';
                statusPill.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Retard +${this.delayMinutes} min`;
            } else if (this.currentProgress >= 1.0) {
                statusPill.className = 'status-pill-hud badge-arrived';
                statusPill.innerHTML = `<i class="fa-solid fa-check"></i> Arrivé à Quai (Adjamé)`;
            } else {
                statusPill.className = 'status-pill-hud badge-ontime';
                statusPill.innerHTML = `<i class="fa-solid fa-circle-check"></i> En Circulation Normale`;
            }
        }
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('btnMapPlayPause');
        if (btn) {
            btn.innerHTML = this.isPlaying ?
                `<i class="fa-solid fa-pause"></i> <span>Mettre en Pause</span>` :
                `<i class="fa-solid fa-play"></i> <span>Reprendre le Trajet</span>`;
        }
    }

    setSimulationSpeed(speedMultiplier) {
        this.simSpeed = speedMultiplier;
        const buttons = document.querySelectorAll('.btn-sim-speed');
        buttons.forEach(b => {
            if (parseInt(b.dataset.speed) === speedMultiplier) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    }

    // Déclencher un retard simulé (Alerte trafic, péage, contrôle)
    triggerSimulatedDelay() {
        this.delayMinutes += 25;

        // Sonnerie d'alerte
        if (window.bemaAudio) {
            window.bemaAudio.playAlertTone();
        }

        // Notification générale
        window.bemaStorage.addNotification({
            title: "Alerte Trafic : Retard de 25 min",
            message: "Ralentissement important au péage de Yamoussoukro (travaux de voirie). La nouvelle heure d'arrivée estimée à Abidjan est actualisée.",
            type: "warning"
        });

        // Toast immédiat
        if (window.bemaNotifications) {
            window.bemaNotifications.showToast("Alerte Retard : +25 min sur la ligne Korhogo ➔ Abidjan", "warning");
        }

        this.updateTelemetryHUD();
    }

    skipToNextCheckpoint() {
        this.currentProgress = Math.min(0.98, this.currentProgress + 0.15);
        this.updateBusPosition();
        this.updateTelemetryHUD();

        const pos = this.getPositionAtProgress(this.currentProgress);
        if (this.map) {
            this.map.panTo([pos.lat, pos.lng], { animate: true });
        }
    }

    focusOnDeparture(departureId) {
        this.initMap();
        setTimeout(() => {
            if (this.map && this.busMarker) {
                this.map.setView(this.busMarker.getLatLng(), 9, { animate: true });
            }
        }, 300);
    }

    onTripArrival() {
        if (window.bemaAudio) {
            window.bemaAudio.playStationChime();
        }
        window.bemaStorage.addNotification({
            title: "Terminus ! Arrivée à la Gare d'Abidjan Adjamé",
            message: "Le car BEMA-401 est arrivé à bon port. Les passagers peuvent récupérer leurs bagages au Quai N° 2.",
            type: "info"
        });
        if (window.bemaNotifications) {
            window.bemaNotifications.showToast("Terminus : Le car est arrivé à la Gare Centrale d'Abidjan Adjamé !", "success");
        }
    }
}

window.bemaMap = new BemaMap();

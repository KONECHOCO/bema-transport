/**
 * BEMA TRANSPORT - Espace Gestionnaire & Back-Office Compagnie
 * Gestion des Départs, Horaires, Flotte, Scanner de Billets et Diffusion d'Alertes
 */

class BemaAdmin {
    constructor() {
        this.currentFilter = 'all';
    }

    renderAdminDashboard() {
        this.renderKPIs();
        this.renderDeparturesTable();
        this.renderFleetTable();
        this.populateScheduleFormSelects();
    }

    renderKPIs() {
        const stats = window.bemaStorage.getStats();
        const fleet = window.bemaStorage.getFleet();
        const departures = window.bemaStorage.getDepartures();

        const revElem = document.getElementById('kpiRevenue');
        const ticketsElem = document.getElementById('kpiTicketsSold');
        const occElem = document.getElementById('kpiOccupancy');
        const busesElem = document.getElementById('kpiActiveBuses');

        if (revElem) revElem.textContent = `${stats.dailyRevenue.toLocaleString()} FCFA`;
        if (ticketsElem) ticketsElem.textContent = stats.ticketsSoldToday;
        if (occElem) occElem.textContent = `${stats.occupancyRate}%`;
        if (busesElem) busesElem.textContent = fleet.filter(b => b.status === 'en_route').length || 1;
    }

    populateScheduleFormSelects() {
        const busSelect = document.getElementById('adminNewBusSelect');
        const driverSelect = document.getElementById('adminNewDriverSelect');
        const fleet = window.bemaStorage.getFleet();
        const drivers = BEMA_DATA.drivers;

        if (busSelect) {
            busSelect.innerHTML = fleet.map(b => `
                <option value="${b.id}" data-plate="${b.plate}" data-model="${b.model}">
                    ${b.plate} - ${b.model} (${b.capacity} places)
                </option>
            `).join('');
        }

        if (driverSelect) {
            driverSelect.innerHTML = drivers.map(d => `
                <option value="${d.name}">${d.name} (${d.experience})</option>
            `).join('');
        }
    }

    renderDeparturesTable() {
        const container = document.getElementById('adminDeparturesTableBody');
        if (!container) return;

        const departures = window.bemaStorage.getDepartures();

        let html = '';
        departures.forEach(dep => {
            const occupiedCount = (dep.occupiedSeats || []).length;
            const remainingCount = (dep.totalSeats || 48) - occupiedCount;
            const fillRate = Math.round((occupiedCount / (dep.totalSeats || 48)) * 100);

            let statusBadge = '';
            if (dep.status === 'en_route') {
                statusBadge = '<span class="status-badge badge-en-route"><span class="pulse-dot"></span> En route</span>';
            } else if (dep.status === 'embarquement') {
                statusBadge = '<span class="status-badge badge-boarding"><i class="fa-solid fa-person-walking-luggage"></i> Embarquement</span>';
            } else if (dep.status === 'retarde' || dep.delayMinutes > 0) {
                statusBadge = `<span class="status-badge badge-delayed"><i class="fa-solid fa-clock"></i> Retard +${dep.delayMinutes}m</span>`;
            } else if (dep.status === 'termine') {
                statusBadge = '<span class="status-badge badge-completed"><i class="fa-solid fa-check"></i> Terminé</span>';
            } else {
                statusBadge = '<span class="status-badge badge-ontime"><i class="fa-solid fa-check"></i> À l\'heure</span>';
            }

            html += `
                <tr>
                    <td><strong>${dep.tripCode}</strong></td>
                    <td>
                        <div class="table-route-cell">
                            <strong>${dep.origin} ➔ ${dep.destination}</strong>
                            <small>${dep.originStation.split('(')[0]}</small>
                        </div>
                    </td>
                    <td>
                        <span class="time-highlight">${dep.departureTime}</span>
                        <small class="text-muted d-block">Arrivée: ${dep.arrivalTime}</small>
                    </td>
                    <td>
                        <div>${dep.busPlate}</div>
                        <small class="text-muted">${dep.busModel.split(' ')[0]}</small>
                    </td>
                    <td>${dep.driver}</td>
                    <td>
                        <strong class="text-emerald">${dep.price.toLocaleString()} FCFA</strong>
                    </td>
                    <td>
                        <div class="occupancy-cell">
                            <span class="occupancy-text">${occupiedCount} / ${dep.totalSeats} (${fillRate}%)</span>
                            <div class="mini-progress-bar">
                                <div class="mini-fill" style="width: ${fillRate}%"></div>
                            </div>
                        </div>
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-buttons-group">
                            <button type="button" class="btn-action-icon" title="Modifier le statut / Signaler retard" onclick="bemaAdmin.openDelayModal('${dep.id}')">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button type="button" class="btn-action-icon text-alert" title="Envoyer une alerte aux passagers" onclick="bemaAdmin.openAlertBroadcastModal('${dep.id}')">
                                <i class="fa-solid fa-bullhorn"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        container.innerHTML = html;
    }

    renderFleetTable() {
        const container = document.getElementById('adminFleetTableBody');
        if (!container) return;

        const fleet = window.bemaStorage.getFleet();

        let html = '';
        fleet.forEach(bus => {
            let statusPill = '';
            if (bus.status === 'en_route') {
                statusPill = '<span class="status-badge badge-en-route"><span class="pulse-dot"></span> En Circulation</span>';
            } else if (bus.status === 'a_quai') {
                statusPill = '<span class="status-badge badge-ontime">À Quai (Prêt)</span>';
            } else {
                statusPill = '<span class="status-badge badge-delayed">Maintenance</span>';
            }

            html += `
                <tr>
                    <td><strong>${bus.id}</strong></td>
                    <td><span class="plate-badge">${bus.plate}</span></td>
                    <td>
                        <strong>${bus.name}</strong>
                        <small class="d-block text-muted">${bus.model}</small>
                    </td>
                    <td>${bus.capacity} fauteuils</td>
                    <td>${bus.currentDriver}</td>
                    <td>${bus.mileage.toLocaleString()} km</td>
                    <td>${statusPill}</td>
                    <td>
                        <span class="badge-ac"><i class="fa-solid fa-snowflake"></i> Climatisation OK</span>
                    </td>
                </tr>
            `;
        });

        container.innerHTML = html;
    }

    // Programmer un nouveau départ (Charger les horaires)
    createNewDeparture(event) {
        event.preventDefault();

        const origin = document.getElementById('adminNewOrigin').value;
        const dest = document.getElementById('adminNewDest').value;
        const depTime = document.getElementById('adminNewDepTime').value;
        const arrTime = document.getElementById('adminNewArrTime').value;
        const price = parseInt(document.getElementById('adminNewPrice').value) || 10000;
        const serviceType = document.getElementById('adminNewServiceType').value;

        const busSelect = document.getElementById('adminNewBusSelect');
        const selectedBusOpt = busSelect.options[busSelect.selectedIndex];
        const busPlate = selectedBusOpt.dataset.plate;
        const busModel = selectedBusOpt.dataset.model;

        const driver = document.getElementById('adminNewDriverSelect').value;

        if (origin === dest) {
            alert("La ville de départ et la ville d'arrivée doivent être différentes.");
            return;
        }

        const originObj = BEMA_DATA.cities.find(c => c.id === origin) || { name: origin, station: `Gare BEMA ${origin}` };
        const destObj = BEMA_DATA.cities.find(c => c.id === dest) || { name: dest, station: `Gare BEMA ${dest}` };

        const randomNum = Math.floor(100 + Math.random() * 900);
        const tripCode = `BEMA-${randomNum}`;

        const newDep = {
            id: `DEP-${origin.substring(0,3)}-${dest.substring(0,3)}-${Date.now().toString().slice(-4)}`,
            tripCode: tripCode,
            origin: originObj.name,
            destination: destObj.name,
            originStation: originObj.station,
            destinationStation: destObj.station,
            departureTime: depTime,
            arrivalTime: arrTime,
            duration: "8h 45m",
            price: price, // 10 000 FCFA par défaut
            busId: busSelect.value,
            busModel: busModel,
            busPlate: busPlate,
            driver: driver,
            serviceType: serviceType,
            totalSeats: 48,
            occupiedSeats: [],
            status: "a_l_heure",
            currentProgress: 0,
            delayMinutes: 0,
            amenities: ["Climatisation grand froid", "Wi-Fi 4G", "Prises USB", "Toilettes", "Bagage 23kg inclus"]
        };

        window.bemaStorage.addDeparture(newDep);

        // Alerte audio et notification
        if (window.bemaAudio) window.bemaAudio.playSuccessBeep();
        if (window.bemaNotifications) {
            window.bemaNotifications.showToast(`Nouveau départ programmé : ${newDep.origin} ➔ ${newDep.destination} (${newDep.departureTime}) à ${newDep.price.toLocaleString()} FCFA`, "success");
        }

        window.bemaStorage.addNotification({
            title: `Nouveau Départ Ajouté : ${newDep.tripCode}`,
            message: `Le car ${newDep.busPlate} partira à ${newDep.departureTime} sur la ligne ${newDep.origin} ➔ ${newDep.destination}. Tarif : ${newDep.price} FCFA.`,
            type: "info"
        });

        // Fermer modal et rafraîchir
        this.closeNewScheduleModal();
        this.renderAdminDashboard();

        // Rafraîchir aussi la liste voyageur si elle est affichée
        if (window.bemaApp) {
            window.bemaApp.searchTrips();
        }
    }

    openNewScheduleModal() {
        const modal = document.getElementById('newScheduleModal');
        if (modal) {
            this.populateScheduleFormSelects();
            modal.classList.add('active');
        }
    }

    closeNewScheduleModal() {
        const modal = document.getElementById('newScheduleModal');
        if (modal) modal.classList.remove('active');
    }

    // Gestion des retards
    openDelayModal(departureId) {
        const dep = window.bemaStorage.getDepartureById(departureId);
        if (!dep) return;

        const modal = document.getElementById('delayModal');
        const info = document.getElementById('delayModalTripInfo');
        const idInput = document.getElementById('delayDepartureId');

        if (info) info.innerHTML = `Ligne : <strong>${dep.origin} ➔ ${dep.destination}</strong> (${dep.departureTime}) • Car : <strong>${dep.busPlate}</strong>`;
        if (idInput) idInput.value = departureId;

        if (modal) modal.classList.add('active');
    }

    closeDelayModal() {
        const modal = document.getElementById('delayModal');
        if (modal) modal.classList.remove('active');
    }

    saveDelayUpdate(event) {
        event.preventDefault();
        const id = document.getElementById('delayDepartureId').value;
        const minutes = parseInt(document.getElementById('delayMinutesInput').value) || 0;
        const status = document.getElementById('delayStatusSelect').value;
        const reason = document.getElementById('delayReasonInput').value || "Ralentissement sur l'itinéraire";

        const updated = window.bemaStorage.updateDepartureStatus(id, status, minutes);

        if (updated) {
            // Son d'alerte
            if (window.bemaAudio) window.bemaAudio.playAlertTone();

            // Créer une notification générale pour les clients
            window.bemaStorage.addNotification({
                title: `Mise à jour Horaire : ${updated.tripCode}`,
                message: minutes > 0 ?
                    `Le car ${updated.busPlate} accuse un retard estimé à +${minutes} min. Motif : ${reason}.` :
                    `Le départ ${updated.tripCode} est confirmé à l'heure.`,
                type: minutes > 0 ? "warning" : "info"
            });

            if (window.bemaNotifications) {
                window.bemaNotifications.showToast(`Statut mis à jour pour ${updated.tripCode}`, "info");
            }

            this.closeDelayModal();
            this.renderAdminDashboard();
        }
    }

    // Diffusion d'une alerte aux passagers
    openAlertBroadcastModal(departureId) {
        const dep = window.bemaStorage.getDepartureById(departureId);
        if (!dep) return;

        const modal = document.getElementById('alertBroadcastModal');
        const info = document.getElementById('broadcastTargetInfo');
        const idInput = document.getElementById('broadcastDepartureId');

        if (info) info.innerHTML = `Diffusion ciblée : Passagers du voyage <strong>${dep.tripCode} (${dep.origin} ➔ ${dep.destination})</strong>`;
        if (idInput) idInput.value = departureId;

        if (modal) modal.classList.add('active');
    }

    closeAlertBroadcastModal() {
        const modal = document.getElementById('alertBroadcastModal');
        if (modal) modal.classList.remove('active');
    }

    sendBroadcastAlert(event) {
        event.preventDefault();
        const id = document.getElementById('broadcastDepartureId').value;
        const dep = window.bemaStorage.getDepartureById(id);
        const title = document.getElementById('broadcastTitleInput').value;
        const message = document.getElementById('broadcastMessageInput').value;

        window.bemaStorage.addNotification({
            title: `Message Compagnie BEMA : ${title}`,
            message: message,
            type: "warning"
        });

        if (window.bemaAudio) window.bemaAudio.playStationChime();
        if (window.bemaNotifications) {
            window.bemaNotifications.showToast(`Alerte diffusée aux passagers de ${dep ? dep.tripCode : 'la ligne'}`, "warning");
        }

        this.closeAlertBroadcastModal();
    }

    // Validation du scanner de billet (Embarquement)
    validateScannedTicketInput() {
        const input = document.getElementById('scannerManualInput');
        const ref = input ? input.value.trim() : '';

        if (!ref) {
            alert("Veuillez saisir une référence de billet ou scanner un QR Code.");
            return;
        }

        const result = window.bemaStorage.validateTicketForBoarding(ref);
        this.displayScanResult(result);
    }

    // Raccourci pour scanner le dernier billet réservé
    scanLatestTicketShortcut() {
        const tickets = window.bemaStorage.getTickets();
        if (tickets.length === 0) {
            alert("Aucun billet n'a encore été créé.");
            return;
        }
        const latest = tickets[0];
        const result = window.bemaStorage.validateTicketForBoarding(latest.bookingRef);
        this.displayScanResult(result);
    }

    displayScanResult(result) {
        const display = document.getElementById('scannerResultDisplay');
        if (!display) return;

        if (result.success) {
            if (window.bemaAudio) window.bemaAudio.playSuccessBeep();
            const t = result.ticket;

            display.className = 'scanner-result-box result-success';
            display.innerHTML = `
                <div class="result-header">
                    <div class="result-icon-circle"><i class="fa-solid fa-circle-check"></i></div>
                    <div class="result-title-wrap">
                        <h3>EMBARQUEMENT AUTORISÉ</h3>
                        <span>Billet Officiel BEMA Valide • Composté à l'instant</span>
                    </div>
                </div>
                <div class="result-details-grid">
                    <div><span>Passager :</span> <strong>${t.passenger.fullName}</strong></div>
                    <div><span>Siège Attribué :</span> <strong class="seat-badge-big">N° ${t.seatNumber} (${t.seatLabel || t.seatNumber})</strong></div>
                    <div><span>Ligne :</span> <strong>${t.origin} ➔ ${t.destination}</strong></div>
                    <div><span>Car / Plaque :</span> <strong>${t.busPlate} (${t.busModel})</strong></div>
                    <div><span>Chauffeur :</span> <strong>${t.driver}</strong></div>
                    <div><span>Règlement :</span> <span class="text-emerald">${t.paymentStatus} (${t.totalPaid.toLocaleString()} FCFA)</span></div>
                </div>
            `;
        } else {
            if (window.bemaAudio) window.bemaAudio.playErrorBeep();

            display.className = 'scanner-result-box result-error';
            display.innerHTML = `
                <div class="result-header">
                    <div class="result-icon-circle"><i class="fa-solid fa-circle-xmark"></i></div>
                    <div class="result-title-wrap">
                        <h3>ACCÈS REFUSÉ</h3>
                        <span>${result.message}</span>
                    </div>
                </div>
            `;
        }

        // Rafraîchir les tableaux admin
        this.renderKPIs();
        this.renderDeparturesTable();
    }
}

window.bemaAdmin = new BemaAdmin();

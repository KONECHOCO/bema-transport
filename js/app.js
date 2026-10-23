/**
 * BEMA TRANSPORT - Application Principale & Orchestrateur
 */

class BemaApp {
    constructor() {
        this.currentView = 'bookingSection';
        this.selectedDeparture = null;
        this.selectedSeat = null;
    }

    init() {
        this.startClock();
        this.populateCitySelects();
        this.setDefaultSearchValues();
        this.searchTrips(); // Affiche directement les départs Korhogo -> Abidjan
        this.initEventListeners();
        window.bemaNotifications.init();

        // Écouter les clics en dehors pour fermer le panneau de notification
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notificationsPanel');
            const bell = document.getElementById('btnNotifBell');
            if (panel && panel.classList.contains('active')) {
                if (!panel.contains(e.target) && !bell.contains(e.target)) {
                    window.bemaNotifications.closePanel();
                }
            }
        });
    }

    startClock() {
        const clockElem = document.getElementById('abidjanClock');
        if (!clockElem) return;

        const update = () => {
            const now = new Date();
            // Heure GMT (Côte d'Ivoire est sur le fuseau UTC+0 / GMT)
            const timeStr = now.toLocaleTimeString('fr-FR', {
                timeZone: 'Africa/Abidjan',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            clockElem.innerHTML = `<i class="fa-regular fa-clock"></i> Abidjan (GMT) : <strong>${timeStr}</strong>`;
        };

        update();
        setInterval(update, 1000);
    }

    populateCitySelects() {
        const originSelect = document.getElementById('searchOrigin');
        const destSelect = document.getElementById('searchDest');
        const adminOrigin = document.getElementById('adminNewOrigin');
        const adminDest = document.getElementById('adminNewDest');

        const cities = BEMA_DATA.cities;

        const generateOptions = (selectedId) => {
            return cities.map(c => `
                <option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>
                    ${c.name} (${c.region.split(' ')[0]})
                </option>
            `).join('');
        };

        if (originSelect) originSelect.innerHTML = generateOptions('KORHOGO');
        if (destSelect) destSelect.innerHTML = generateOptions('ABIDJAN');
        if (adminOrigin) adminOrigin.innerHTML = generateOptions('KORHOGO');
        if (adminDest) adminDest.innerHTML = generateOptions('ABIDJAN');
    }

    setDefaultSearchValues() {
        const dateInput = document.getElementById('searchDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
            dateInput.min = today;
        }
    }

    initEventListeners() {
        // Formulaire de recherche
        const searchForm = document.getElementById('tripSearchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.searchTrips();
            });
        }

        // Inverser les villes
        const swapBtn = document.getElementById('btnSwapCities');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => {
                const o = document.getElementById('searchOrigin');
                const d = document.getElementById('searchDest');
                if (o && d) {
                    const temp = o.value;
                    o.value = d.value;
                    d.value = temp;
                    this.searchTrips();
                }
            });
        }

        // Formulaire infos passager
        const passengerForm = document.getElementById('passengerDetailsForm');
        if (passengerForm) {
            passengerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.proceedToPayment();
            });
        }
    }

    showSection(sectionId) {
        // Cacher toutes les sections
        const sections = document.querySelectorAll('.app-section');
        sections.forEach(sec => sec.classList.remove('active'));

        // Afficher la section cible
        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.add('active');
            this.currentView = sectionId;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Mettre à jour la navigation active
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Actions spécifiques au changement de vue
        if (sectionId === 'liveTrackingSection') {
            setTimeout(() => {
                window.bemaMap.initMap();
            }, 100);
        } else if (sectionId === 'myTicketsSection') {
            window.bemaTicket.renderMyTicketsList();
        } else if (sectionId === 'adminSection') {
            window.bemaAdmin.renderAdminDashboard();
        }
    }

    searchTrips() {
        const originId = document.getElementById('searchOrigin').value;
        const destId = document.getElementById('searchDest').value;
        const travelDate = document.getElementById('searchDate').value;
        const passengersCount = parseInt(document.getElementById('searchPassengers').value) || 1;

        const resultsContainer = document.getElementById('tripResultsContainer');
        const resultsCountBadge = document.getElementById('resultsCountBadge');
        if (!resultsContainer) return;

        const allDepartures = window.bemaStorage.getDepartures();

        // Filtrer selon origine et destination
        const filtered = allDepartures.filter(dep => {
            const matchesOrigin = dep.origin.toUpperCase().includes(originId.toUpperCase()) || dep.origin === originId;
            const matchesDest = dep.destination.toUpperCase().includes(destId.toUpperCase()) || dep.destination === destId;
            return matchesOrigin && matchesDest;
        });

        if (resultsCountBadge) {
            resultsCountBadge.textContent = `${filtered.length} départs disponibles`;
        }

        if (filtered.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-trips-card">
                    <i class="fa-solid fa-route"></i>
                    <h4>Aucun départ direct trouvé pour cet itinéraire</h4>
                    <p>Essayez une autre date ou consultez les liaisons phares comme <strong>Korhogo ➔ Abidjan</strong> ou <strong>Bouaké ➔ Abidjan</strong>.</p>
                    <button type="button" class="btn btn-outline" onclick="bemaApp.resetSearchToKorhogoAbidjan()">
                        Voir la ligne Korhogo ➔ Abidjan (10 000 FCFA)
                    </button>
                </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach(dep => {
            const occupiedCount = (dep.occupiedSeats || []).length;
            const availableSeats = (dep.totalSeats || 48) - occupiedCount;
            const isAlmostFull = availableSeats <= 10;
            const isCurrentlyTracking = dep.status === 'en_route';

            html += `
                <div class="trip-card ${isCurrentlyTracking ? 'card-live-tracking' : ''}">
                    ${isCurrentlyTracking ? `
                        <div class="live-tracking-ribbon">
                            <span class="live-dot-green"></span>
                            <span>EN ROUTE ACTUELLEMENT • RADAR ACTIF</span>
                        </div>
                    ` : ''}

                    <div class="trip-card-main">
                        <!-- Colonne 1 : Compagnie & Type -->
                        <div class="trip-brand-col">
                            <span class="trip-code-pill">${dep.tripCode}</span>
                            <strong class="bus-model-name">${dep.busModel}</strong>
                            <span class="bus-plate-sub">${dep.busPlate}</span>
                            <div class="amenities-icons-list">
                                <span title="Climatisation grand froid"><i class="fa-solid fa-snowflake"></i></span>
                                <span title="Wi-Fi 4G gratuit"><i class="fa-solid fa-wifi"></i></span>
                                <span title="Prises USB"><i class="fa-solid fa-plug"></i></span>
                                <span title="Toilettes à bord"><i class="fa-solid fa-restroom"></i></span>
                            </div>
                        </div>

                        <!-- Colonne 2 : Horaires & Trajet (Style Flixbus) -->
                        <div class="trip-timeline-col">
                            <div class="timeline-station departure">
                                <span class="time-big">${dep.departureTime}</span>
                                <div class="station-meta">
                                    <strong class="city-name">${dep.origin}</strong>
                                    <span class="station-name">${dep.originStation}</span>
                                </div>
                            </div>

                            <div class="timeline-graphic">
                                <span class="duration-text"><i class="fa-regular fa-clock"></i> ${dep.duration}</span>
                                <div class="track-bar">
                                    <span class="track-dot start"></span>
                                    <span class="track-line"></span>
                                    <i class="fa-solid fa-bus track-bus-icon"></i>
                                    <span class="track-dot end"></span>
                                </div>
                                <span class="direct-sub">Ligne Directe A3</span>
                            </div>

                            <div class="timeline-station arrival">
                                <span class="time-big">${dep.arrivalTime}</span>
                                <div class="station-meta">
                                    <strong class="city-name">${dep.destination}</strong>
                                    <span class="station-name">${dep.destinationStation}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Colonne 3 : Prix & Réservation -->
                        <div class="trip-pricing-col">
                            <div class="price-box">
                                <span class="price-from-label">Tarif par voyageur</span>
                                <div class="price-amount-wrap">
                                    <strong class="price-amount">${dep.price.toLocaleString()}</strong>
                                    <span class="price-currency">FCFA</span>
                                </div>
                                <span class="seats-left-tag ${isAlmostFull ? 'urgent' : ''}">
                                    <i class="fa-solid fa-couch"></i> ${availableSeats} places restantes
                                </span>
                            </div>

                            <button type="button" class="btn btn-primary btn-select-trip" onclick="bemaApp.openSeatSelection('${dep.id}')">
                                <span>Choisir mon siège</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Barre des services inclus -->
                    <div class="trip-card-footer">
                        <div class="inclusions-row">
                            <span><i class="fa-solid fa-circle-check text-emerald"></i> 1 Bagage en soute 23kg + 1 Bagage à main inclus</span>
                            <span><i class="fa-solid fa-circle-check text-emerald"></i> Paiement Mobile Money Wave, OM, MoMo ou En Gare</span>
                            <span><i class="fa-solid fa-circle-check text-emerald"></i> Billet électronique avec QR Code sécurisé</span>
                        </div>
                    </div>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
    }

    resetSearchToKorhogoAbidjan() {
        document.getElementById('searchOrigin').value = 'KORHOGO';
        document.getElementById('searchDest').value = 'ABIDJAN';
        this.searchTrips();
    }

    openSeatSelection(departureId) {
        const dep = window.bemaStorage.getDepartureById(departureId);
        if (!dep) return;

        this.selectedDeparture = dep;

        // Ouvrir la vue de sélection de siège
        const seatModal = document.getElementById('seatSelectionModal');
        if (seatModal) {
            seatModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Rendre le plan de bus interactif
            window.bemaSeatMap.render(dep, (seat, departure) => {
                this.onSeatChosen(seat, departure);
            });
        }
    }

    closeSeatSelectionModal() {
        const seatModal = document.getElementById('seatSelectionModal');
        if (seatModal) {
            seatModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    onSeatChosen(seat, departure) {
        this.selectedSeat = seat;
        this.closeSeatSelectionModal();

        // Ouvrir le formulaire d'informations passager
        this.openPassengerFormModal();
    }

    openPassengerFormModal() {
        const modal = document.getElementById('passengerModal');
        const summaryBox = document.getElementById('passengerTripSummary');
        if (!modal) return;

        const dep = this.selectedDeparture;
        const seat = this.selectedSeat;

        if (summaryBox && dep && seat) {
            summaryBox.innerHTML = `
                <div class="mini-summary-pill">
                    <div>
                        <span class="label">Trajet :</span>
                        <strong>${dep.origin} ➔ ${dep.destination} (${dep.departureTime})</strong>
                    </div>
                    <div>
                        <span class="label">Siège :</span>
                        <strong class="text-emerald">N° ${seat.label} (${seat.desc})</strong>
                    </div>
                    <div>
                        <span class="label">Montant Total :</span>
                        <strong class="price-tag-highlight">${seat.totalPrice.toLocaleString()} FCFA</strong>
                    </div>
                </div>
            `;
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closePassengerModal() {
        const modal = document.getElementById('passengerModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    proceedToPayment() {
        const fullName = document.getElementById('passFullName').value.trim();
        const phone = document.getElementById('passPhone').value.trim();
        const idCard = document.getElementById('passIdCard').value.trim();
        const email = document.getElementById('passEmail').value.trim();

        if (!fullName || !phone) {
            alert("Veuillez renseigner votre Nom complet et votre Numéro de téléphone pour la réservation.");
            return;
        }

        const bookingData = {
            departure: this.selectedDeparture,
            seat: this.selectedSeat,
            passenger: {
                fullName: fullName,
                phone: phone,
                idCard: idCard || "CNI CI-2026-VALIDE",
                email: email
            },
            travelDate: document.getElementById('searchDate').value
        };

        this.closePassengerModal();

        // Ouvrir la passerelle de paiement Mobile Money
        window.bemaPayment.openPaymentModal(bookingData);
    }
}

window.bemaApp = new BemaApp();

// Démarrer l'application dès le chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    window.bemaApp.init();
});

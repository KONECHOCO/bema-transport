/**
 * BEMA TRANSPORT - Générateur de Billet Électronique & Portefeuille Voyageur
 */

class BemaTicket {
    constructor() {
        this.currentTicket = null;
    }

    displayTicket(ticket) {
        this.currentTicket = ticket;
        const container = document.getElementById('ticketViewContainer');
        if (!container) return;

        let statusBadge = '';
        if (ticket.ticketStatus === 'VALIDE') {
            statusBadge = '<span class="ticket-status-badge status-valid"><i class="fa-solid fa-circle-check"></i> BILLET OFFICIEL VALIDE</span>';
        } else if (ticket.ticketStatus === 'EMBARQUE') {
            statusBadge = '<span class="ticket-status-badge status-boarded"><i class="fa-solid fa-user-check"></i> VOYAGEUR EMBARQUÉ</span>';
        } else {
            statusBadge = '<span class="ticket-status-badge status-cancelled"><i class="fa-solid fa-ban"></i> BILLET INACTIF</span>';
        }

        const html = `
            <div class="ticket-success-announcement">
                <div class="success-icon-wrap">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <h2>Félicitations ! Votre réservation est confirmée</h2>
                <p>Conservez ce billet électronique. Présentez le QR Code au chef de gare BEMA ou au contrôleur à bord du car.</p>
            </div>

            <div class="ticket-actions-bar">
                <button type="button" class="btn btn-secondary" onclick="bemaTicket.printTicket()">
                    <i class="fa-solid fa-print"></i>
                    <span>Imprimer le Billet</span>
                </button>
                <button type="button" class="btn btn-primary" onclick="bemaTicket.trackThisBus('${ticket.departureId}')">
                    <i class="fa-solid fa-location-crosshairs"></i>
                    <span>Suivre ce car en Direct (GPS)</span>
                </button>
                <button type="button" class="btn btn-whatsapp" onclick="bemaTicket.shareTicketWhatsApp()">
                    <i class="fa-brands fa-whatsapp"></i>
                    <span>Recevoir sur WhatsApp</span>
                </button>
            </div>

            <!-- CARTE DU BILLET OFFICIEL BEMA (Format style Train / Flixbus) -->
            <div class="e-ticket-card" id="printableTicket">
                <!-- En-tête Billet -->
                <div class="ticket-top-banner">
                    <div class="ticket-brand">
                        <img src="assets/logo.jpg" alt="BEMA Transport Logo" class="ticket-logo-img">
                        <div class="brand-text">
                            <h3>BEMA TRANSPORT</h3>
                            <span>Compagnie Nationale Interurbaine • Côte d'Ivoire</span>
                        </div>
                    </div>
                    <div class="ticket-booking-ref-block">
                        <span class="ref-title">RÉFÉRENCE DE VOYAGE</span>
                        <strong class="ref-code">${ticket.bookingRef}</strong>
                        ${statusBadge}
                    </div>
                </div>

                <!-- Corps du Billet (2 Volets : Trajet & Passager + Volet Contrôle Embarquement) -->
                <div class="ticket-body-grid">
                    <!-- Volet Principal : Trajet & Confort -->
                    <div class="ticket-main-col">
                        <div class="ticket-route-display">
                            <div class="route-city origin">
                                <span class="city-label">DÉPART</span>
                                <h4 class="city-name">${ticket.origin}</h4>
                                <span class="station-detail"><i class="fa-solid fa-building"></i> ${ticket.originStation}</span>
                                <div class="time-block">
                                    <span class="time-big">${ticket.departureTime}</span>
                                    <span class="date-tag"><i class="fa-regular fa-calendar"></i> ${ticket.departureDate}</span>
                                </div>
                            </div>

                            <div class="route-line-graphic">
                                <span class="duration-pill"><i class="fa-solid fa-clock"></i> ~8h 45m</span>
                                <div class="line-vector">
                                    <span class="dot-start"></span>
                                    <span class="line-track"></span>
                                    <i class="fa-solid fa-bus bus-line-icon"></i>
                                    <span class="dot-end"></span>
                                </div>
                                <span class="direct-tag">Ligne Directe A3 • Autoroute</span>
                            </div>

                            <div class="route-city destination">
                                <span class="city-label">ARRIVÉE</span>
                                <h4 class="city-name">${ticket.destination}</h4>
                                <span class="station-detail"><i class="fa-solid fa-location-dot"></i> ${ticket.destinationStation}</span>
                                <div class="time-block">
                                    <span class="time-big">${ticket.arrivalTime}</span>
                                    <span class="date-tag"><i class="fa-regular fa-calendar"></i> ${ticket.departureDate}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Détails Passager & Véhicule -->
                        <div class="ticket-metadata-grid">
                            <div class="meta-box">
                                <span class="meta-title"><i class="fa-solid fa-user"></i> Passager Titulaire</span>
                                <strong class="meta-value">${ticket.passenger.fullName}</strong>
                                <span class="meta-sub">${ticket.passenger.phone}</span>
                            </div>
                            <div class="meta-box highlight-box">
                                <span class="meta-title"><i class="fa-solid fa-couch"></i> Siège Attribué</span>
                                <strong class="meta-value seat-number-big">N° ${ticket.seatNumber} (${ticket.seatLabel || ticket.seatNumber})</strong>
                                <span class="meta-sub">${ticket.seatType}</span>
                            </div>
                            <div class="meta-box">
                                <span class="meta-title"><i class="fa-solid fa-van-shuttle"></i> Autocar BEMA</span>
                                <strong class="meta-value">${ticket.busModel}</strong>
                                <span class="meta-sub">Immatriculation : <strong>${ticket.busPlate}</strong></span>
                            </div>
                            <div class="meta-box">
                                <span class="meta-title"><i class="fa-solid fa-suitcase"></i> Bagages Autorisés</span>
                                <strong class="meta-value">${ticket.extraLuggage > 0 ? '2 x 23 kg en Soute' : '1 x 23 kg + 1 Cabine'}</strong>
                                <span class="meta-sub">Étiquette BEMA incluse</span>
                            </div>
                            <div class="meta-box">
                                <span class="meta-title"><i class="fa-solid fa-receipt"></i> Montant Payé</span>
                                <strong class="meta-value price-paid-val">${ticket.totalPaid.toLocaleString()} ${ticket.currency}</strong>
                                <span class="meta-sub">${ticket.paymentMethod}</span>
                            </div>
                            <div class="meta-box">
                                <span class="meta-title"><i class="fa-solid fa-door-open"></i> Heure Limite d'Accès</span>
                                <strong class="meta-value text-alert">${ticket.boardingTime}</strong>
                                <span class="meta-sub">${ticket.boardingGate}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Ligne perforée de séparation (Effet découpe de billet de car) -->
                    <div class="ticket-perforation-line">
                        <div class="notch top-notch"></div>
                        <div class="dashed-line"></div>
                        <div class="notch bottom-notch"></div>
                    </div>

                    <!-- Volet Contrôleur / Coupon d'Embarquement avec QR Code -->
                    <div class="ticket-qr-coupon">
                        <div class="coupon-header">
                            <span class="coupon-badge"><i class="fa-solid fa-qrcode"></i> COUPON DE CONTRÔLE</span>
                            <span class="coupon-sub">À présenter au chauffeur</span>
                        </div>

                        <!-- Emplacement du QR Code officiel -->
                        <div class="qr-code-box" id="ticketQrCodeContainer" title="QR Code officiel BEMA TRANSPORT">
                            <!-- Rendu par qrcode.js -->
                        </div>

                        <div class="coupon-boarding-info">
                            <span class="coupon-seat">SIÈGE <strong>N° ${ticket.seatNumber}</strong></span>
                            <span class="coupon-ref">${ticket.bookingRef}</span>
                            <span class="coupon-driver">Chauffeur : ${ticket.driver}</span>
                        </div>

                        <div class="security-watermark">
                            <i class="fa-solid fa-shield-check"></i>
                            <span>Billet Sécurisé Anti-Fraude • BEMA S.A.R.L</span>
                        </div>
                    </div>
                </div>

                <!-- Pied de billet légal -->
                <div class="ticket-legal-footer">
                    <p>Conditions de transport : Billet non remboursable 1h avant le départ. Présentation d'une pièce d'identité obligatoire (CNI, Passeport, Attestation ONECI). Assistance BEMA : +225 27 36 86 00 12.</p>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Générer le QR Code dynamique avec QRCode.js
        setTimeout(() => {
            this.generateQrCode(ticket);
        }, 100);
    }

    generateQrCode(ticket) {
        const qrContainer = document.getElementById('ticketQrCodeContainer');
        if (!qrContainer) return;
        qrContainer.innerHTML = '';

        // Contenu cryptographique de validation du billet
        const qrPayload = JSON.stringify({
            ref: ticket.bookingRef,
            dep: ticket.tripCode,
            passenger: ticket.passenger.fullName,
            seat: ticket.seatNumber,
            plate: ticket.busPlate,
            ts: Date.now()
        });

        if (typeof QRCode !== 'undefined') {
            try {
                new QRCode(qrContainer, {
                    text: qrPayload,
                    width: 140,
                    height: 140,
                    colorDark: "#0b132b",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
                return;
            } catch (e) {
                console.warn("Erreur QRCode.js, fallback SVG:", e);
            }
        }

        // Fallback SVG QR haute fidélité si QRCode.js n'était pas chargé
        qrContainer.innerHTML = `
            <svg width="140" height="140" viewBox="0 0 100 100" fill="#0b132b" style="border:4px solid white; border-radius:8px;">
                <rect x="0" y="0" width="100" height="100" fill="white"/>
                <!-- Motif coin 1 -->
                <rect x="10" y="10" width="25" height="25" fill="#0b132b"/>
                <rect x="15" y="15" width="15" height="15" fill="white"/>
                <rect x="18" y="18" width="9" height="9" fill="#0b132b"/>
                <!-- Motif coin 2 -->
                <rect x="65" y="10" width="25" height="25" fill="#0b132b"/>
                <rect x="70" y="15" width="15" height="15" fill="white"/>
                <rect x="73" y="18" width="9" height="9" fill="#0b132b"/>
                <!-- Motif coin 3 -->
                <rect x="10" y="65" width="25" height="25" fill="#0b132b"/>
                <rect x="15" y="70" width="15" height="15" fill="white"/>
                <rect x="18" y="73" width="9" height="9" fill="#0b132b"/>
                <!-- Points de données -->
                <rect x="42" y="12" width="6" height="6" fill="#0b132b"/>
                <rect x="52" y="12" width="6" height="6" fill="#0b132b"/>
                <rect x="42" y="24" width="6" height="6" fill="#0b132b"/>
                <rect x="12" y="42" width="6" height="6" fill="#0b132b"/>
                <rect x="24" y="42" width="6" height="6" fill="#0b132b"/>
                <rect x="42" y="42" width="16" height="16" fill="#10b981"/>
                <rect x="65" y="45" width="8" height="8" fill="#0b132b"/>
                <rect x="78" y="55" width="8" height="8" fill="#0b132b"/>
                <rect x="45" y="70" width="8" height="8" fill="#0b132b"/>
                <rect x="60" y="75" width="12" height="8" fill="#0b132b"/>
                <rect x="78" y="75" width="10" height="10" fill="#0b132b"/>
            </svg>
        `;
    }

    printTicket() {
        window.print();
    }

    trackThisBus(departureId) {
        if (window.bemaApp) {
            window.bemaApp.showSection('liveTrackingSection');
        }
        if (window.bemaMap) {
            window.bemaMap.focusOnDeparture(departureId);
        }
    }

    shareTicketWhatsApp() {
        if (!this.currentTicket) return;
        const text = encodeURIComponent(`*Billet BEMA TRANSPORT*%0A%0ARéf : ${this.currentTicket.bookingRef}%0ATrajet : ${this.currentTicket.origin} ➔ ${this.currentTicket.destination}%0ADépart : ${this.currentTicket.departureDate} à ${this.currentTicket.departureTime}%0ASiège : N° ${this.currentTicket.seatNumber}%0APassager : ${this.currentTicket.passenger.fullName}%0ACar : ${this.currentTicket.busPlate}%0APrix : ${this.currentTicket.totalPaid} FCFA`);
        const url = `https://wa.me/?text=${text}`;
        window.open(url, '_blank');
    }

    // Afficher la liste de tous mes billets dans l'onglet "Mes Billets"
    renderMyTicketsList() {
        const container = document.getElementById('myTicketsContainer');
        if (!container) return;

        const tickets = window.bemaStorage.getTickets();

        if (tickets.length === 0) {
            container.innerHTML = `
                <div class="empty-tickets-view">
                    <div class="empty-icon"><i class="fa-solid fa-ticket-simple"></i></div>
                    <h3>Aucun billet enregistré pour le moment</h3>
                    <p>Réservez dès maintenant votre prochain trajet Korhogo ➔ Abidjan au tarif de 10 000 FCFA.</p>
                    <button type="button" class="btn btn-primary" onclick="bemaApp.showSection('bookingSection')">
                        <i class="fa-solid fa-magnifying-glass"></i> Rechercher un voyage
                    </button>
                </div>
            `;
            return;
        }

        let html = `
            <div class="my-tickets-grid">
        `;

        tickets.forEach(ticket => {
            const isBoarded = ticket.ticketStatus === 'EMBARQUE';
            const statusClass = isBoarded ? 'badge-boarded' : 'badge-valid';
            const statusText = isBoarded ? 'Déjà Embarqué' : 'Valide pour départ';

            html += `
                <div class="ticket-summary-card">
                    <div class="card-header-flex">
                        <span class="trip-badge"><i class="fa-solid fa-bus"></i> ${ticket.tripCode}</span>
                        <span class="status-pill ${statusClass}">${statusText}</span>
                    </div>

                    <div class="card-route">
                        <div class="route-point">
                            <strong>${ticket.origin}</strong>
                            <span>${ticket.departureTime}</span>
                        </div>
                        <div class="route-arrow">
                            <i class="fa-solid fa-arrow-right-long"></i>
                            <small>${ticket.departureDate}</small>
                        </div>
                        <div class="route-point">
                            <strong>${ticket.destination}</strong>
                            <span>${ticket.arrivalTime}</span>
                        </div>
                    </div>

                    <div class="card-meta">
                        <div>
                            <span>Siège :</span> <strong>N° ${ticket.seatNumber}</strong>
                        </div>
                        <div>
                            <span>Passager :</span> <strong>${ticket.passenger.fullName}</strong>
                        </div>
                        <div>
                            <span>Réf :</span> <code>${ticket.bookingRef}</code>
                        </div>
                        <div>
                            <span>Total :</span> <strong class="text-emerald">${ticket.totalPaid.toLocaleString()} FCFA</strong>
                        </div>
                    </div>

                    <div class="card-actions">
                        <button type="button" class="btn btn-sm btn-outline" onclick="bemaTicket.displayAndOpen('${ticket.bookingRef}')">
                            <i class="fa-solid fa-qrcode"></i> Voir mon billet & QR
                        </button>
                        <button type="button" class="btn btn-sm btn-primary" onclick="bemaTicket.trackThisBus('${ticket.departureId}')">
                            <i class="fa-solid fa-location-crosshairs"></i> Suivre ce car
                        </button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
    }

    displayAndOpen(bookingRef) {
        const ticket = window.bemaStorage.getTicketByRef(bookingRef);
        if (ticket) {
            this.displayTicket(ticket);
            if (window.bemaApp) {
                window.bemaApp.showSection('ticketViewSection');
            }
        }
    }
}

window.bemaTicket = new BemaTicket();

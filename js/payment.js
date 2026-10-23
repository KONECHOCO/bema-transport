/**
 * BEMA TRANSPORT - Passerelle de Paiement Mobile Money Côte d'Ivoire
 * Simulation réaliste : Wave, Orange Money, MTN MoMo, Moov Money, Carte & Espèces
 */

class BemaPayment {
    constructor() {
        this.currentBookingData = null;
        this.selectedMethod = 'wave';
    }

    openPaymentModal(bookingData) {
        this.currentBookingData = bookingData;
        const modal = document.getElementById('paymentModal');
        if (!modal) return;

        this.renderModalContent();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closePaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    selectMethod(methodId) {
        this.selectedMethod = methodId;
        const tabs = document.querySelectorAll('.pay-method-tab');
        tabs.forEach(tab => {
            if (tab.dataset.method === methodId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        this.renderMethodBody(methodId);
    }

    renderModalContent() {
        const modalContainer = document.getElementById('paymentModalContent');
        if (!modalContainer) return;

        const data = this.currentBookingData;
        const dep = data.departure;
        const seat = data.seat;
        const passenger = data.passenger;

        let html = `
            <div class="modal-card payment-modal-card">
                <div class="modal-header">
                    <div class="header-titles">
                        <span class="badge-operator-secure"><i class="fa-solid fa-shield-halved"></i> Paiement 100% Sécurisé CI</span>
                        <h3>Paiement de votre Billet BEMA</h3>
                        <p>Trajet : <strong>${dep.origin} ➔ ${dep.destination}</strong> • Siège N° <strong>${seat.label}</strong></p>
                    </div>
                    <button type="button" class="btn-close-modal" onclick="bemaPayment.closePaymentModal()" title="Fermer">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- Résumé commande -->
                    <div class="payment-order-summary">
                        <div class="summary-line">
                            <span>Voyageur :</span>
                            <strong>${passenger.fullName} (${passenger.phone})</strong>
                        </div>
                        <div class="summary-line">
                            <span>Départ :</span>
                            <span>${dep.originStation} à <strong>${dep.departureTime}</strong></span>
                        </div>
                        <div class="summary-line">
                            <span>Car & Chauffeur :</span>
                            <span>${dep.busModel} (${dep.busPlate})</span>
                        </div>
                        <div class="summary-line total-highlight">
                            <span>Montant net à régler :</span>
                            <span class="price-big-text">${seat.totalPrice.toLocaleString()} FCFA</span>
                        </div>
                    </div>

                    <!-- Onglets des opérateurs ivoiriens -->
                    <div class="payment-methods-selector">
                        <label class="methods-title">Choisissez votre moyen de paiement :</label>
                        <div class="pay-methods-grid">
                            <button type="button" class="pay-method-tab ${this.selectedMethod === 'wave' ? 'active' : ''}" data-method="wave" onclick="bemaPayment.selectMethod('wave')">
                                <div class="method-icon wave-icon"><i class="fa-solid fa-water"></i></div>
                                <div class="method-info">
                                    <span class="method-name">Wave CI</span>
                                    <span class="method-tag tag-free">0% Frais</span>
                                </div>
                            </button>
                            <button type="button" class="pay-method-tab ${this.selectedMethod === 'orange' ? 'active' : ''}" data-method="orange" onclick="bemaPayment.selectMethod('orange')">
                                <div class="method-icon orange-icon"><i class="fa-solid fa-mobile-screen-button"></i></div>
                                <div class="method-info">
                                    <span class="method-name">Orange Money</span>
                                    <span class="method-tag">#144#</span>
                                </div>
                            </button>
                            <button type="button" class="pay-method-tab ${this.selectedMethod === 'mtn' ? 'active' : ''}" data-method="mtn" onclick="bemaPayment.selectMethod('mtn')">
                                <div class="method-icon mtn-icon"><i class="fa-solid fa-bolt"></i></div>
                                <div class="method-info">
                                    <span class="method-name">MTN MoMo</span>
                                    <span class="method-tag">Push direct</span>
                                </div>
                            </button>
                            <button type="button" class="pay-method-tab ${this.selectedMethod === 'moov' ? 'active' : ''}" data-method="moov" onclick="bemaPayment.selectMethod('moov')">
                                <div class="method-icon moov-icon"><i class="fa-solid fa-wallet"></i></div>
                                <div class="method-info">
                                    <span class="method-name">Moov Flooz</span>
                                    <span class="method-tag">Code *155#</span>
                                </div>
                            </button>
                            <button type="button" class="pay-method-tab ${this.selectedMethod === 'card' ? 'active' : ''}" data-method="card" onclick="bemaPayment.selectMethod('card')">
                                <div class="method-icon card-icon"><i class="fa-solid fa-credit-card"></i></div>
                                <div class="method-info">
                                    <span class="method-name">Carte Bancaire</span>
                                    <span class="method-tag">Visa / MC</span>
                                </div>
                            </button>
                            <button type="button" class="pay-method-tab ${this.selectedMethod === 'cash' ? 'active' : ''}" data-method="cash" onclick="bemaPayment.selectMethod('cash')">
                                <div class="method-icon cash-icon"><i class="fa-solid fa-money-bill-wave"></i></div>
                                <div class="method-info">
                                    <span class="method-name">En Gare</span>
                                    <span class="method-tag">Espèces</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Zone de saisie dynamique selon opérateur -->
                    <div class="payment-method-body" id="paymentMethodBody">
                        <!-- Rempli par renderMethodBody -->
                    </div>

                    <!-- Écran animé de traitement de transaction -->
                    <div class="transaction-processing-view" id="transactionProcessingView" style="display:none;">
                        <div class="processing-spinner">
                            <div class="double-bounce1"></div>
                            <div class="double-bounce2"></div>
                        </div>
                        <h4 id="processingStatusTitle">Connexion à la passerelle de paiement...</h4>
                        <p id="processingStatusDesc">Veuillez ne pas fermer cette fenêtre. Une demande d'autorisation est en cours sur votre téléphone mobile.</p>
                        <div class="simulation-progress-bar">
                            <div class="progress-fill" id="transactionProgressFill"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modalContainer.innerHTML = html;
        this.renderMethodBody(this.selectedMethod);
    }

    renderMethodBody(methodId) {
        const container = document.getElementById('paymentMethodBody');
        if (!container) return;

        const defaultPhone = this.currentBookingData?.passenger?.phone || "+225 ";

        let bodyHtml = '';

        if (methodId === 'wave') {
            bodyHtml = `
                <div class="method-box wave-box">
                    <div class="wave-header">
                        <div class="wave-logo-badge"><i class="fa-solid fa-water"></i> Wave Côte d'Ivoire</div>
                        <span class="wave-pill">Paiement Sans Contact</span>
                    </div>
                    <div class="wave-content">
                        <div class="wave-qr-mockup">
                            <div class="mock-qr-code">
                                <i class="fa-solid fa-qrcode"></i>
                                <span>Code BEMA-PAY</span>
                            </div>
                            <span class="scan-instruction">Scannez avec l'app Wave ou validez ci-dessous</span>
                        </div>
                        <div class="wave-form-inputs">
                            <div class="form-group">
                                <label for="wavePhone"><i class="fa-solid fa-phone"></i> Numéro de compte Wave CI :</label>
                                <input type="tel" id="wavePhone" class="form-input" value="${defaultPhone}" placeholder="+225 07 XX XX XX XX">
                                <small class="form-hint">Vous recevrez une notification instantanée sur votre smartphone.</small>
                            </div>
                            <button type="button" class="btn btn-wave-pay" onclick="bemaPayment.processPayment('wave')">
                                <i class="fa-solid fa-lock"></i>
                                <span>Valider le paiement de ${this.currentBookingData.seat.totalPrice.toLocaleString()} FCFA avec Wave</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else if (methodId === 'orange') {
            bodyHtml = `
                <div class="method-box orange-box">
                    <div class="provider-banner orange-banner">
                        <i class="fa-solid fa-mobile-screen-button"></i> Orange Money Côte d'Ivoire
                    </div>
                    <div class="form-group">
                        <label for="omPhone">Numéro de téléphone Orange Money :</label>
                        <input type="tel" id="omPhone" class="form-input" value="${defaultPhone}" placeholder="+225 07 XX XX XX XX">
                    </div>
                    <div class="form-group">
                        <label for="omOtp">Code d'autorisation temporaire (Tapez #144# sur votre mobile pour l'obtenir) :</label>
                        <input type="text" id="omOtp" class="form-input" placeholder="Ex: 849201" maxlength="6" value="849201">
                        <small class="form-hint">Composez <strong>#144*82#</strong> pour générer votre code de paiement sécurisé.</small>
                    </div>
                    <button type="button" class="btn btn-orange-pay" onclick="bemaPayment.processPayment('orange')">
                        <i class="fa-solid fa-lock"></i>
                        <span>Confirmer avec Orange Money (${this.currentBookingData.seat.totalPrice.toLocaleString()} FCFA)</span>
                    </button>
                </div>
            `;
        } else if (methodId === 'mtn') {
            bodyHtml = `
                <div class="method-box mtn-box">
                    <div class="provider-banner mtn-banner">
                        <i class="fa-solid fa-bolt"></i> MTN Mobile Money Côte d'Ivoire (MoMo)
                    </div>
                    <div class="form-group">
                        <label for="mtnPhone">Numéro de téléphone MTN MoMo :</label>
                        <input type="tel" id="mtnPhone" class="form-input" value="${defaultPhone}" placeholder="+225 05 XX XX XX XX">
                        <small class="form-hint">Un message d'approbation s'affichera directement sur votre téléphone pour saisir votre code PIN.</small>
                    </div>
                    <button type="button" class="btn btn-mtn-pay" onclick="bemaPayment.processPayment('mtn')">
                        <i class="fa-solid fa-shield-halved"></i>
                        <span>Envoyer la demande de débit MTN MoMo</span>
                    </button>
                </div>
            `;
        } else if (methodId === 'moov') {
            bodyHtml = `
                <div class="method-box moov-box">
                    <div class="provider-banner moov-banner">
                        <i class="fa-solid fa-wallet"></i> Moov Money CI (Flooz)
                    </div>
                    <div class="form-group">
                        <label for="moovPhone">Numéro Moov Money :</label>
                        <input type="tel" id="moovPhone" class="form-input" value="${defaultPhone}" placeholder="+225 01 XX XX XX XX">
                        <small class="form-hint">Composez *155# pour approuver la transaction BEMA TRANSPORT.</small>
                    </div>
                    <button type="button" class="btn btn-moov-pay" onclick="bemaPayment.processPayment('moov')">
                        <i class="fa-solid fa-lock"></i>
                        <span>Payer ${this.currentBookingData.seat.totalPrice.toLocaleString()} FCFA avec Moov Money</span>
                    </button>
                </div>
            `;
        } else if (methodId === 'card') {
            bodyHtml = `
                <div class="method-box card-box">
                    <div class="provider-banner card-banner">
                        <i class="fa-solid fa-credit-card"></i> Carte Visa / Mastercard / UBA
                    </div>
                    <div class="form-group">
                        <label for="cardNumber">Numéro de carte bancaire :</label>
                        <input type="text" id="cardNumber" class="form-input" placeholder="4532 •••• •••• 8920" value="4532 9912 8412 8920">
                    </div>
                    <div class="form-row-2">
                        <div class="form-group">
                            <label for="cardExp">Date d'expiration :</label>
                            <input type="text" id="cardExp" class="form-input" placeholder="MM/AA" value="12/28">
                        </div>
                        <div class="form-group">
                            <label for="cardCvv">Cryptogramme CVV :</label>
                            <input type="password" id="cardCvv" class="form-input" placeholder="123" value="789" maxlength="3">
                        </div>
                    </div>
                    <button type="button" class="btn btn-card-pay" onclick="bemaPayment.processPayment('card')">
                        <i class="fa-solid fa-lock"></i>
                        <span>Payer ${this.currentBookingData.seat.totalPrice.toLocaleString()} FCFA par Carte</span>
                    </button>
                </div>
            `;
        } else if (methodId === 'cash') {
            bodyHtml = `
                <div class="method-box cash-box">
                    <div class="provider-banner cash-banner">
                        <i class="fa-solid fa-building-columns"></i> Réservation & Paiement en Gare BEMA
                    </div>
                    <p class="cash-desc">
                        Votre place <strong>Siège N° ${this.currentBookingData.seat.label}</strong> sera réservée pendant <strong>2 heures</strong>. 
                        Vous devez vous présenter à la <strong>${this.currentBookingData.departure.originStation}</strong> au guichet n°1 au moins 45 minutes avant le départ pour régler la somme de <strong>${this.currentBookingData.seat.totalPrice.toLocaleString()} FCFA</strong> en espèces et retirer votre e-billet composté.
                    </p>
                    <button type="button" class="btn btn-cash-pay" onclick="bemaPayment.processPayment('cash')">
                        <i class="fa-solid fa-check"></i>
                        <span>Confirmer ma réservation avec paiement en gare</span>
                    </button>
                </div>
            `;
        }

        container.innerHTML = bodyHtml;
    }

    processPayment(methodId) {
        const body = document.getElementById('paymentMethodBody');
        const processing = document.getElementById('transactionProcessingView');
        const title = document.getElementById('processingStatusTitle');
        const desc = document.getElementById('processingStatusDesc');
        const fill = document.getElementById('transactionProgressFill');

        if (body) body.style.display = 'none';
        if (processing) processing.style.display = 'block';

        // Étape 1
        let progress = 15;
        if (fill) fill.style.width = `${progress}%`;
        if (title) title.textContent = "Connexion sécurisée avec l'opérateur...";

        setTimeout(() => {
            // Étape 2
            progress = 55;
            if (fill) fill.style.width = `${progress}%`;
            if (title) title.textContent = methodId === 'cash' ? "Enregistrement de la réservation..." : "Validation du paiement Mobile Money...";
            if (desc) desc.textContent = methodId === 'cash' ? "Blocage garanti de votre siège en gare..." : "Débit validé avec succès par le réseau ivoirien.";

            setTimeout(() => {
                // Étape 3 : Succès complet
                progress = 100;
                if (fill) fill.style.width = `${progress}%`;
                if (title) title.textContent = "Transaction Réussie !";
                if (desc) desc.textContent = "Génération de votre billet électronique officiel BEMA...";

                // Jouer son de réussite
                if (window.bemaAudio) {
                    window.bemaAudio.playPaymentSuccess();
                }

                setTimeout(() => {
                    this.completeBookingAndGenerateTicket(methodId);
                }, 900);
            }, 1200);
        }, 1000);
    }

    completeBookingAndGenerateTicket(methodId) {
        const data = this.currentBookingData;
        const dep = data.departure;
        const seat = data.seat;
        const passenger = data.passenger;

        // Générer référence unique de réservation type Flixbus BEMA
        const randomHex = Math.floor(1000 + Math.random() * 9000);
        const originCode = dep.origin.substring(0, 3).toUpperCase();
        const destCode = dep.destination.substring(0, 3).toUpperCase();
        const bookingRef = `BEMA-${originCode}-${destCode}-${randomHex}`;

        const methodNames = {
            wave: "Wave Côte d'Ivoire (0% frais)",
            orange: "Orange Money CI (#144#)",
            mtn: "MTN Mobile Money CI",
            moov: "Moov Money Flooz CI",
            card: "Carte Bancaire Visa/Mastercard",
            cash: "Espèces au Guichet Gare"
        };

        const newTicket = {
            id: `TKT-${Date.now()}`,
            bookingRef: bookingRef,
            departureId: dep.id,
            tripCode: dep.tripCode,
            passenger: {
                fullName: passenger.fullName,
                phone: passenger.phone,
                idCard: passenger.idCard || "CNI non renseignée",
                email: passenger.email || ""
            },
            origin: dep.origin,
            originStation: dep.originStation,
            destination: dep.destination,
            destinationStation: dep.destinationStation,
            departureDate: data.travelDate || new Date().toLocaleDateString('fr-FR'),
            departureTime: dep.departureTime,
            arrivalTime: dep.arrivalTime,
            seatNumber: seat.number,
            seatLabel: seat.label,
            seatType: seat.desc,
            busPlate: dep.busPlate,
            busModel: dep.busModel,
            driver: dep.driver,
            serviceType: dep.serviceType,
            price: dep.price,
            extraLuggage: seat.hasExtraLuggage ? 1500 : 0,
            totalPaid: seat.totalPrice,
            currency: "FCFA",
            paymentMethod: methodNames[methodId] || "Paiement Mobile",
            paymentStatus: methodId === 'cash' ? "En attente paiement guichet" : "Payé (Confirmé)",
            ticketStatus: "VALIDE",
            boardingTime: `${dep.departureTime} (Présentation 30 min avant)`,
            boardingGate: "Quai N° 2 - Porte A",
            bookedAt: new Date().toISOString()
        };

        // Enregistrer dans la base locale
        window.bemaStorage.saveTicket(newTicket);

        // Envoyer une notification système
        window.bemaStorage.addNotification({
            title: `Billet Confirmé : ${bookingRef}`,
            message: `Votre réservation pour ${dep.origin} ➔ ${dep.destination} (Siège ${seat.label}) est confirmée. Présentez votre QR Code à l'embarquement.`,
            type: "ticket_success"
        });

        // Fermer la modal de paiement
        this.closePaymentModal();

        // Afficher l'écran de billet électronique
        if (window.bemaTicket) {
            window.bemaTicket.displayTicket(newTicket);
        }

        // Basculer l'affichage vers la section ticket
        if (window.bemaApp) {
            window.bemaApp.showSection('ticketViewSection');
        }
    }
}

window.bemaPayment = new BemaPayment();

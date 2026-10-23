/**
 * BEMA TRANSPORT - Gestionnaire du Plan de Sièges Interactif (Style Flixbus)
 */

class BemaSeatMap {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentDeparture = null;
        this.selectedSeat = null;
        this.onSeatSelectedCallback = null;
    }

    render(departure, onSeatSelected) {
        this.currentDeparture = departure;
        this.onSeatSelectedCallback = onSeatSelected;
        this.selectedSeat = null;

        if (!this.container) return;

        const totalSeats = departure.totalSeats || 48;
        const occupied = departure.occupiedSeats || [];

        let html = `
            <div class="seatmap-wrapper">
                <div class="seatmap-header">
                    <div class="bus-info-pill">
                        <span class="bus-model-tag"><i class="fa-solid fa-bus"></i> ${departure.busModel}</span>
                        <span class="bus-plate-tag">Immatriculation : <strong>${departure.busPlate}</strong></span>
                        <span class="bus-capacity-tag">${totalSeats} places • Climatisé</span>
                    </div>

                    <!-- Légende des Sièges -->
                    <div class="seatmap-legend">
                        <div class="legend-item">
                            <span class="seat-sample seat-available"></span>
                            <span>Disponible</span>
                        </div>
                        <div class="legend-item">
                            <span class="seat-sample seat-selected"></span>
                            <span>Votre Choix</span>
                        </div>
                        <div class="legend-item">
                            <span class="seat-sample seat-occupied"></span>
                            <span>Occupé</span>
                        </div>
                        <div class="legend-item">
                            <span class="seat-sample seat-vip"></span>
                            <span>Vue Panoramique</span>
                        </div>
                    </div>
                </div>

                <!-- Carrosserie du Car BEMA (Vue de dessus) -->
                <div class="bus-chassis">
                    <!-- Avant du Car / Pare-brise & Poste Conducteur -->
                    <div class="bus-front">
                        <div class="windshield-glass">
                            <div class="windshield-reflection"></div>
                            <span class="front-label">AVANT DU CAR • DIRECTION ${departure.destination}</span>
                        </div>
                        <div class="cockpit-deck">
                            <div class="driver-cabin">
                                <div class="steering-wheel" title="Poste du Chauffeur BEMA">
                                    <i class="fa-solid fa-dharmachakra"></i>
                                </div>
                                <span class="driver-tag"><i class="fa-solid fa-id-badge"></i> Chauffeur : ${departure.driver.split(' ')[0]}</span>
                            </div>
                            <div class="bus-entrance-door" title="Porte d'accès passagers & Marchepied">
                                <div class="door-stairs">
                                    <span></span><span></span><span></span>
                                </div>
                                <span class="door-text"><i class="fa-solid fa-arrow-right-to-bracket"></i> ENTRÉE</span>
                            </div>
                        </div>
                    </div>

                    <!-- Grille des Sièges -->
                    <div class="bus-cabin-interior">
                        <div class="cabin-aisle-guide">
                            <div class="seats-left-column">
                                <div class="col-header">Fenêtre (A)</div>
                                <div class="col-header">Couloir (B)</div>
                            </div>
                            <div class="central-aisle-header">Allée Centrale</div>
                            <div class="seats-right-column">
                                <div class="col-header">Couloir (C)</div>
                                <div class="col-header">Fenêtre (D)</div>
                            </div>
                        </div>

                        <div class="seats-grid" id="seatsGrid">
        `;

        // Calcul des rangées (4 sièges par rangée, dernière rangée 4 ou 5)
        const regularRows = Math.floor((totalSeats - 4) / 4);

        let seatCounter = 1;

        for (let r = 1; r <= regularRows; r++) {
            const isRowPanoramic = (r === 1);
            const isNearToilet = (r === 6);

            html += `
                <div class="bus-row ${isRowPanoramic ? 'panoramic-row' : ''}">
                    <span class="row-number">${r}</span>
            `;

            // Sièges Gauche (A, B)
            html += `<div class="seat-pair left-pair">`;
            for (let side = 0; side < 2; side++) {
                const sNum = seatCounter++;
                const letter = side === 0 ? 'A' : 'B';
                const isOcc = occupied.includes(sNum);
                const isPano = isRowPanoramic;
                const seatTypeDesc = side === 0 ? 'Fenêtre gauche' : 'Couloir';

                html += this.renderSingleSeat(sNum, letter, isOcc, isPano, seatTypeDesc);
            }
            html += `</div>`;

            // Allée centrale / Equipement intermédiaire
            if (r === 6) {
                html += `
                    <div class="aisle-amenity toilet-cell" title="Toilettes & WC à bord">
                        <i class="fa-solid fa-restroom"></i>
                        <span>WC</span>
                    </div>
                `;
            } else {
                html += `<div class="aisle-spacer"></div>`;
            }

            // Sièges Droite (C, D)
            html += `<div class="seat-pair right-pair">`;
            for (let side = 0; side < 2; side++) {
                const sNum = seatCounter++;
                const letter = side === 0 ? 'C' : 'D';
                const isOcc = occupied.includes(sNum);
                const isPano = isRowPanoramic;
                const seatTypeDesc = side === 1 ? 'Fenêtre droite' : 'Couloir';

                html += this.renderSingleSeat(sNum, letter, isOcc, isPano, seatTypeDesc);
            }
            html += `</div>`;

            html += `</div>`; // fin bus-row
        }

        // Rangée du fond (Dernière rangée 4 ou 5 places)
        html += `
            <div class="bus-row back-bench-row">
                <span class="row-number">Fond</span>
                <div class="back-seats-wrapper">
        `;
        while (seatCounter <= totalSeats) {
            const sNum = seatCounter++;
            const isOcc = occupied.includes(sNum);
            html += this.renderSingleSeat(sNum, 'F', isOcc, false, 'Banquette arrière');
        }
        html += `
                </div>
            </div>
        `;

        html += `
                        </div><!-- /seatsGrid -->
                    </div><!-- /bus-cabin-interior -->

                    <!-- Arrière du Car / Sortie de secours & Moteur -->
                    <div class="bus-rear">
                        <div class="emergency-exit" title="Porte et sortie de secours arrière">
                            <i class="fa-solid fa-person-running"></i> SORTIE DE SECOURS
                        </div>
                        <div class="rear-engine-vent">
                            <span></span><span></span><span></span><span></span>
                        </div>
                    </div>
                </div><!-- /bus-chassis -->

                <!-- Panneau dynamique du siège sélectionné -->
                <div class="selected-seat-summary" id="selectedSeatSummary">
                    <div class="seat-details-pill empty" id="seatDetailsPill">
                        <i class="fa-regular fa-hand-pointer pulse-icon"></i>
                        <span>Cliquez sur un siège disponible pour le réserver</span>
                    </div>
                    <div class="pricing-calculator" id="pricingCalculator" style="display:none;">
                        <div class="price-breakdown">
                            <div class="line">
                                <span>Billet de transport (${departure.origin} ➔ ${departure.destination}) :</span>
                                <strong id="basePriceLabel">${departure.price.toLocaleString()} FCFA</strong>
                            </div>
                            <div class="line extra-luggage-line">
                                <label class="luggage-toggle">
                                    <input type="checkbox" id="extraLuggageCheckbox" onchange="bemaSeatMap.toggleLuggage(this)">
                                    <span>Bagage supplémentaire en soute (+23 kg) : <strong>+1 500 FCFA</strong></span>
                                </label>
                            </div>
                            <div class="total-line">
                                <span>Total net à payer :</span>
                                <span class="final-price-tag" id="finalPriceTag">${departure.price.toLocaleString()} FCFA</span>
                            </div>
                        </div>
                        <button type="button" class="btn btn-primary btn-proceed-checkout" id="btnProceedCheckout" onclick="bemaSeatMap.confirmSelection()">
                            <span>Continuer vers le paiement</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.attachSeatListeners();
    }

    renderSingleSeat(sNum, letter, isOccupied, isPanoramic, description) {
        if (isOccupied) {
            return `
                <button type="button" class="seat-btn seat-occupied" disabled title="Siège ${sNum}${letter} - Déjà occupé">
                    <span class="seat-num">${sNum}</span>
                    <i class="fa-solid fa-user-xmark seat-icon"></i>
                </button>
            `;
        }

        const panoClass = isPanoramic ? 'seat-panoramic' : '';

        return `
            <button type="button" 
                    class="seat-btn seat-available ${panoClass}" 
                    data-seat-number="${sNum}" 
                    data-seat-letter="${letter}" 
                    data-seat-desc="${description}"
                    title="Siège N° ${sNum} (${letter}) - ${description}">
                <span class="seat-num">${sNum}</span>
                <span class="seat-letter">${letter}</span>
                <i class="fa-solid fa-couch seat-icon"></i>
            </button>
        `;
    }

    attachSeatListeners() {
        const buttons = this.container.querySelectorAll('.seat-btn.seat-available');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const sNum = parseInt(btn.dataset.seatNumber);
                const letter = btn.dataset.seatLetter;
                const desc = btn.dataset.seatDesc;

                this.selectSeat(sNum, letter, desc, btn);
            });
        });
    }

    selectSeat(sNum, letter, desc, clickedBtn) {
        // Déselectionner l'ancien
        const allSelected = this.container.querySelectorAll('.seat-btn.seat-selected');
        allSelected.forEach(s => s.classList.remove('seat-selected'));

        // Sélectionner le nouveau
        clickedBtn.classList.add('seat-selected');

        this.selectedSeat = {
            number: sNum,
            letter: letter,
            label: `${sNum}${letter}`,
            desc: desc,
            basePrice: this.currentDeparture.price,
            hasExtraLuggage: false,
            totalPrice: this.currentDeparture.price
        };

        // Jouer un petit clic agréable
        if (window.bemaAudio) {
            window.bemaAudio.init();
        }

        // Mettre à jour le résumé
        this.updateSummaryUI();
    }

    toggleLuggage(checkbox) {
        if (!this.selectedSeat) return;
        this.selectedSeat.hasExtraLuggage = checkbox.checked;
        const extra = checkbox.checked ? 1500 : 0;
        this.selectedSeat.totalPrice = this.selectedSeat.basePrice + extra;

        const tag = document.getElementById('finalPriceTag');
        if (tag) {
            tag.textContent = `${this.selectedSeat.totalPrice.toLocaleString()} FCFA`;
        }
    }

    updateSummaryUI() {
        const pill = document.getElementById('seatDetailsPill');
        const calc = document.getElementById('pricingCalculator');
        const tag = document.getElementById('finalPriceTag');
        const luggageBox = document.getElementById('extraLuggageCheckbox');

        if (!this.selectedSeat) {
            if (pill) {
                pill.className = 'seat-details-pill empty';
                pill.innerHTML = `<i class="fa-regular fa-hand-pointer pulse-icon"></i><span>Cliquez sur un siège disponible pour le réserver</span>`;
            }
            if (calc) calc.style.display = 'none';
            return;
        }

        if (pill) {
            pill.className = 'seat-details-pill active';
            pill.innerHTML = `
                <div class="selected-pill-content">
                    <span class="badge-seat-success"><i class="fa-solid fa-check"></i> Siège Sélectionné</span>
                    <strong class="selected-seat-title">Siège N° ${this.selectedSeat.number} (${this.selectedSeat.letter}) • ${this.selectedSeat.desc}</strong>
                    <span class="seat-sub">${this.currentDeparture.origin} ➔ ${this.currentDeparture.destination} (${this.currentDeparture.departureTime})</span>
                </div>
            `;
        }

        if (luggageBox) {
            luggageBox.checked = this.selectedSeat.hasExtraLuggage;
        }

        if (tag) {
            tag.textContent = `${this.selectedSeat.totalPrice.toLocaleString()} FCFA`;
        }

        if (calc) {
            calc.style.display = 'block';
            calc.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    confirmSelection() {
        if (!this.selectedSeat) {
            alert("Veuillez d'abord sélectionner votre siège dans le bus.");
            return;
        }

        if (typeof this.onSeatSelectedCallback === 'function') {
            this.onSeatSelectedCallback(this.selectedSeat, this.currentDeparture);
        }
    }
}

window.bemaSeatMap = new BemaSeatMap('seatMapContainer');

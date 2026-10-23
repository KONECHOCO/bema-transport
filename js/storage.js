/**
 * BEMA TRANSPORT - Gestionnaire de Persistance & État Local (LocalStorage)
 */

class BemaStorage {
    constructor() {
        this.KEYS = {
            TICKETS: 'bema_tickets_v1',
            DEPARTURES: 'bema_departures_v1',
            FLEET: 'bema_fleet_v1',
            NOTIFICATIONS: 'bema_notifications_v1',
            TRACKING: 'bema_tracking_v1',
            STATS: 'bema_stats_v1'
        };
        this.init();
    }

    init() {
        // Initialiser les départs s'ils n'existent pas encore
        if (!localStorage.getItem(this.KEYS.DEPARTURES)) {
            localStorage.setItem(this.KEYS.DEPARTURES, JSON.stringify(BEMA_DATA.defaultDepartures));
        }

        // Initialiser la flotte
        if (!localStorage.getItem(this.KEYS.FLEET)) {
            localStorage.setItem(this.KEYS.FLEET, JSON.stringify(BEMA_DATA.fleet));
        }

        // Initialiser les tickets avec un premier ticket d'exemple pour démonstration immédiate
        if (!localStorage.getItem(this.KEYS.TICKETS)) {
            const sampleTicket = {
                id: "TKT-BEMA-8842",
                bookingRef: "BEMA-KOR-ABJ-8842",
                departureId: "DEP-KOR-ABJ-0630",
                tripCode: "BEMA-401",
                passenger: {
                    fullName: "Kouamé Jean-Marc",
                    phone: "+225 07 58 44 12 30",
                    idCard: "CNI CI-004892147",
                    email: "jeanmarc.kouame@gmail.com"
                },
                origin: "Korhogo",
                originStation: "Gare Centrale BEMA Sinistré (Korhogo)",
                destination: "Abidjan",
                destinationStation: "Gare Centrale BEMA Adjamé Liberté (Abidjan)",
                departureDate: new Date().toLocaleDateString('fr-FR'),
                departureTime: "06:30",
                arrivalTime: "15:15",
                seatNumber: 14,
                seatType: "Fenêtre - Rangée Confort",
                busPlate: "1428 HG 01",
                busModel: "Scania Marcopolo Paradiso G8",
                driver: "Amadou Koné",
                serviceType: "VIP Climatisé",
                price: 10000,
                extraLuggage: 0,
                totalPaid: 10000,
                currency: "FCFA",
                paymentMethod: "Wave Côte d'Ivoire",
                paymentStatus: "Payé (Confirmé)",
                ticketStatus: "VALIDE", // VALIDE, EMBARQUE, ANNULE
                boardingTime: "06:00 (Présentation 30 min avant)",
                boardingGate: "Quai N° 2",
                bookedAt: new Date(Date.now() - 3600000 * 2).toISOString()
            };
            localStorage.setItem(this.KEYS.TICKETS, JSON.stringify([sampleTicket]));
        }

        // Initialiser les notifications
        if (!localStorage.getItem(this.KEYS.NOTIFICATIONS)) {
            const initialNotifs = [
                {
                    id: "notif-1",
                    title: "BEMA Live : Trajet Korhogo ➔ Abidjan en route",
                    message: "Le car BEMA-401 (1428 HG 01) a franchi Katiola. Vitesse actuelle : 84 km/h. Arrivée prévue à Abidjan à 15h15.",
                    type: "info",
                    time: "Il y a 10 min",
                    read: false
                },
                {
                    id: "notif-2",
                    title: "Bienvenue sur BEMA Transport Côte d'Ivoire",
                    message: "Réservez vos places en ligne avec Wave ou Orange Money et suivez votre car en temps réel avec notre radar GPS.",
                    type: "welcome",
                    time: "Aujourd'hui",
                    read: false
                }
            ];
            localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs));
        }

        // Initialiser les stats
        if (!localStorage.getItem(this.KEYS.STATS)) {
            const stats = {
                dailyRevenue: 2450000, // 2 450 000 FCFA
                ticketsSoldToday: 245,
                occupancyRate: 88,
                activeBuses: 4
            };
            localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
        }
    }

    // --- DEPARTURES ---
    getDepartures() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.DEPARTURES)) || [];
        } catch (e) {
            return BEMA_DATA.defaultDepartures;
        }
    }

    getDepartureById(id) {
        const departures = this.getDepartures();
        return departures.find(d => d.id === id);
    }

    saveDepartures(departures) {
        localStorage.setItem(this.KEYS.DEPARTURES, JSON.stringify(departures));
    }

    addDeparture(newDeparture) {
        const departures = this.getDepartures();
        departures.unshift(newDeparture);
        this.saveDepartures(departures);
        return newDeparture;
    }

    updateDepartureStatus(departureId, newStatus, delayMinutes = 0) {
        const departures = this.getDepartures();
        const dep = departures.find(d => d.id === departureId);
        if (dep) {
            dep.status = newStatus;
            dep.delayMinutes = delayMinutes;
            this.saveDepartures(departures);
        }
        return dep;
    }

    occupySeat(departureId, seatNumber) {
        const departures = this.getDepartures();
        const dep = departures.find(d => d.id === departureId);
        if (dep) {
            if (!dep.occupiedSeats) dep.occupiedSeats = [];
            if (!dep.occupiedSeats.includes(seatNumber)) {
                dep.occupiedSeats.push(seatNumber);
                this.saveDepartures(departures);
            }
        }
    }

    // --- TICKETS ---
    getTickets() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.TICKETS)) || [];
        } catch (e) {
            return [];
        }
    }

    getTicketByRef(bookingRef) {
        const tickets = this.getTickets();
        return tickets.find(t => t.bookingRef.toUpperCase() === bookingRef.trim().toUpperCase());
    }

    saveTicket(ticket) {
        const tickets = this.getTickets();
        tickets.unshift(ticket);
        localStorage.setItem(this.KEYS.TICKETS, JSON.stringify(tickets));

        // Marquer le siège comme occupé
        if (ticket.departureId && ticket.seatNumber) {
            this.occupySeat(ticket.departureId, ticket.seatNumber);
        }

        // Mettre à jour les statistiques journalières
        this.incrementDailyStats(ticket.totalPaid);

        return ticket;
    }

    validateTicketForBoarding(ref) {
        const tickets = this.getTickets();
        const t = tickets.find(ticket => ticket.bookingRef.toUpperCase() === ref.trim().toUpperCase());
        if (!t) {
            return { success: false, reason: "NOT_FOUND", message: "Billet introuvable dans le système BEMA." };
        }
        if (t.ticketStatus === "EMBARQUE") {
            return {
                success: false,
                reason: "ALREADY_BOARDED",
                message: `Billet déjà validé et composté pour ${t.passenger.fullName} (Siège N° ${t.seatNumber}).`,
                ticket: t
            };
        }
        if (t.ticketStatus === "ANNULE") {
            return {
                success: false,
                reason: "CANCELLED",
                message: "Ce billet a été annulé ou remboursé.",
                ticket: t
            };
        }

        // Valider l'embarquement
        t.ticketStatus = "EMBARQUE";
        t.boardedAt = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(this.KEYS.TICKETS, JSON.stringify(tickets));

        return {
            success: true,
            reason: "OK",
            message: `Embarquement autorisé pour ${t.passenger.fullName} !`,
            ticket: t
        };
    }

    // --- FLEET ---
    getFleet() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.FLEET)) || [];
        } catch (e) {
            return BEMA_DATA.fleet;
        }
    }

    saveFleet(fleet) {
        localStorage.setItem(this.KEYS.FLEET, JSON.stringify(fleet));
    }

    updateBusStatus(busId, updates) {
        const fleet = this.getFleet();
        const bus = fleet.find(b => b.id === busId);
        if (bus) {
            Object.assign(bus, updates);
            this.saveFleet(fleet);
        }
        return bus;
    }

    // --- NOTIFICATIONS ---
    getNotifications() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.NOTIFICATIONS)) || [];
        } catch (e) {
            return [];
        }
    }

    addNotification(notif) {
        const notifs = this.getNotifications();
        const item = {
            id: 'notif-' + Date.now(),
            time: 'À l\'instant',
            read: false,
            ...notif
        };
        notifs.unshift(item);
        localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(notifs.slice(0, 30)));
        return item;
    }

    markAllNotificationsRead() {
        const notifs = this.getNotifications();
        notifs.forEach(n => n.read = true);
        localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }

    getUnreadNotifsCount() {
        return this.getNotifications().filter(n => !n.read).length;
    }

    // --- STATS ---
    getStats() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.STATS)) || { dailyRevenue: 2450000, ticketsSoldToday: 245, occupancyRate: 88, activeBuses: 4 };
        } catch (e) {
            return { dailyRevenue: 2450000, ticketsSoldToday: 245, occupancyRate: 88, activeBuses: 4 };
        }
    }

    incrementDailyStats(amount) {
        const stats = this.getStats();
        stats.dailyRevenue += (amount || 10000);
        stats.ticketsSoldToday += 1;
        stats.occupancyRate = Math.min(98, Math.round(stats.occupancyRate + 0.3));
        localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
    }

    // Reinitialiser aux données de démonstration
    resetDemoData() {
        localStorage.removeItem(this.KEYS.TICKETS);
        localStorage.removeItem(this.KEYS.DEPARTURES);
        localStorage.removeItem(this.KEYS.FLEET);
        localStorage.removeItem(this.KEYS.NOTIFICATIONS);
        localStorage.removeItem(this.KEYS.STATS);
        this.init();
    }
}

window.bemaStorage = new BemaStorage();

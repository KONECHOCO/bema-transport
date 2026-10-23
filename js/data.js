/**
 * BEMA TRANSPORT - Données Référentielles & Géographiques de Côte d'Ivoire
 */

const BEMA_DATA = {
    company: {
        name: "BEMA TRANSPORT",
        legalName: "BEMA Transport & Logistique S.A.R.L.",
        slogan: "L'excellence du voyage au cœur de la Côte d'Ivoire",
        headquarters: "Korhogo, Quartier Sinistré - Boulevard Principal",
        customerService: "+225 27 36 86 00 12 / +225 07 08 09 10 11",
        email: "contact@bematransport.ci",
        defaultCurrency: "FCFA"
    },

    // Villes et Gares desservies en Côte d'Ivoire
    cities: [
        {
            id: "KORHOGO",
            name: "Korhogo",
            region: "Région des Savanes (Poro)",
            station: "Gare Centrale BEMA Sinistré - Korhogo",
            address: "Boulevard Reine Pokou, face Station Total",
            lat: 9.4580,
            lng: -5.6296
        },
        {
            id: "NIAKARA",
            name: "Niakaramandougou",
            region: "Hambol",
            station: "Halte BEMA Niakara Centre",
            address: "Carrefour Grand Marché",
            lat: 8.6601,
            lng: -5.2905
        },
        {
            id: "KATIOLA",
            name: "Katiola",
            region: "Hambol",
            station: "Gare BEMA Katiola Poterie",
            address: "Avenue Nationale A3",
            lat: 8.1373,
            lng: -5.1009
        },
        {
            id: "BOUAKE",
            name: "Bouaké",
            region: "Gbêkê",
            station: "Grande Gare BEMA Commerce - Bouaké",
            address: "Quartier Commerce, non loin du Stade de la Paix",
            lat: 7.6898,
            lng: -5.0313
        },
        {
            id: "YAMOUSSOUKRO",
            name: "Yamoussoukro",
            region: "Bélier (District Autonome)",
            station: "Gare BEMA Fondation - Yamoussoukro",
            address: "Avenue Houphouët-Boigny, Carrefour 220 Logements",
            lat: 6.8206,
            lng: -5.2767
        },
        {
            id: "TIASSALE",
            name: "Tiassalé",
            region: "Agneby-Tiassa",
            station: "Relais Péage BEMA Tiassalé",
            address: "Jonction Autoroute du Nord",
            lat: 5.8984,
            lng: -4.8229
        },
        {
            id: "ABIDJAN",
            name: "Abidjan",
            region: "District Autonome d'Abidjan",
            station: "Gare Centrale BEMA Adjamé Liberté",
            address: "Boulevard Nangui Abrogoua, Face Renault Liberté (et antenne Yopougon Siporex)",
            lat: 5.3599,
            lng: -4.0083
        },
        {
            id: "FERKE",
            name: "Ferkessédougou",
            region: "Tchologo",
            station: "Gare BEMA Ferké Gare",
            address: "Sortie Ouangolodougou",
            lat: 9.5928,
            lng: -5.1945
        },
        {
            id: "MAN",
            name: "Man",
            region: "Tonkpi (18 Montagnes)",
            station: "Gare BEMA Man Cascade",
            address: "Route de Danané",
            lat: 7.4125,
            lng: -7.5538
        },
        {
            id: "SANPEDRO",
            name: "San-Pédro",
            region: "San-Pédro",
            station: "Gare BEMA Portuaire",
            address: "Quartier Cité",
            lat: 4.7485,
            lng: -6.6363
        }
    ],

    // Points de passage GPS réalistes pour la ligne phare KORHOGO <-> ABIDJAN (Route A3 & Autoroute du Nord)
    korhogoAbidjanRoute: [
        { name: "Gare de Korhogo", lat: 9.4580, lng: -5.6296, km: 0, stopType: "origin" },
        { name: "Péage Nord Korhogo", lat: 9.3800, lng: -5.5800, km: 12, stopType: "toll" },
        { name: "Carrefour Tioroniaradougou", lat: 9.2450, lng: -5.4800, km: 38, stopType: "waypoint" },
        { name: "Arrêt Niakaramandougou", lat: 8.6601, lng: -5.2905, km: 110, stopType: "stop" },
        { name: "Tafiré Escale", lat: 8.4200, lng: -5.1800, km: 145, stopType: "waypoint" },
        { name: "Gare de Katiola", lat: 8.1373, lng: -5.1009, km: 185, stopType: "stop" },
        { name: "Entrée Bouaké (Péage Nord)", lat: 7.7800, lng: -5.0450, km: 232, stopType: "toll" },
        { name: "Gare Centrale Bouaké", lat: 7.6898, lng: -5.0313, km: 245, stopType: "major_stop" },
        { name: "Djébonoua", lat: 7.5100, lng: -5.0500, km: 270, stopType: "waypoint" },
        { name: "Tiébissou", lat: 7.1582, lng: -5.2255, km: 315, stopType: "waypoint" },
        { name: "Gare de Yamoussoukro (Capitale)", lat: 6.8206, lng: -5.2767, km: 360, stopType: "major_stop" },
        { name: "Jonction Autoroute du Nord A1", lat: 6.7200, lng: -5.2100, km: 375, stopType: "highway" },
        { name: "Toumodi (Péage)", lat: 6.5574, lng: -5.0182, km: 405, stopType: "toll" },
        { name: "Relais Tiassalé / N'Douci", lat: 5.8984, lng: -4.8229, km: 480, stopType: "stop" },
        { name: "Péage d'Attinguié (Grand Abidjan)", lat: 5.4850, lng: -4.2400, km: 545, stopType: "toll" },
        { name: "Yopougon Carrefour Siporex", lat: 5.3350, lng: -4.0800, km: 565, stopType: "stop" },
        { name: "Gare Centrale BEMA Adjamé Liberté", lat: 5.3599, lng: -4.0083, km: 580, stopType: "destination" }
    ],

    // Flotte d'autocars BEMA TRANSPORT
    fleet: [
        {
            id: "BUS-01",
            name: "Savane Prestige",
            plate: "1428 HG 01",
            model: "Scania Marcopolo Paradiso G8",
            capacity: 48,
            type: "VIP Climatisé Grand Confort",
            year: 2024,
            status: "en_route", // en_route, a_quai, maintenance, reserve
            currentDriver: "Amadou Koné",
            driverPhone: "+225 07 48 12 34 56",
            mileage: 64200,
            hasWifi: true,
            hasAC: true,
            hasUSB: true,
            hasToilet: true,
            speed: 84, // km/h en direct
            lastMaintenance: "15/10/2026"
        },
        {
            id: "BUS-02",
            name: "L'Éléphant d'Ivoire",
            plate: "8922 JJ 01",
            model: "Volvo 9700 Luxury Coach",
            capacity: 52,
            type: "Confort Plus Climatisé",
            year: 2023,
            status: "a_quai",
            currentDriver: "Seydou Traoré",
            driverPhone: "+225 05 66 90 11 22",
            mileage: 98150,
            hasWifi: true,
            hasAC: true,
            hasUSB: true,
            hasToilet: true,
            speed: 0,
            lastMaintenance: "02/10/2026"
        },
        {
            id: "BUS-03",
            name: "Le Bélier Royal",
            plate: "5610 HG 01",
            model: "Mercedes-Benz Tourismo",
            capacity: 48,
            type: "Standard Climatisé",
            year: 2023,
            status: "a_quai",
            currentDriver: "Bakary Ouattara",
            driverPhone: "+225 01 23 45 67 89",
            mileage: 112400,
            hasWifi: true,
            hasAC: true,
            hasUSB: true,
            hasToilet: true,
            speed: 0,
            lastMaintenance: "20/09/2026"
        },
        {
            id: "BUS-04",
            name: "Lagune Étoile VIP",
            plate: "9904 KK 01",
            model: "Marcopolo Double Decker G8 1800",
            capacity: 40,
            type: "VIP Couchette & Sièges Cuir 160°",
            year: 2025,
            status: "a_quai",
            currentDriver: "Ibrahim Coulibaly",
            driverPhone: "+225 07 77 88 99 00",
            mileage: 38900,
            hasWifi: true,
            hasAC: true,
            hasUSB: true,
            hasToilet: true,
            speed: 0,
            lastMaintenance: "18/10/2026"
        }
    ],

    // Chauffeurs professionnels BEMA
    drivers: [
        { id: "DRV-01", name: "Amadou Koné", license: "Permis D Lourd 2014", experience: "12 ans", phone: "+225 07 48 12 34 56", rating: 4.9 },
        { id: "DRV-02", name: "Seydou Traoré", license: "Permis D Lourd 2016", experience: "10 ans", phone: "+225 05 66 90 11 22", rating: 4.8 },
        { id: "DRV-03", name: "Bakary Ouattara", license: "Permis D Lourd 2012", experience: "14 ans", phone: "+225 01 23 45 67 89", rating: 4.95 },
        { id: "DRV-04", name: "Ibrahim Coulibaly", license: "Permis D Lourd 2015", experience: "11 ans", phone: "+225 07 77 88 99 00", rating: 4.85 }
    ],

    // Départs initiaux configurés (avec la ligne requise Korhogo - Abidjan à 10 000 FCFA)
    defaultDepartures: [
        {
            id: "DEP-KOR-ABJ-0630",
            tripCode: "BEMA-401",
            origin: "KORHOGO",
            destination: "ABIDJAN",
            originStation: "Gare Centrale BEMA Sinistré (Korhogo)",
            destinationStation: "Gare Centrale BEMA Adjamé Liberté (Abidjan)",
            departureTime: "06:30",
            arrivalTime: "15:15",
            duration: "8h 45m",
            price: 10000, // 10 000 FR CFA exactement comme requis
            busId: "BUS-01",
            busModel: "Scania Marcopolo Paradiso G8",
            busPlate: "1428 HG 01",
            driver: "Amadou Koné",
            serviceType: "VIP Climatisé",
            totalSeats: 48,
            occupiedSeats: [3, 4, 7, 8, 11, 12, 19, 20, 25, 26, 31, 32, 33, 41],
            status: "en_route", // actuellement suivi en direct
            currentProgress: 48, // 48% du trajet déjà effectué (entre Katiola et Bouaké)
            delayMinutes: 0,
            activeTracking: true,
            amenities: ["Climatisation grand froid", "Wi-Fi 4G gratuit", "Prises USB individuelles", "Sièges inclinables confort", "Bagage 23kg inclus", "Toilettes à bord"]
        },
        {
            id: "DEP-KOR-ABJ-0830",
            tripCode: "BEMA-403",
            origin: "KORHOGO",
            destination: "ABIDJAN",
            originStation: "Gare Centrale BEMA Sinistré (Korhogo)",
            destinationStation: "Gare Centrale BEMA Adjamé Liberté (Abidjan)",
            departureTime: "08:30",
            arrivalTime: "17:15",
            duration: "8h 45m",
            price: 10000,
            busId: "BUS-02",
            busModel: "Volvo 9700 Luxury",
            busPlate: "8922 JJ 01",
            driver: "Seydou Traoré",
            serviceType: "Confort Plus Climatisé",
            totalSeats: 52,
            occupiedSeats: [1, 2, 5, 6, 9, 10, 15, 16, 21, 22, 23, 24],
            status: "a_l_heure",
            currentProgress: 0,
            delayMinutes: 0,
            amenities: ["Climatisation grand froid", "Wi-Fi 4G gratuit", "Prises USB", "Sièges inclinables", "Bagage 23kg inclus", "Toilettes"]
        },
        {
            id: "DEP-KOR-ABJ-1400",
            tripCode: "BEMA-407",
            origin: "KORHOGO",
            destination: "ABIDJAN",
            originStation: "Gare Centrale BEMA Sinistré (Korhogo)",
            destinationStation: "Gare Centrale BEMA Adjamé Liberté (Abidjan)",
            departureTime: "14:00",
            arrivalTime: "22:45",
            duration: "8h 45m",
            price: 10000,
            busId: "BUS-03",
            busModel: "Mercedes-Benz Tourismo",
            busPlate: "5610 HG 01",
            driver: "Bakary Ouattara",
            serviceType: "Standard Climatisé",
            totalSeats: 48,
            occupiedSeats: [5, 6, 17, 18],
            status: "a_l_heure",
            currentProgress: 0,
            delayMinutes: 0,
            amenities: ["Climatisation", "Prises de recharge", "Sièges confort", "Bagage 23kg inclus"]
        },
        {
            id: "DEP-KOR-ABJ-2130",
            tripCode: "BEMA-409-VIP",
            origin: "KORHOGO",
            destination: "ABIDJAN",
            originStation: "Gare Centrale BEMA Sinistré (Korhogo)",
            destinationStation: "Gare Centrale BEMA Adjamé Liberté (Abidjan)",
            departureTime: "21:30",
            arrivalTime: "06:00 (+1)",
            duration: "8h 30m (Direct Nuit)",
            price: 12000, // VIP Nuit
            busId: "BUS-04",
            busModel: "Marcopolo Double Decker G8",
            busPlate: "9904 KK 01",
            driver: "Ibrahim Coulibaly",
            serviceType: "Bus de Nuit VIP Couchette",
            totalSeats: 40,
            occupiedSeats: [1, 2, 3, 4, 13, 14, 21, 22, 23, 24, 30, 31],
            status: "a_l_heure",
            currentProgress: 0,
            delayMinutes: 0,
            amenities: ["Couchettes & Sièges cuir 160°", "Climatisation douce", "Wi-Fi haut débit", "Kit nuit offert", "Boisson & Collation"]
        },
        {
            id: "DEP-ABJ-KOR-0700",
            tripCode: "BEMA-502",
            origin: "ABIDJAN",
            destination: "KORHOGO",
            originStation: "Gare Centrale BEMA Adjamé Liberté (Abidjan)",
            destinationStation: "Gare Centrale BEMA Sinistré (Korhogo)",
            departureTime: "07:00",
            arrivalTime: "15:45",
            duration: "8h 45m",
            price: 10000,
            busId: "BUS-02",
            busModel: "Volvo 9700 Luxury",
            busPlate: "8922 JJ 01",
            driver: "Seydou Traoré",
            serviceType: "VIP Climatisé",
            totalSeats: 48,
            occupiedSeats: [3, 4, 9, 10, 23, 24, 35, 36],
            status: "a_l_heure",
            currentProgress: 0,
            delayMinutes: 0,
            amenities: ["Climatisation", "Wi-Fi", "Prises USB", "Toilettes"]
        },
        {
            id: "DEP-BOU-ABJ-0800",
            tripCode: "BEMA-201",
            origin: "BOUAKE",
            destination: "ABIDJAN",
            originStation: "Gare BEMA Commerce (Bouaké)",
            destinationStation: "Gare BEMA Adjamé Liberté (Abidjan)",
            departureTime: "08:00",
            arrivalTime: "13:00",
            duration: "5h 00m",
            price: 6000,
            busId: "BUS-03",
            busModel: "Mercedes-Benz Tourismo",
            busPlate: "5610 HG 01",
            driver: "Bakary Ouattara",
            serviceType: "Confort Climatisé",
            totalSeats: 48,
            occupiedSeats: [1, 2, 7, 8, 12, 14, 18, 19, 20],
            status: "a_l_heure",
            currentProgress: 0,
            delayMinutes: 0,
            amenities: ["Climatisation", "Prises USB", "Bagage 23kg inclus"]
        }
    ],

    // Opérateurs de paiement mobile de Côte d'Ivoire
    paymentOperators: [
        {
            id: "wave",
            name: "Wave Côte d'Ivoire",
            badge: "0% de frais",
            color: "#1dc4fe",
            icon: "wave",
            description: "Paiement instantané par QR Code ou notification push Wave",
            ussdHelp: "Application Wave gratuite sur smartphone"
        },
        {
            id: "orange",
            name: "Orange Money",
            badge: "N°1 en CI",
            color: "#ff7900",
            icon: "orange",
            description: "Tapez le code #144# ou confirmez avec votre code secret OM",
            ussdHelp: "Composer #144*82# sur votre mobile Orange"
        },
        {
            id: "mtn",
            name: "MTN MoMo",
            badge: "Instantané",
            color: "#ffcc00",
            icon: "mtn",
            description: "Validation automatique par message d'approbation MTN MoMo",
            ussdHelp: "Composer *133# sur votre mobile MTN"
        },
        {
            id: "moov",
            name: "Moov Money (Flooz)",
            badge: "Sécurisé",
            color: "#005baa",
            icon: "moov",
            description: "Confirmez le débit sur votre compte Moov Money",
            ussdHelp: "Composer *155# sur votre mobile Moov"
        },
        {
            id: "card",
            name: "Carte Bancaire",
            badge: "Visa / Mastercard",
            color: "#1e293b",
            icon: "card",
            description: "Paiement sécurisé par carte bancaire Visa, Mastercard ou UBA",
            ussdHelp: "Protégé par 3D-Secure"
        },
        {
            id: "cash",
            name: "Espèces au Guichet",
            badge: "Gare BEMA",
            color: "#047857",
            icon: "cash",
            description: "Réservez en ligne et réglez en espèces à la gare 1h avant le départ",
            ussdHelp: "Présentez le SMS de réservation à la caisse"
        }
    ]
};

window.BEMA_DATA = BEMA_DATA;

# 🚍 BEMA TRANSPORT — Système de Gestion & Réservation de Billets de Bus (Côte d'Ivoire)

[![Côte d'Ivoire](https://img.shields.io/badge/Country-C%C3%B4te%20d'Ivoire%20%F0%9F%87%A8%F0%9F%87%AE-10b981.svg)](#)
[![Currency](https://img.shields.io/badge/Currency-FCFA%20(XOF)-f59e0b.svg)](#)
[![Payment](https://img.shields.io/badge/Mobile%20Money-Wave%20%7C%20Orange%20%7C%20MTN%20%7C%20Moov-1dc4fe.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#)

> **BEMA TRANSPORT** est une application web complète de réservation de billets de car interurbain et de gestion de flotte conçue pour la Côte d'Ivoire, inspirée des meilleurs standards internationaux (FlixBus, BlaBlaCar Bus, Trenitalia).

---

## 📊 Présentation & Documents Collaborateurs
* 🌐 **Présentation Interactive (Diaporama 10 Slides)** : [https://konechoco.github.io/bema-transport/presentation.html](https://konechoco.github.io/bema-transport/presentation.html)
* 📄 **Dossier de Présentation Format A4 (HTML)** : [https://konechoco.github.io/bema-transport/dossier_presentation.html](https://konechoco.github.io/bema-transport/dossier_presentation.html)
* 📥 **Dossier de Présentation Téléchargeable (PDF 7 Pages)** : [BEMA_TRANSPORT_Dossier_de_Presentation.pdf](BEMA_TRANSPORT_Dossier_de_Presentation.pdf)

---

## 🌟 Fonctionnalités Principales

### 1. 🎫 Portail Voyageur (Style FlixBus)
* **Recherche de trajets en direct** : Ligne phare **KORHOGO ➔ ABIDJAN** au tarif officiel garanti de **10 000 FCFA** (ainsi que Bouaké, Yamoussoukro, Katiola, Niakaramandougou, etc.).
* **Plan de Sièges Interactif (Seat Map)** :
  * Vue de dessus réaliste du car (poste conducteur, volant, marchepied d'entrée, allée centrale, toilettes WC et sortie de secours).
  * Choix du siège (fenêtre, couloir, rangées panoramiques avant).
  * Calcul dynamique du tarif et option bagage additionnel en soute (+1 500 FCFA).

### 2. 📱 Passerelle de Paiement Mobile Money Ivoirienne
* **Wave Côte d'Ivoire** (0% de frais, QR Code & notification push).
* **Orange Money CI** (Code USSD `#144*82#` et code secret).
* **MTN Mobile Money** (Validation automatique par push direct).
* **Moov Money (Flooz)** (Code `*155#`).
* **Carte Bancaire (Visa / Mastercard)** & **Paiement en espèces au guichet en gare**.
* Animation interactive de débit bancaire et sonorisation de confirmation de paiement.

### 3. 🎟️ Billet Électronique (E-Ticket) avec QR Code
* Coupon de contrôle perforé style titre de transport officiel.
* **QR Code dynamique** contenant les données cryptées du voyage.
* Fonctions d'impression directe (optimisée `@media print`), téléchargement et partage instantané via **WhatsApp**.

### 4. 🛰️ Radar de Suivi GPS en Temps Réel (Live Bus Tracking)
* Carte interactive haute résolution avec tracé officiel de la Route Nationale A3 et de l'Autoroute du Nord.
* Déplacement fluide et animé du car avec pulsation radar.
* **Télémétrie de bord (HUD)** :
  * Tachymètre numérique en direct (82 km/h).
  * Pourcentage de progression et décompte kilométrique (580 km total).
  * Prochaine escale et heure estimée d'arrivée (ETA).
* Commandes de simulation : vitesse (x1, x5, x25), pause, et bouton *"Simuler un Retard (+25 min Péage)"*.

### 5. 🔔 Centre de Notifications & Alertes Vocales
* Synthèse sonore native via **Web Audio API** (carillon officiel de gare BEMA, double-bip de compostage, alerte retard).
* Mises à jour en direct de l'état du trafic, rappels d'embarquement et convocations en gare.

### 6. 🏢 Espace Compagnie & Back-Office Gestionnaire (Admin)
* **Dashboard KPI** : Recettes journalières en FCFA, billets vendus, taux d'occupation (%) et cars en circulation.
* **Programmation des Départs** : Création et publication immédiate d'horaires et de trajets avec affectation de chauffeur et de véhicule.
* **Gestion du Parc Automobile** : Immatriculations ivoiriennes (ex: `1428 HG 01`), modèles (Scania Marcopolo G8, Volvo 9700), kilométrage et climatisation.
* **Scanner d'Embarquement** : Lecteur de QR Code interactif avec validation du titre de transport, bip sonore et mise à jour du statut en `EMBARQUÉ`.
* **Diffusion d'Alertes aux Voyageurs** : Envoi de notifications ciblées par SMS/App aux passagers d'une ligne en cas de retard ou changement de quai.

---

## 📁 Architecture du Projet

```
BUS/
├── index.html              # Interface principale Single-Page Application
├── assets/                 # Logo officiel et bannière du car de luxe
│   ├── logo.jpg
│   └── hero.jpg
├── css/
│   ├── styles.css          # Design system, glassmorphism & responsive layout
│   └── leaflet.css         # Styles cartographiques
├── js/
│   ├── app.js              # Coordinateur principal & navigation
│   ├── data.js             # Données géographiques, gares & départs en CI
│   ├── storage.js          # Persistance locale (LocalStorage)
│   ├── seatmap.js          # Moteur de plan de bus interactif
│   ├── payment.js          # Passerelle Mobile Money (Wave, OM, MTN, Moov)
│   ├── ticket.js           # Générateur de billets électroniques & QR
│   ├── map.js              # Radar GPS et télémétrie en temps réel
│   ├── admin.js            # Back-office gestionnaire & scanner
│   ├── audio.js            # Moteur sonore Web Audio API
│   ├── notifications.js    # Gestionnaire de toasts et alertes
│   ├── leaflet.js          # Moteur cartographique
│   └── qrcode.min.js       # Bibliothèque locale QR Code
└── README.md
```

---

## 🚀 Lancement Rapide en Local

Aucune dépendance externe complexe n'est requise. Vous pouvez lancer le serveur avec Python ou Node.js :

### Avec Python :
```bash
python -m http.server 8080
```

### Avec Node.js :
```bash
npx serve -l 8080
```

Ouvrez ensuite votre navigateur sur :
```
http://localhost:8080/index.html
```

---

## 🇨🇮 Spécifications Techniques Côte d'Ivoire
- **Ligne Principale** : Korhogo (Gare Sinistré) ➔ Abidjan (Gare Adjamé Liberté / Yopougon Siporex)
- **Distance** : ~580 km via Bouaké et Yamoussoukro
- **Tarif de Référence** : 10 000 FCFA
- **Fuseau Horaire** : Abidjan GMT (UTC+0)
- **Langue** : Français (100%)

---

© 2026 **BEMA TRANSPORT S.A.R.L.** — Développé avec excellence pour le transport interurbain ivoirien.

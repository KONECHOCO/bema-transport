/**
 * BEMA TRANSPORT - Moteur Audio Web Audio API
 * Génération synthétique de carillons de gare, bips de validation de billets et alertes
 */

class BemaAudio {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Carillon de gare officiel BEMA (style annonce aéroport/gare)
    playStationChime() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [
            { freq: 440.0, time: 0.0, dur: 0.3 },   // La 4
            { freq: 554.37, time: 0.25, dur: 0.3 }, // Do# 5
            { freq: 659.25, time: 0.5, dur: 0.45 }, // Mi 5
            { freq: 880.0, time: 0.8, dur: 0.7 }    // La 5 (résonance)
        ];

        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(n.freq, this.ctx.currentTime + n.time);

            gain.gain.setValueAtTime(0.001, this.ctx.currentTime + n.time);
            gain.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + n.time + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + n.time + n.dur);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + n.time);
            osc.stop(this.ctx.currentTime + n.time + n.dur + 0.05);
        });
    }

    // Bip de validation scanner de billet réussi (Double bip aigu clair)
    playSuccessBeep() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const beeps = [
            { freq: 1046.5, time: 0.0, dur: 0.09 },
            { freq: 1318.5, time: 0.12, dur: 0.14 }
        ];

        beeps.forEach(b => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(b.freq, this.ctx.currentTime + b.time);

            gain.gain.setValueAtTime(0.01, this.ctx.currentTime + b.time);
            gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + b.time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + b.time + b.dur);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + b.time);
            osc.stop(this.ctx.currentTime + b.time + b.dur);
        });
    }

    // Bip d'erreur scanner (Bruit grave de rejet)
    playErrorBeep() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.36);
    }

    // Alerte notification / Retard (Chime d'avertissement)
    playAlertTone() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // Ré 5
        osc.frequency.setValueAtTime(523.25, this.ctx.currentTime + 0.15); // Do 5

        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.42);
    }

    // Paiement Mobile Money validé (Son triomphal)
    playPaymentSuccess() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [
            { freq: 523.25, time: 0.0, dur: 0.15 }, // Do
            { freq: 659.25, time: 0.12, dur: 0.15 }, // Mi
            { freq: 783.99, time: 0.24, dur: 0.18 }, // Sol
            { freq: 1046.5, time: 0.38, dur: 0.4 }   // Do aigu
        ];

        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(n.freq, this.ctx.currentTime + n.time);

            gain.gain.setValueAtTime(0.01, this.ctx.currentTime + n.time);
            gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + n.time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + n.time + n.dur);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + n.time);
            osc.stop(this.ctx.currentTime + n.time + n.dur);
        });
    }

    toggleAudio() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

window.bemaAudio = new BemaAudio();

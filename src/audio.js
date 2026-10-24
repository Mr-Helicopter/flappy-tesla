// ============================================================================
// SYNTHESIZED AUDIO SYSTEM (Pure Web Audio API - zero external files)
// Cold-gas thruster hiss, initial valve pop, score ping, crash impact.
// ============================================================================

export class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.isInitialized = false;
    this.isThrusterSounding = false;

    // Thruster continuous hiss nodes
    this.noiseBuffer = null;
    this.thrusterSource = null;
    this.thrusterFilter = null;
    this.thrusterHighpass = null;
    this.thrusterGain = null;
    this.isHissRunning = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.65;
      this.masterGain.connect(this.ctx.destination);

      // Pre-generate 3 seconds of white noise for cold-gas thruster loops
      const bufferSize = this.ctx.sampleRate * 3;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.setupThrusterLoop();
      this.isInitialized = true;
    } catch (err) {
      console.warn('Web Audio API not supported or blocked:', err);
    }
  }

  resume() {
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setupThrusterLoop() {
    if (!this.ctx || !this.noiseBuffer) return;

    // Looping noise source
    this.thrusterSource = this.ctx.createBufferSource();
    this.thrusterSource.buffer = this.noiseBuffer;
    this.thrusterSource.loop = true;

    // Bandpass filter centered on aerodynamic gas hiss (~1800Hz)
    this.thrusterFilter = this.ctx.createBiquadFilter();
    this.thrusterFilter.type = 'bandpass';
    this.thrusterFilter.frequency.value = 1750;
    this.thrusterFilter.Q.value = 1.6;

    // Highpass filter to eliminate muddy sub-bass rumble from gas hiss
    this.thrusterHighpass = this.ctx.createBiquadFilter();
    this.thrusterHighpass.type = 'highpass';
    this.thrusterHighpass.frequency.value = 650;

    // Gain envelope for fast attack (~30ms) and release (~120ms)
    this.thrusterGain = this.ctx.createGain();
    this.thrusterGain.gain.value = 0.0001; // Silent start

    this.thrusterSource.connect(this.thrusterFilter);
    this.thrusterFilter.connect(this.thrusterHighpass);
    this.thrusterHighpass.connect(this.thrusterGain);
    this.thrusterGain.connect(this.masterGain);

    this.thrusterSource.start(0);
    this.isHissRunning = true;
  }

  // Cold-gas thruster acoustic control:
  // Fast attack on press, smooth release on let-go, slight filter modulation
  setThrusterActive(active, justStarted = false) {
    if (!this.ctx || !this.thrusterGain) return;
    this.resume();

    const now = this.ctx.currentTime;
    if (active) {
      if (!this.isThrusterSounding || justStarted) {
        this.isThrusterSounding = true;

        // Play initial cold-gas solenoid valve "pssht" burst
        this.playValvePuff();

        // Organic acoustic variation: slightly randomize filter center frequency
        const freq = 1750 + (Math.random() - 0.5) * 350;
        this.thrusterFilter.frequency.cancelScheduledValues(now);
        this.thrusterFilter.frequency.setValueAtTime(freq, now);

        // Fast attack (~30ms) up to full hiss volume
        this.thrusterGain.gain.cancelScheduledValues(now);
        this.thrusterGain.gain.setTargetAtTime(0.32, now, 0.012);
      }
    } else {
      if (this.isThrusterSounding) {
        this.isThrusterSounding = false;

        // Fast release (~120ms) tapering off smoothly
        this.thrusterGain.gain.cancelScheduledValues(now);
        this.thrusterGain.gain.setTargetAtTime(0.0001, now, 0.040);
      }
    }
  }

  // High-pressure cold gas valve "pssht" transient
  playValvePuff() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const puffSource = this.ctx.createBufferSource();
    puffSource.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2800 + Math.random() * 600;

    const puffGain = this.ctx.createGain();
    puffGain.gain.setValueAtTime(0.38, now);
    puffGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    puffSource.connect(filter);
    filter.connect(puffGain);
    puffGain.connect(this.masterGain);

    puffSource.start(now);
    puffSource.stop(now + 0.06);
  }

  // Score ping on successfully clearing a Starbase tower segment
  playScorePing() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Dual-tone harmonic blip: starts at 880Hz (A5), glides cleanly to 1320Hz (E6)
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.10);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  // Special celebratory power chime when speed increases every 5 points
  playSpeedUpPing() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Ascending celebratory power chord (C5 -> E5 -> G5 -> C6)
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.055;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.16);
    });
  }

  // Purchase sound: upbeat celebratory chime + coin shimmer
  playPurchaseSound() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    // 4-note ascending celebratory arpeggio: E5 -> G#5 -> B5 -> E6
    const notes = [659.25, 830.61, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.055;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.19);
    });

    // Metallic coin shimmer
    const shimmer = this.ctx.createOscillator();
    const shimGain = this.ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(1864, now + 0.18);
    shimmer.frequency.exponentialRampToValueAtTime(2793, now + 0.38);

    shimGain.gain.setValueAtTime(0.20, now + 0.18);
    shimGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    shimmer.connect(shimGain);
    shimGain.connect(this.masterGain);

    shimmer.start(now + 0.18);
    shimmer.stop(now + 0.44);
  }

  // Crash sound: violent noise burst + low-frequency impact thud
  playCrash() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;
    this.isThrusterSounding = false;

    // Immediately silence thruster hiss on crash
    if (this.thrusterGain) {
      this.thrusterGain.gain.cancelScheduledValues(now);
      this.thrusterGain.gain.setValueAtTime(0.0001, now);
    }

    // 1. Heavy low-frequency sub-bass thud (130Hz -> 35Hz drop)
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(130, now);
    thudOsc.frequency.exponentialRampToValueAtTime(32, now + 0.38);

    thudGain.gain.setValueAtTime(0.55, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.40);

    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);

    thudOsc.start(now);
    thudOsc.stop(now + 0.42);

    // 2. High-impact crunch noise
    if (this.noiseBuffer) {
      const crashSource = this.ctx.createBufferSource();
      crashSource.buffer = this.noiseBuffer;

      const crashFilter = this.ctx.createBiquadFilter();
      crashFilter.type = 'lowpass';
      crashFilter.frequency.setValueAtTime(950, now);
      crashFilter.frequency.exponentialRampToValueAtTime(200, now + 0.35);

      const crashGain = this.ctx.createGain();
      crashGain.gain.setValueAtTime(0.48, now);
      crashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

      crashSource.connect(crashFilter);
      crashFilter.connect(crashGain);
      crashGain.connect(this.masterGain);

      crashSource.start(now);
      crashSource.stop(now + 0.38);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.65, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

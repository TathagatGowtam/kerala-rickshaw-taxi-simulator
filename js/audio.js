/* ==========================================================================
   KERALA AUTO RICKSHAW AUDIO SYSTEM (Web Audio API Synthesizer)
   Zero external audio assets required. All procedural & authentic.
   ========================================================================== */

class KeralaAudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.initialized = false;

    // Engine sound nodes
    this.engineGain = null;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.enginePulseOsc = null;
    this.engineFilter = null;
    this.engineRunning = false;

    // Radio / Melam playback
    this.radioActive = false;
    this.radioTimer = null;
    this.radioBeatIndex = 0;

    // Rain sound nodes
    this.rainGain = null;
    this.rainNoiseNode = null;
    this.rainActive = false;

    // Horn nodes
    this.hornOsc1 = null;
    this.hornOsc2 = null;
    this.hornGain = null;
    this.hornActive = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initEngine();
      this.initRain();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /* ----------------------------------------------------------------------
     2-STROKE TUK-TUK AUTO RICKSHAW ENGINE SYNTHESIZER
     Iconic "putt-putt-putt" sound using dual oscillators and pulse modulation
     ---------------------------------------------------------------------- */
  initEngine() {
    if (!this.ctx) return;

    this.engineMasterGain = this.ctx.createGain();
    this.engineMasterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.engineMasterGain.connect(this.ctx.destination);

    // Filter to simulate exhaust muffler
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);
    this.engineFilter.connect(this.engineMasterGain);

    // Oscillator 1 (Primary piston stroke)
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc1.frequency.setValueAtTime(38, this.ctx.currentTime);

    // Oscillator 2 (Secondary harmonic rumble)
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.setValueAtTime(76, this.ctx.currentTime);

    // Pulse LFO for the distinct 2-stroke rhythmic "putt-putt" pop
    this.enginePulseOsc = this.ctx.createOscillator();
    this.enginePulseOsc.type = 'square';
    this.enginePulseOsc.frequency.setValueAtTime(14, this.ctx.currentTime);

    const pulseGain = this.ctx.createGain();
    pulseGain.gain.setValueAtTime(25, this.ctx.currentTime);
    this.enginePulseOsc.connect(pulseGain);
    pulseGain.connect(this.engineOsc1.frequency);

    // Connect to filter
    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);

    this.engineOsc1.start();
    this.engineOsc2.start();
    this.enginePulseOsc.start();
    this.engineRunning = true;
  }

  updateEngine(speedKmh, throttle, gear) {
    if (!this.initialized || !this.engineRunning || this.isMuted) return;

    const baseFreq = 34; // Idle rumble
    const speedRatio = Math.min(Math.abs(speedKmh) / 75, 1.0);
    const throttleBoost = throttle ? 0.35 : 0.0;

    // Calculate dynamic pitch based on gear & speed
    let gearFactor = 1.0;
    if (gear === 1) gearFactor = 1.6;
    else if (gear === 2) gearFactor = 1.3;
    else if (gear === 3) gearFactor = 1.1;
    else if (gear === 4) gearFactor = 0.95;

    const targetFreq = baseFreq + (speedRatio * 55 * gearFactor) + (throttleBoost * 20);
    const pulseFreq = 12 + (speedRatio * 24) + (throttleBoost * 8);
    const filterCutoff = 380 + (speedRatio * 650) + (throttleBoost * 300);

    const now = this.ctx.currentTime;
    this.engineOsc1.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(targetFreq * 2.02, now, 0.08);
    this.enginePulseOsc.frequency.setTargetAtTime(pulseFreq, now, 0.08);
    this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.1);

    const volume = (throttle ? 0.28 : 0.16) * (this.isMuted ? 0 : 1);
    this.engineMasterGain.gain.setTargetAtTime(volume, now, 0.1);
  }

  /* ----------------------------------------------------------------------
     KERALA AUTO RICKSHAW HORN ("Paa-paam!")
     Classic dual-tone electro-mechanical horn
     ---------------------------------------------------------------------- */
  startHorn() {
    this.ensureContext();
    if (this.hornActive || this.isMuted || !this.ctx) return;
    this.hornActive = true;

    const now = this.ctx.currentTime;
    this.hornGain = this.ctx.createGain();
    this.hornGain.gain.setValueAtTime(0.001, now);
    this.hornGain.gain.exponentialRampToValueAtTime(0.35, now + 0.03);
    this.hornGain.connect(this.ctx.destination);

    // Dual horn tones: 440Hz (A4) and 554Hz (C#5)
    this.hornOsc1 = this.ctx.createOscillator();
    this.hornOsc1.type = 'sawtooth';
    this.hornOsc1.frequency.setValueAtTime(440, now);

    this.hornOsc2 = this.ctx.createOscillator();
    this.hornOsc2.type = 'sawtooth';
    this.hornOsc2.frequency.setValueAtTime(554, now);

    this.hornOsc1.connect(this.hornGain);
    this.hornOsc2.connect(this.hornGain);

    this.hornOsc1.start(now);
    this.hornOsc2.start(now);
  }

  stopHorn() {
    if (!this.hornActive || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.hornGain) {
      this.hornGain.gain.setValueAtTime(this.hornGain.gain.value, now);
      this.hornGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    }
    setTimeout(() => {
      try {
        if (this.hornOsc1) this.hornOsc1.stop();
        if (this.hornOsc2) this.hornOsc2.stop();
      } catch (e) {}
      this.hornActive = false;
    }, 90);
  }

  /* ----------------------------------------------------------------------
     KSRTC BUS AIR HORN ("Anavandi" Pneumatic Trumpet)
     ---------------------------------------------------------------------- */
  playBusHorn() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const busGain = this.ctx.createGain();
    busGain.gain.setValueAtTime(0.01, now);
    busGain.gain.exponentialRampToValueAtTime(0.4, now + 0.05);
    busGain.gain.setValueAtTime(0.4, now + 0.6);
    busGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    busGain.connect(this.ctx.destination);

    // Tri-tone chord: 660Hz (E5), 825Hz (G#5), 990Hz (B5)
    [660, 825, 990].forEach(freq => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(busGain);
      osc.start(now);
      osc.stop(now + 0.9);
    });
  }

  /* ----------------------------------------------------------------------
     KERALA RADIO & CHENDA MELAM BEATS SYNTHESIZER
     Synthesizes authentic Chenda, Thakil & Elathalam rhythms!
     ---------------------------------------------------------------------- */
  toggleRadio() {
    this.ensureContext();
    this.radioActive = !this.radioActive;
    if (this.radioActive) {
      this.startKeralaMelam();
    } else {
      this.stopKeralaMelam();
    }
    return this.radioActive;
  }

  startKeralaMelam() {
    if (this.radioTimer) clearInterval(this.radioTimer);
    this.radioBeatIndex = 0;

    // Kerala Panchari Melam / Chenda rhythm pattern
    // 0 = rest, 1 = Thakil bass, 2 = Chenda snap, 3 = Cymbal/Elathalam, 4 = Roll
    const melamPattern = [
      [1, 3], [0], [2, 3], [2],
      [1, 3], [2], [2, 3], [4],
      [1, 3], [1], [2, 3], [2],
      [1, 3], [4], [2, 3], [4]
    ];

    const tempoMs = 150; // High energy Kerala festival tempo!

    this.radioTimer = setInterval(() => {
      if (!this.radioActive || !this.ctx || this.isMuted) return;
      const step = melamPattern[this.radioBeatIndex % melamPattern.length];
      step.forEach(hit => {
        if (hit === 1) this.playThakilBass();
        else if (hit === 2) this.playChendaSnap();
        else if (hit === 3) this.playElathalamCymbal();
        else if (hit === 4) {
          this.playChendaSnap(0.6);
          setTimeout(() => this.playChendaSnap(0.8), 60);
        }
      });
      this.radioBeatIndex++;
    }, tempoMs);
  }

  stopKeralaMelam() {
    if (this.radioTimer) {
      clearInterval(this.radioTimer);
      this.radioTimer = null;
    }
  }

  playThakilBass() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playChendaSnap(volume = 0.3) {
    const now = this.ctx.currentTime;
    // High-pitched punchy wooden snare sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playElathalamCymbal() {
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(7500, now);
    filter.Q.setValueAtTime(4.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  /* ----------------------------------------------------------------------
     MONSOON RAIN & THUNDER
     ---------------------------------------------------------------------- */
  initRain() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.rainNoiseNode = this.ctx.createBufferSource();
    this.rainNoiseNode.buffer = buffer;
    this.rainNoiseNode.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1100, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    this.rainNoiseNode.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.ctx.destination);
    this.rainNoiseNode.start();
  }

  setRain(enabled) {
    this.ensureContext();
    if (!this.rainGain || !this.ctx) return;
    this.rainActive = enabled;
    const target = (enabled && !this.isMuted) ? 0.22 : 0.0001;
    this.rainGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.5);

    if (enabled && Math.random() > 0.4) {
      setTimeout(() => this.playThunder(), 2500);
    }
  }

  playThunder() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 1.8);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 2.4);
  }

  /* ----------------------------------------------------------------------
     SPECIAL GAME SFX: Fare Meter Click, Coin Drop, Pothole Bump
     ---------------------------------------------------------------------- */
  playMeterClick() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playCoinDrop() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    [1200, 1600, 2000].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + (idx * 0.08);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  playPotholeBump() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.engineMasterGain) this.engineMasterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      if (this.rainGain) this.rainGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

// Global audio singleton
window.KeralaAudio = new KeralaAudioManager();

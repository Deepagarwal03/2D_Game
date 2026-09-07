// Web Audio API Synthesizer for Palmetto Shores '86
// Fully self-contained procedural 80s audio engine (zero external audio file dependencies)

export class SoundSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;

    // Engine sound nodes
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;

    // Drifting tire screech
    this.screechNode = null;
    this.screechGain = null;

    // Ocean ambient sound
    this.oceanGain = null;

    // 80s Synthwave Radio Loop
    this.radioPlaying = false;
    this.radioTimer = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.setupEngineSound();
    this.setupScreechSound();
    this.setupOceanSound();
  }

  unlockAudio() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleAudio() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.ctx) {
      if (this.engineGain) this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
      if (this.screechGain) this.screechGain.gain.setValueAtTime(0, this.ctx.currentTime);
      if (this.oceanGain) this.oceanGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.enabled;
  }

  setupEngineSound() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    this.engineOsc1 = ctx.createOscillator();
    this.engineOsc2 = ctx.createOscillator();
    this.engineGain = ctx.createGain();
    this.engineFilter = ctx.createBiquadFilter();

    this.engineOsc1.type = 'sawtooth';
    this.engineOsc2.type = 'triangle';
    this.engineOsc1.frequency.setValueAtTime(45, ctx.currentTime);
    this.engineOsc2.frequency.setValueAtTime(22.5, ctx.currentTime);

    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(320, ctx.currentTime);

    this.engineGain.gain.setValueAtTime(0, ctx.currentTime);

    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(ctx.destination);

    this.engineOsc1.start();
    this.engineOsc2.start();
  }

  updateEngine(speed, maxSpeed, isDriving) {
    if (!this.enabled || !this.ctx || !this.engineGain) return;
    const ctx = this.ctx;

    if (!isDriving) {
      this.engineGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      return;
    }

    const normSpeed = Math.min(1.0, Math.abs(speed) / (maxSpeed || 500));
    const baseFreq = 42 + normSpeed * 130;
    const filterFreq = 300 + normSpeed * 800;

    this.engineOsc1.frequency.setTargetAtTime(baseFreq, ctx.currentTime, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 0.5, ctx.currentTime, 0.05);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, ctx.currentTime, 0.05);

    const targetGain = 0.12 + normSpeed * 0.10;
    this.engineGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);
  }

  setupScreechSound() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Pink/white noise buffer for tire friction
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    this.screechGain = ctx.createGain();
    this.screechGain.gain.setValueAtTime(0, ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.screechGain);
    this.screechGain.connect(ctx.destination);

    noise.start();
  }

  setDriftScreech(isDrifting) {
    if (!this.enabled || !this.ctx || !this.screechGain) return;
    const targetGain = isDrifting ? 0.14 : 0;
    this.screechGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.06);
  }

  setupOceanSound() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    this.oceanGain = ctx.createGain();
    this.oceanGain.gain.setValueAtTime(0, ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.oceanGain);
    this.oceanGain.connect(ctx.destination);

    noise.start();
  }

  updateOceanAmbient(playerX) {
    if (!this.enabled || !this.ctx || !this.oceanGain) return;
    // Ocean is at X >= 6900
    const distToCoast = Math.max(0, 6900 - playerX);
    const volume = Phaser.Math.Clamp(1 - distToCoast / 1500, 0, 0.22);
    this.oceanGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
  }

  playHorn() {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    // Dual-tone 80s automobile horn (F and A)
    osc1.frequency.setValueAtTime(349.23, ctx.currentTime);
    osc2.frequency.setValueAtTime(440.00, ctx.currentTime);
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.35);
    osc2.stop(ctx.currentTime + 0.35);
  }

  playCrash() {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  playEnterCar() {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx;

    // Car door thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }
}

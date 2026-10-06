/**
 * Lo-Fi Audio Synthesizer with Audio-Reactive Beat Energy & Ambiance Control
 */

export class LoFiAudio {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.muted = false;
    this.volume = 0.55;

    this.masterGain = null;
    this.analyser = null;

    // Ambient sources
    this.rainSource = null;
    this.rainGain = null;
    this.rainFilter = null;
    this.rainIntensity = 0.6; // 0 to 1

    this.crackleSource = null;
    this.crackleGain = null;
    this.crackleLevel = 0.5; // 0 to 1

    // Music loop
    this.chordInterval = null;
    this.chordStep = 0;
    this.currentTrackIndex = 0;

    // Audio-reactive beat energy for pulsating neon signs
    this.beatEnergy = 0;

    this.tracks = [
      {
        name: 'Midnight Rain',
        interval: 2800,
        chords: [
          [146.83, 220.00, 261.63, 329.63, 392.00], // Dm9
          [196.00, 246.94, 329.63, 392.00, 440.00], // G13
          [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj9
          [174.61, 220.00, 261.63, 329.63, 392.00]  // Fmaj7
        ]
      },
      {
        name: 'Sakura Tea',
        interval: 2600,
        chords: [
          [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9
          [164.81, 196.00, 246.94, 293.66, 329.63], // Em7
          [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
          [130.81, 164.81, 196.00, 246.94, 293.66]  // Cmaj7
        ]
      },
      {
        name: 'Neon Cosmos',
        interval: 3000,
        chords: [
          [207.65, 261.63, 311.13, 392.00], // Abmaj7
          [174.61, 207.65, 261.63, 311.13], // Fm9
          [233.08, 277.18, 349.23, 415.30], // Bbm7
          [155.56, 196.00, 233.08, 293.66]  // Eb9
        ]
      }
    ];

    // Pentatonic scale for chain star pickups
    this.starScale = [311.13, 369.99, 415.30, 466.16, 554.37, 622.25, 739.99, 830.61];
    this.starChain = 0;
    this.starChainTimer = null;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.startRainNoise();
      this.startVinylCrackle();
      this.startTrack();
      this.initialized = true;
    } catch (e) {
      console.warn('Audio Context waiting for interaction', e);
    }
  }

  resume() {
    if (!this.initialized) this.init();
    else if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.muted;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  setRainIntensity(val) {
    this.rainIntensity = Math.max(0, Math.min(1, val));
    if (this.rainGain && this.rainFilter && this.ctx) {
      this.rainGain.gain.setValueAtTime(this.rainIntensity * 0.28, this.ctx.currentTime);
      this.rainFilter.frequency.setValueAtTime(300 + this.rainIntensity * 1200, this.ctx.currentTime);
    }
  }

  setVinylLevel(val) {
    this.crackleLevel = Math.max(0, Math.min(1, val));
    if (this.crackleGain && this.ctx) {
      this.crackleGain.gain.setValueAtTime(this.crackleLevel * 0.16, this.ctx.currentTime);
    }
  }

  cycleTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.startTrack();
    return this.tracks[this.currentTrackIndex].name;
  }

  getCurrentTrackName() {
    return this.tracks[this.currentTrackIndex].name;
  }

  startTrack() {
    if (this.chordInterval) clearInterval(this.chordInterval);
    this.chordStep = 0;
    this.playNextChord();
    const track = this.tracks[this.currentTrackIndex];
    this.chordInterval = setInterval(() => {
      if (!this.muted && this.ctx && this.ctx.state === 'running') {
        this.playNextChord();
      }
    }, track.interval);
  }

  startRainNoise() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = buffer;
    this.rainSource.loop = true;

    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = 'lowpass';
    this.rainFilter.frequency.setValueAtTime(300 + this.rainIntensity * 1200, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(this.rainIntensity * 0.22, this.ctx.currentTime);

    this.rainSource.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    this.rainSource.start();
  }

  startVinylCrackle() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.002) {
        data[i] = (Math.random() * 2 - 1) * 0.35;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.007;
      }
    }

    this.crackleSource = this.ctx.createBufferSource();
    this.crackleSource.buffer = buffer;
    this.crackleSource.loop = true;

    this.crackleGain = this.ctx.createGain();
    this.crackleGain.gain.setValueAtTime(this.crackleLevel * 0.12, this.ctx.currentTime);

    this.crackleSource.connect(this.crackleGain);
    this.crackleGain.connect(this.masterGain);
    this.crackleSource.start();
  }

  playNextChord() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const track = this.tracks[this.currentTrackIndex];
    const chord = track.chords[this.chordStep % track.chords.length];
    this.chordStep++;

    // Trigger visual pulse energy spike!
    this.beatEnergy = 1.0;

    const now = this.ctx.currentTime;
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq * (1 + (Math.random() - 0.5) * 0.004), now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(720, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 2.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.12 + idx * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.035);
      osc.stop(now + 2.6);
    });
  }

  updateBeatEnergy() {
    // Decay the beat pulse smoothly every frame
    if (this.beatEnergy > 0) {
      this.beatEnergy *= 0.92;
      if (this.beatEnergy < 0.01) this.beatEnergy = 0;
    }
  }

  getBeatEnergy() {
    return this.beatEnergy;
  }

  // --- Sound Effects ---

  playJump() {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playDoubleJump() {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.03);
      gain.gain.setValueAtTime(0.08, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.13);
    });
  }

  playMatchaLaunch() {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playDash() {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.18);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  playBeanCollect() {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playStarCollect() {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const freq = this.starScale[this.starChain % this.starScale.length];
    this.starChain++;
    if (this.starChainTimer) clearTimeout(this.starChainTimer);
    this.starChainTimer = setTimeout(() => { this.starChain = 0; }, 1800);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playPowerup() {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880, 1108.73].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.05);
      gain.gain.setValueAtTime(0.12, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.28);
    });
  }

  playMissionSuccess() {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    // Joyful major arpeggio fanfare
    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.06);
      gain.gain.setValueAtTime(0.16, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.38);
    });
  }

  playBubbleShieldPop() {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.16);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  getVisualizerData() {
    if (!this.analyser) return new Uint8Array(16);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
}

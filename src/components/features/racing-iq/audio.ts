/**
 * Racing IQ — sound. Everything is synthesized in the Web Audio API:
 * wind/peloton ambience from filtered noise, a heartbeat that leans in
 * as the matches run out, crowd swell for the finale, one small family
 * of UI sounds. No samples, no network, nothing to load.
 *
 * Autoplay policy: the context is only created/resumed from a user
 * gesture (init() is called from the start button).
 */

export class RaceAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private crowdGain: GainNode | null = null;
  private heartGain: GainNode | null = null;
  private heartTimer: ReturnType<typeof setInterval> | null = null;
  private heartRate = 0; // 0 off … 1 redline
  private muted = false;
  enabled = false;

  /** Call from a user gesture. Safe to call repeatedly. */
  init(): void {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.7;
    this.master.connect(ctx.destination);
    this.enabled = true;

    // ── Ambience: wind + drivetrain hiss ──
    const noise = this.noiseSource();
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 420;
    windFilter.Q.value = 0.6;
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.13;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 180;
    windLfo.connect(windLfoGain).connect(windFilter.frequency);
    windLfo.start();
    this.ambienceGain = ctx.createGain();
    this.ambienceGain.gain.value = 0;
    noise.connect(windFilter).connect(this.ambienceGain).connect(this.master);

    // High, quiet chain-hiss layer
    const hiss = this.noiseSource();
    const hissFilter = ctx.createBiquadFilter();
    hissFilter.type = "highpass";
    hissFilter.frequency.value = 5200;
    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.015;
    hiss.connect(hissFilter).connect(hissGain).connect(this.ambienceGain);

    // ── Crowd bed (gated by setCrowd) ──
    const crowdNoise = this.noiseSource();
    const crowdFilter = ctx.createBiquadFilter();
    crowdFilter.type = "bandpass";
    crowdFilter.frequency.value = 900;
    crowdFilter.Q.value = 0.4;
    const swellLfo = ctx.createOscillator();
    swellLfo.frequency.value = 0.21;
    const swellGain = ctx.createGain();
    swellGain.gain.value = 300;
    swellLfo.connect(swellGain).connect(crowdFilter.frequency);
    swellLfo.start();
    this.crowdGain = ctx.createGain();
    this.crowdGain.gain.value = 0;
    crowdNoise.connect(crowdFilter).connect(this.crowdGain).connect(this.master);

    // ── Heartbeat bus ──
    this.heartGain = ctx.createGain();
    this.heartGain.gain.value = 0;
    this.heartGain.connect(this.master);
    this.heartTimer = setInterval(() => this.heartbeat(), 200);

    this.fade(this.ambienceGain.gain, 0.12, 2);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.fade(this.master.gain, muted ? 0 : 0.7, 0.2);
    }
  }

  /** 0..1 — how loud the race ambience should ride. */
  setIntensity(v: number): void {
    if (this.ambienceGain) this.fade(this.ambienceGain.gain, 0.06 + v * 0.12, 1.5);
  }

  setCrowd(on: boolean): void {
    if (this.crowdGain) this.fade(this.crowdGain.gain, on ? 0.1 : 0, 2.5);
  }

  /** Heartbeat leans in as matches depart. matchesLeft 0–5. */
  setMatchesLeft(matchesLeft: number): void {
    this.heartRate = Math.max(0, (3 - matchesLeft) / 3);
    if (this.heartGain) {
      this.fade(this.heartGain.gain, this.heartRate > 0 ? 0.16 + this.heartRate * 0.2 : 0, 1.5);
    }
  }

  // ── UI sound family ──

  uiOpen(): void {
    this.sweep(900, 240, 0.25, 0.05);
  }

  uiFocus(): void {
    this.blip(660, 0.02, 0.03);
  }

  uiConfirm(): void {
    this.blip(440, 0.05, 0.07);
    setTimeout(() => this.blip(660, 0.05, 0.06), 90);
  }

  /** The match strike: noise burst + crackle tail. */
  matchStrike(): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    const burst = this.noiseSource();
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 0.4);
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.32, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    burst.connect(filter).connect(gain).connect(this.master);
    // Crackle: a few tiny pops while the head flares
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.blip(1800 + Math.random() * 1400, 0.012, 0.018), 60 + i * 70);
    }
    this.stopLater(burst, 0.7);
  }

  dispose(): void {
    if (this.heartTimer) clearInterval(this.heartTimer);
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
  }

  // ── internals ──

  private heartbeatPhase = 0;
  private heartbeat(): void {
    if (!this.ctx || !this.heartGain || this.heartRate <= 0) return;
    // Period shortens with intensity: 1.1s calm → 0.55s redline.
    const period = 1.1 - this.heartRate * 0.55;
    this.heartbeatPhase += 0.2;
    if (this.heartbeatPhase < period) return;
    this.heartbeatPhase = 0;
    this.thump(0);
    this.thump(0.14);
  }

  private thump(delay: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.heartGain) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(58, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(1, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain).connect(this.heartGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  private blip(freq: number, attack: number, release: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + attack + release + 0.05);
  }

  private sweep(from: number, to: number, duration: number, level: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    const src = this.noiseSource();
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 2.5;
    filter.frequency.setValueAtTime(from, now);
    filter.frequency.exponentialRampToValueAtTime(to, now + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(level, now + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(filter).connect(gain).connect(this.master);
    this.stopLater(src, duration + 0.1);
  }

  private noiseSource(): AudioBufferSourceNode {
    const ctx = this.ctx!;
    const seconds = 2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.start();
    return src;
  }

  private stopLater(src: AudioBufferSourceNode, seconds: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    src.stop(ctx.currentTime + seconds);
  }

  private fade(param: AudioParam, target: number, seconds: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    param.cancelScheduledValues(ctx.currentTime);
    param.setTargetAtTime(target, ctx.currentTime, seconds / 3);
  }
}

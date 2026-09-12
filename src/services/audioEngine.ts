import { ProceduralTrackId } from '../types';

class AudioEngineService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeGenerators: Map<
    ProceduralTrackId,
    { stop: () => void; gain: GainNode }
  > = new Map();
  private isMuted: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getMasterGain(): GainNode {
    const ac = this.getContext();
    if (!this.masterGain) {
      this.masterGain = ac.createGain();
      this.masterGain.connect(ac.destination);
      this.masterGain.gain.value = this.isMuted ? 0 : 0.85;
    }
    return this.masterGain;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.1);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playCueTone(freqStart: number, freqEnd: number, dur: number, type: OscillatorType = 'sine') {
    if (this.isMuted) return;
    try {
      const ac = this.getContext();
      const t = ac.currentTime;
      const osc = ac.createOscillator();
      const g = ac.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), t + dur);

      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(g);
      g.connect(this.getMasterGain());

      osc.start(t);
      osc.stop(t + dur + 0.05);
    } catch {
      // Audio context might be waiting for user gesture
    }
  }

  public playCompletionHarmonic() {
    this.playCueTone(392, 392, 0.9);
    setTimeout(() => this.playCueTone(523.25, 523.25, 1.4), 260);
    setTimeout(() => this.playCueTone(659.25, 659.25, 1.8), 520);
  }

  private createNoiseBuffer(type: 'brown' | 'white'): AudioBuffer {
    const ac = this.getContext();
    const len = Math.floor(ac.sampleRate * 4);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);

    if (type === 'brown') {
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        d[i] = last * 3.2;
      }
    } else {
      for (let i = 0; i < len; i++) {
        d[i] = Math.random() * 2 - 1;
      }
    }
    return buf;
  }

  private createLoopSource(buf: AudioBuffer): AudioBufferSourceNode {
    const ac = this.getContext();
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  }

  // Procedural Generators
  public toggleTrack(id: ProceduralTrackId, volumePercent: number = 60): boolean {
    if (this.activeGenerators.has(id)) {
      this.stopTrack(id);
      return false;
    } else {
      this.startTrack(id, volumePercent);
      return true;
    }
  }

  public isTrackPlaying(id: ProceduralTrackId): boolean {
    return this.activeGenerators.has(id);
  }

  public setTrackVolume(id: ProceduralTrackId, volumePercent: number) {
    const gen = this.activeGenerators.get(id);
    if (gen && this.ctx) {
      const vol = (volumePercent / 100) * 0.85;
      gen.gain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }

  public stopTrack(id: ProceduralTrackId) {
    const gen = this.activeGenerators.get(id);
    if (!gen || !this.ctx) return;
    this.activeGenerators.delete(id);

    try {
      gen.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      setTimeout(() => {
        gen.stop();
        gen.gain.disconnect();
      }, 400);
    } catch {
      // Ignored
    }
  }

  public stopAllTracks() {
    const keys = Array.from(this.activeGenerators.keys());
    keys.forEach((k) => this.stopTrack(k));
  }

  private startTrack(id: ProceduralTrackId, volumePercent: number) {
    const ac = this.getContext();
    const master = this.getMasterGain();
    const gain = ac.createGain();
    const vol = (volumePercent / 100) * 0.85;

    gain.gain.setValueAtTime(0.001, ac.currentTime);
    gain.connect(master);

    let stopFn = () => {};

    switch (id) {
      case 'rain': {
        const n1 = this.createLoopSource(this.createNoiseBuffer('white'));
        const hp = ac.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 600;
        const g1 = ac.createGain();
        g1.gain.value = 0.28;
        n1.connect(hp);
        hp.connect(g1);
        g1.connect(gain);

        const n2 = this.createLoopSource(this.createNoiseBuffer('white'));
        const bp = ac.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 2400;
        bp.Q.value = 0.9;
        const g2 = ac.createGain();
        g2.gain.value = 0.14;
        n2.connect(bp);
        bp.connect(g2);
        g2.connect(gain);

        const dropInterval = setInterval(() => {
          if (Math.random() < 0.6) {
            const t = ac.currentTime;
            const osc = ac.createOscillator();
            const g = ac.createGain();
            osc.frequency.value = 400 + Math.random() * 1100;
            g.gain.setValueAtTime(0.015 + Math.random() * 0.02, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08 + Math.random() * 0.08);
            osc.connect(g);
            g.connect(gain);
            osc.start(t);
            osc.stop(t + 0.18);
          }
        }, 90);

        n1.start();
        n2.start();
        stopFn = () => {
          clearInterval(dropInterval);
          try {
            n1.stop();
            n2.stop();
          } catch {}
        };
        break;
      }
      case 'ocean': {
        const n = this.createLoopSource(this.createNoiseBuffer('brown'));
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 420;
        const g = ac.createGain();
        g.gain.value = 0.12;

        const l1 = ac.createOscillator();
        const lg1 = ac.createGain();
        l1.frequency.value = 0.075;
        lg1.gain.value = 0.45;
        l1.connect(lg1);
        lg1.connect(g.gain);

        n.connect(lp);
        lp.connect(g);
        g.connect(gain);
        n.start();
        l1.start();
        stopFn = () => {
          try {
            n.stop();
            l1.stop();
          } catch {}
        };
        break;
      }
      case 'brown': {
        const n = this.createLoopSource(this.createNoiseBuffer('brown'));
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 460;
        n.connect(lp);
        lp.connect(gain);
        n.start();
        stopFn = () => {
          try {
            n.stop();
          } catch {}
        };
        break;
      }
      case 'om': {
        const o1 = ac.createOscillator();
        const o2 = ac.createOscillator();
        const og1 = ac.createGain();
        const og2 = ac.createGain();
        o1.type = 'sine';
        o1.frequency.value = 136.1;
        og1.gain.value = 0.35;
        o2.type = 'sine';
        o2.frequency.value = 68.05;
        og2.gain.value = 0.25;

        o1.connect(og1);
        og1.connect(gain);
        o2.connect(og2);
        og2.connect(gain);
        o1.start();
        o2.start();
        stopFn = () => {
          try {
            o1.stop();
            o2.stop();
          } catch {}
        };
        break;
      }
      case 'theta': {
        // Binaural 6Hz
        const merger = ac.createChannelMerger(2);
        const oL = ac.createOscillator();
        const oR = ac.createOscillator();
        const gL = ac.createGain();
        const gR = ac.createGain();
        oL.type = 'sine';
        oL.frequency.value = 216;
        gL.gain.value = 0.22;
        oR.type = 'sine';
        oR.frequency.value = 222;
        gR.gain.value = 0.22;

        oL.connect(gL);
        gL.connect(merger, 0, 0);
        oR.connect(gR);
        gR.connect(merger, 0, 1);
        merger.connect(gain);

        oL.start();
        oR.start();
        stopFn = () => {
          try {
            oL.stop();
            oR.stop();
          } catch {}
        };
        break;
      }
      case 'solfeggio': {
        const osc = ac.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 528;
        const lfo = ac.createOscillator();
        const lfoG = ac.createGain();
        lfo.frequency.value = 0.2;
        lfoG.gain.value = 0.04;
        lfo.connect(lfoG);
        lfoG.connect(gain.gain);

        osc.connect(gain);
        osc.start();
        lfo.start();
        stopFn = () => {
          try {
            osc.stop();
            lfo.stop();
          } catch {}
        };
        break;
      }
      case 'fire': {
        const n = this.createLoopSource(this.createNoiseBuffer('brown'));
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 320;
        n.connect(lp);
        lp.connect(gain);
        n.start();

        const crackleIv = setInterval(() => {
          if (Math.random() < 0.4) {
            const t0 = ac.currentTime;
            const o = ac.createOscillator();
            const cg = ac.createGain();
            o.type = 'triangle';
            o.frequency.value = 110 + Math.random() * 380;
            cg.gain.setValueAtTime(0.04, t0);
            cg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05 + Math.random() * 0.05);
            o.connect(cg);
            cg.connect(gain);
            o.start(t0);
            o.stop(t0 + 0.12);
          }
        }, 95);

        stopFn = () => {
          clearInterval(crackleIv);
          try {
            n.stop();
          } catch {}
        };
        break;
      }
      case 'delta': {
        // Binaural 2Hz deep delta
        const merger = ac.createChannelMerger(2);
        const oL = ac.createOscillator();
        const oR = ac.createOscillator();
        const gL = ac.createGain();
        const gR = ac.createGain();
        oL.frequency.value = 100;
        oR.frequency.value = 102;
        gL.gain.value = 0.3;
        gR.gain.value = 0.3;

        oL.connect(gL);
        gL.connect(merger, 0, 0);
        oR.connect(gR);
        gR.connect(merger, 0, 1);
        merger.connect(gain);

        oL.start();
        oR.start();
        stopFn = () => {
          try {
            oL.stop();
            oR.stop();
          } catch {}
        };
        break;
      }
      case 'pure432': {
        const osc = ac.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 432;
        osc.connect(gain);
        osc.start();
        stopFn = () => {
          try {
            osc.stop();
          } catch {}
        };
        break;
      }
      case 'harp': {
        // Generative Ethereal Pentatonic Arpeggios (C-D-E-G-A)
        const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
        let isRunning = true;

        const playRandomNote = () => {
          if (!isRunning || !this.ctx) return;
          const t = ac.currentTime;
          const noteFreq = notes[Math.floor(Math.random() * notes.length)];
          const osc = ac.createOscillator();
          const noteGain = ac.createGain();
          const filter = ac.createBiquadFilter();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(noteFreq, t);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, t);
          filter.frequency.exponentialRampToValueAtTime(300, t + 2.5);

          noteGain.gain.setValueAtTime(0.0001, t);
          noteGain.gain.linearRampToValueAtTime(0.18, t + 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(gain);

          osc.start(t);
          osc.stop(t + 3.4);

          const nextDelay = 1200 + Math.random() * 1600;
          if (isRunning) {
            noteTimeout = setTimeout(playRandomNote, nextDelay);
          }
        };

        let noteTimeout = setTimeout(playRandomNote, 400);

        stopFn = () => {
          isRunning = false;
          clearTimeout(noteTimeout);
        };
        break;
      }
      case 'tibetan': {
        // Deep Tibetan Singing Bowl with rich resonant harmonics and slow tremolo
        const fundamental = 216; // A3 harmonic
        const osc1 = ac.createOscillator();
        const osc2 = ac.createOscillator();
        const osc3 = ac.createOscillator();
        const g1 = ac.createGain();
        const g2 = ac.createGain();
        const g3 = ac.createGain();

        // Tremolo LFO
        const lfo = ac.createOscillator();
        const lfoG = ac.createGain();
        lfo.frequency.value = 0.18; // 0.18 Hz gentle pulsing
        lfoG.gain.value = 0.06;
        lfo.connect(lfoG);
        lfoG.connect(gain.gain);

        osc1.type = 'sine';
        osc1.frequency.value = fundamental;
        g1.gain.value = 0.3;

        osc2.type = 'sine';
        osc2.frequency.value = fundamental * 2.01; // subtle detuning
        g2.gain.value = 0.16;

        osc3.type = 'sine';
        osc3.frequency.value = fundamental * 3.005;
        g3.gain.value = 0.07;

        osc1.connect(g1);
        g1.connect(gain);
        osc2.connect(g2);
        g2.connect(gain);
        osc3.connect(g3);
        g3.connect(gain);

        osc1.start();
        osc2.start();
        osc3.start();
        lfo.start();

        stopFn = () => {
          try {
            osc1.stop();
            osc2.stop();
            osc3.stop();
            lfo.stop();
          } catch {}
        };
        break;
      }
      case 'wind': {
        // Soft Whispering Forest Wind with shifting lowpass filter
        const n = this.createLoopSource(this.createNoiseBuffer('brown'));
        const bp = ac.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 360;
        bp.Q.value = 1.4;

        const lfo = ac.createOscillator();
        const lfoG = ac.createGain();
        lfo.frequency.value = 0.09; // slow wind gusts
        lfoG.gain.value = 180;
        lfo.connect(lfoG);
        lfoG.connect(bp.frequency);

        n.connect(bp);
        bp.connect(gain);

        n.start();
        lfo.start();

        stopFn = () => {
          try {
            n.stop();
            lfo.stop();
          } catch {}
        };
        break;
      }
    }

    gain.gain.setTargetAtTime(vol, ac.currentTime, 0.6);
    this.activeGenerators.set(id, { stop: stopFn, gain });
  }
}

export const audioEngine = new AudioEngineService();

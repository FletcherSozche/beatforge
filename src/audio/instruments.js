import * as Tone from 'tone';
import { getMasterInput } from './engine.js';

export const TRACK_DEFS = [
  { id: 'kick',   name: 'Kick',     icon: 'K', color: '#ff4d6d', type: 'drum',  cssVar: '--kick' },
  { id: 'sub',    name: 'Sub Bass', icon: 'B', color: '#f472b6', type: 'bass',  cssVar: '--sub' },
  { id: 'snare',  name: 'Snare',    icon: 'S', color: '#ff9d3a', type: 'drum',  cssVar: '--snare' },
  { id: 'clap',   name: 'Clap',     icon: 'C', color: '#6bcf7f', type: 'drum',  cssVar: '--clap' },
  { id: 'hat',    name: 'Hi-Hat',   icon: 'H', color: '#ffd93d', type: 'drum',  cssVar: '--hat' },
  { id: 'ohat',   name: 'Open Hat', icon: 'O', color: '#facc15', type: 'drum',  cssVar: '--hat' },
  { id: 'crash',  name: 'Crash',    icon: 'X', color: '#4dabf7', type: 'drum',  cssVar: '--crash' },
  { id: 'wobble', name: 'Wobble',   icon: 'W', color: '#fb923c', type: 'wobble',cssVar: '--wobble' },
  { id: 'bass',   name: 'Reese',    icon: 'R', color: '#a78bfa', type: 'reese', cssVar: '--bass' },
  { id: 'lead',   name: 'Lead',     icon: 'L', color: '#34d399', type: 'lead',  cssVar: '--lead' }
];

const instruments = new Map();
const channels = new Map();

function createChannel(trackId) {
  const channel = new Tone.Channel({ volume: -8, pan: 0 });
  const meter = new Tone.Meter({ smoothing: 0.8 });
  channel.connect(meter);
  channel.connect(getMasterInput());
  channels.set(trackId, { channel, meter, fxNodes: [] });
  return channel;
}

export function getChannel(trackId) {
  if (!channels.has(trackId)) createChannel(trackId);
  return channels.get(trackId);
}

function buildInstrument(def) {
  const ch = getChannel(def.id).channel;

  switch (def.id) {
    case 'kick': {
      const kick = new Tone.MembraneSynth({
        pitchDecay: 0.04,
        octaves: 8,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.2, attackCurve: 'exponential' }
      });
      const lp = new Tone.Filter(120, 'lowpass');
      kick.chain(lp, ch);
      return { trigger: (time, vel = 1) => kick.triggerAttackRelease('C1', '8n', time, vel), node: kick };
    }

    case 'snare': {
      const noise = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.1 }
      });
      const tone = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.1 }
      });
      const hp = new Tone.Filter(1800, 'highpass');
      noise.connect(hp);
      hp.connect(ch);
      tone.connect(ch);
      return {
        trigger: (time, vel = 1) => {
          noise.triggerAttackRelease('8n', time, vel);
          tone.triggerAttackRelease('E2', '16n', time, vel * 0.7);
        },
        node: noise
      };
    }

    case 'clap': {
      const clap = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.15 }
      });
      const bp = new Tone.Filter(1500, 'bandpass', -12);
      bp.Q.value = 2.5;
      clap.chain(bp, ch);
      return { trigger: (time, vel = 1) => clap.triggerAttackRelease('16n', time, vel), node: clap };
    }

    case 'hat': {
      const hat = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.05, release: 0.02 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      });
      const hp = new Tone.Filter(7000, 'highpass');
      hat.chain(hp, ch);
      hat.volume.value = -14;
      return { trigger: (time, vel = 1) => hat.triggerAttackRelease('32n', time, vel), node: hat };
    }

    case 'ohat': {
      const ohat = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.5, release: 0.3 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      });
      const hp = new Tone.Filter(6000, 'highpass');
      ohat.chain(hp, ch);
      ohat.volume.value = -16;
      return { trigger: (time, vel = 1) => ohat.triggerAttackRelease('8n', time, vel), node: ohat };
    }

    case 'crash': {
      const crash = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 1.4, release: 1.5 },
        harmonicity: 8.5,
        modulationIndex: 40,
        resonance: 3000,
        octaves: 2
      });
      const hp = new Tone.Filter(3000, 'highpass');
      crash.chain(hp, ch);
      crash.volume.value = -18;
      return { trigger: (time, vel = 1) => crash.triggerAttackRelease('2n', time, vel), node: crash };
    }

    case 'sub': {
      const sub = new Tone.MonoSynth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.9, release: 0.3 },
        filter: { type: 'lowpass', frequency: 200, Q: 1 },
        filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4, baseFrequency: 80, octaves: 2 }
      });
      sub.connect(ch);
      sub.volume.value = -4;
      return {
        trigger: (time, vel = 1, note = 'C1', dur = '8n') => sub.triggerAttackRelease(note, dur, time, vel),
        node: sub,
        polyphonic: false
      };
    }

    case 'wobble': {
      const wob = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.005, decay: 0.05, sustain: 1, release: 0.1 },
        filter: { type: 'lowpass', frequency: 200, Q: 8 },
        filterEnvelope: { attack: 0.001, decay: 0.05, sustain: 1, release: 0.05, baseFrequency: 200, octaves: 0 }
      });
      const lfo = new Tone.LFO({ frequency: '8n', min: 80, max: 2200, type: 'sine' });
      lfo.connect(wob.filter.frequency);
      lfo.start();
      const dist = new Tone.Distortion({ distortion: 0.4, wet: 0.3 });
      wob.chain(dist, ch);
      return {
        trigger: (time, vel = 1, note = 'C1', dur = '8n') => wob.triggerAttackRelease(note, dur, time, vel),
        node: wob,
        lfo,
        setLfoRate: (rate) => { lfo.frequency.value = rate; },
        polyphonic: false
      };
    }

    case 'bass': {
      const reese = new Tone.PolySynth(Tone.MonoSynth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.4 },
        filter: { type: 'lowpass', frequency: 800, Q: 2 },
        filterEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.5, baseFrequency: 200, octaves: 3 }
      });
      reese.maxPolyphony = 6;
      const detune = new Tone.Chorus({ frequency: 0.5, delayTime: 4, depth: 0.6, wet: 0.4 }).start();
      reese.chain(detune, ch);
      return {
        trigger: (time, vel = 1, note = 'A1', dur = '8n') => reese.triggerAttackRelease(note, dur, time, vel),
        node: reese,
        polyphonic: true
      };
    }

    case 'lead': {
      const lead = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.5, release: 0.6 }
      });
      lead.maxPolyphony = 8;
      const filt = new Tone.Filter(3000, 'lowpass');
      lead.chain(filt, ch);
      lead.volume.value = -10;
      return {
        trigger: (time, vel = 1, note = 'C5', dur = '8n') => lead.triggerAttackRelease(note, dur, time, vel),
        node: lead,
        polyphonic: true
      };
    }

    default:
      return null;
  }
}

export function initInstruments() {
  TRACK_DEFS.forEach((def) => {
    if (!instruments.has(def.id)) {
      const inst = buildInstrument(def);
      if (inst) instruments.set(def.id, inst);
    }
  });
  return instruments;
}

export function getInstrument(trackId) {
  if (!instruments.has(trackId)) {
    const def = TRACK_DEFS.find((d) => d.id === trackId);
    if (def) instruments.set(trackId, buildInstrument(def));
  }
  return instruments.get(trackId);
}

export function getAllInstruments() {
  return instruments;
}

export function setTrackVolume(trackId, db) {
  const ch = getChannel(trackId);
  if (ch) ch.channel.volume.rampTo(db, 0.05);
}

export function setTrackPan(trackId, pan) {
  const ch = getChannel(trackId);
  if (ch) ch.channel.pan.rampTo(pan, 0.05);
}

export function setTrackMute(trackId, mute) {
  const ch = getChannel(trackId);
  if (ch) ch.channel.mute = mute;
}

export function setTrackSolo(trackId, solo) {
  const ch = getChannel(trackId);
  if (ch) ch.channel.solo = solo;
}

export function getTrackLevel(trackId) {
  const ch = getChannel(trackId);
  if (!ch) return -Infinity;
  const v = ch.meter.getValue();
  return typeof v === 'number' ? v : v[0] || -Infinity;
}

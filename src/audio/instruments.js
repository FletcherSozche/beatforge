import * as Tone from 'tone';
import { getMasterInput } from './engine.js';
import { hasSample, getSample, triggerSample, assignSample, clearSample } from './samples.js';

export const TRACK_DEFS = [
  { id: 'kick',     name: 'Kick',       icon: 'K', color: '#ff4d6d', type: 'drum',   cssVar: '--kick' },
  { id: 'sub',      name: 'Sub Bass',   icon: 'B', color: '#f472b6', type: 'bass',   cssVar: '--sub' },
  { id: 'snare',    name: 'Snare',      icon: 'S', color: '#ff9d3a', type: 'drum',   cssVar: '--snare' },
  { id: 'clap',     name: 'Clap',       icon: 'C', color: '#6bcf7f', type: 'drum',   cssVar: '--clap' },
  { id: 'rim',      name: 'Rim',        icon: 'R', color: '#a3e635', type: 'drum',   cssVar: '--hat' },
  { id: 'tom-hi',   name: 'Tom Hi',     icon: 'T', color: '#22d3ee', type: 'drum',   cssVar: '--crash' },
  { id: 'tom-mid',  name: 'Tom Mid',    icon: 't', color: '#06b6d4', type: 'drum',   cssVar: '--crash' },
  { id: 'tom-lo',   name: 'Tom Lo',     icon: 'o', color: '#0891b2', type: 'drum',   cssVar: '--crash' },
  { id: 'hat',      name: 'Hi-Hat',     icon: 'H', color: '#ffd93d', type: 'drum',   cssVar: '--hat' },
  { id: 'ohat',     name: 'Open Hat',   icon: 'O', color: '#facc15', type: 'drum',   cssVar: '--hat' },
  { id: 'shaker',   name: 'Shaker',     icon: 's', color: '#fde047', type: 'drum',   cssVar: '--hat' },
  { id: 'cowbell',  name: 'Cowbell',    icon: 'B', color: '#fb923c', type: 'drum',   cssVar: '--wobble' },
  { id: 'ride',     name: 'Ride',       icon: 'D', color: '#60a5fa', type: 'drum',   cssVar: '--crash' },
  { id: 'crash',    name: 'Crash',      icon: 'X', color: '#4dabf7', type: 'drum',   cssVar: '--crash' },
  { id: 'crash2',   name: 'Crash 2',    icon: 'Y', color: '#818cf8', type: 'drum',   cssVar: '--crash' },
  { id: 'fx',       name: 'FX Hit',     icon: '!', color: '#e879f9', type: 'fx',     cssVar: '--wobble' },
  { id: 'wobble',   name: 'Wobble',     icon: 'W', color: '#fb923c', type: 'wobble', cssVar: '--wobble' },
  { id: 'bass',     name: 'Reese',      icon: 'R', color: '#a78bfa', type: 'reese',  cssVar: '--bass' },
  { id: 'lead',     name: 'Lead',       icon: 'L', color: '#34d399', type: 'lead',   cssVar: '--lead' },
  { id: 'pad',      name: 'Pad',        icon: 'P', color: '#10b981', type: 'pad',    cssVar: '--lead' },
  { id: 'pluck',    name: 'Pluck',      icon: 'p', color: '#84cc16', type: 'pluck',  cssVar: '--lead' },
  { id: 'vocal1',   name: 'Vokal 1',    icon: 'V', color: '#ec4899', type: 'vocal',  cssVar: '--sub' },
  { id: 'vocal2',   name: 'Vokal 2',    icon: 'v', color: '#f43f5e', type: 'vocal',  cssVar: '--sub' },
  { id: 'vocal3',   name: 'Vokal 3',    icon: 'W', color: '#d946ef', type: 'vocal',  cssVar: '--sub' }
];

const instruments = new Map();
const channels = new Map();
const vocalRecordings = new Map();
let nextVocalId = 1;

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
        pitchDecay: 0.04, octaves: 8,
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
        pitchDecay: 0.02, octaves: 4,
        envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.1 }
      });
      const hp = new Tone.Filter(1800, 'highpass');
      noise.connect(hp); hp.connect(ch);
      tone.connect(ch);
      return {
        trigger: (time, vel = 1) => {
          noise.triggerAttackRelease('8n', time, vel);
          tone.triggerAttackRelease('E2', '16n', time, vel * 0.7);
        }, node: noise
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

    case 'rim': {
      const tone = new Tone.MembraneSynth({
        pitchDecay: 0.005, octaves: 6,
        envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.05 }
      });
      const click = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.02 }
      });
      const hp = new Tone.Filter(2000, 'highpass');
      tone.chain(hp, ch);
      click.connect(hp);
      tone.volume.value = -4;
      return {
        trigger: (time, vel = 1) => {
          tone.triggerAttackRelease('E4', '32n', time, vel);
          click.triggerAttackRelease('32n', time, vel * 0.6);
        }, node: tone
      };
    }

    case 'tom-hi': {
      const t = new Tone.MembraneSynth({
        pitchDecay: 0.06, octaves: 3,
        envelope: { attack: 0.001, decay: 0.25, sustain: 0.01, release: 0.3 }
      });
      t.chain(new Tone.Filter(4000, 'highpass'), ch);
      return { trigger: (time, vel = 1) => t.triggerAttackRelease('G3', '8n', time, vel), node: t };
    }
    case 'tom-mid': {
      const t = new Tone.MembraneSynth({
        pitchDecay: 0.07, octaves: 3,
        envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.3 }
      });
      t.chain(new Tone.Filter(3000, 'highpass'), ch);
      return { trigger: (time, vel = 1) => t.triggerAttackRelease('D3', '8n', time, vel), node: t };
    }
    case 'tom-lo': {
      const t = new Tone.MembraneSynth({
        pitchDecay: 0.08, octaves: 3,
        envelope: { attack: 0.001, decay: 0.35, sustain: 0.01, release: 0.4 }
      });
      t.chain(new Tone.Filter(2000, 'highpass'), ch);
      return { trigger: (time, vel = 1) => t.triggerAttackRelease('A2', '8n', time, vel), node: t };
    }

    case 'hat': {
      const hat = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.05, release: 0.02 },
        harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
      });
      const hp = new Tone.Filter(7000, 'highpass');
      hat.chain(hp, ch); hat.volume.value = -14;
      return { trigger: (time, vel = 1) => hat.triggerAttackRelease('32n', time, vel), node: hat };
    }
    case 'ohat': {
      const ohat = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.5, release: 0.3 },
        harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
      });
      ohat.chain(new Tone.Filter(6000, 'highpass'), ch); ohat.volume.value = -16;
      return { trigger: (time, vel = 1) => ohat.triggerAttackRelease('8n', time, vel), node: ohat };
    }
    case 'shaker': {
      const sh = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.05 }
      });
      const bp = new Tone.Filter(6500, 'bandpass', -12);
      bp.Q.value = 4;
      sh.chain(bp, ch); sh.volume.value = -12;
      return { trigger: (time, vel = 1) => sh.triggerAttackRelease('32n', time, vel), node: sh };
    }
    case 'cowbell': {
      const cb = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
        harmonicity: 2.4, modulationIndex: 10, resonance: 800, octaves: 1
      });
      cb.chain(new Tone.Filter(1200, 'bandpass', -12), ch);
      cb.volume.value = -10;
      return { trigger: (time, vel = 1) => cb.triggerAttackRelease('16n', time, vel), node: cb };
    }
    case 'ride': {
      const r = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.8, release: 0.5 },
        harmonicity: 6.5, modulationIndex: 40, resonance: 3500, octaves: 2
      });
      r.chain(new Tone.Filter(5500, 'highpass'), ch); r.volume.value = -14;
      return { trigger: (time, vel = 1) => r.triggerAttackRelease('4n', time, vel), node: r };
    }
    case 'crash': {
      const c = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 1.4, release: 1.5 },
        harmonicity: 8.5, modulationIndex: 40, resonance: 3000, octaves: 2
      });
      c.chain(new Tone.Filter(3000, 'highpass'), ch); c.volume.value = -18;
      return { trigger: (time, vel = 1) => c.triggerAttackRelease('2n', time, vel), node: c };
    }
    case 'crash2': {
      const c = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.9, release: 0.7 },
        harmonicity: 12, modulationIndex: 50, resonance: 4500, octaves: 2.5
      });
      c.chain(new Tone.Filter(4000, 'highpass'), ch); c.volume.value = -20;
      return { trigger: (time, vel = 1) => c.triggerAttackRelease('2n', time, vel), node: c };
    }
    case 'fx': {
      const noise = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.005, decay: 0.3, sustain: 0, release: 0.4 }
      });
      const filter = new Tone.AutoFilter('4n').start();
      filter.baseFrequency = 800; filter.octaves = 4;
      noise.chain(filter, ch); noise.volume.value = -6;
      return { trigger: (time, vel = 1) => noise.triggerAttackRelease('4n', time, vel), node: noise };
    }

    case 'sub': {
      const sub = new Tone.MonoSynth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.9, release: 0.3 },
        filter: { type: 'lowpass', frequency: 200, Q: 1 },
        filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4, baseFrequency: 80, octaves: 2 }
      });
      sub.connect(ch); sub.volume.value = -4;
      return {
        trigger: (time, vel = 1, note = 'C1', dur = '8n') => sub.triggerAttackRelease(note, dur, time, vel),
        node: sub, polyphonic: false
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
      lfo.connect(wob.filter.frequency); lfo.start();
      const dist = new Tone.Distortion({ distortion: 0.4, wet: 0.3 });
      wob.chain(dist, ch);
      return {
        trigger: (time, vel = 1, note = 'C1', dur = '8n') => wob.triggerAttackRelease(note, dur, time, vel),
        node: wob, lfo,
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
        node: reese, polyphonic: true
      };
    }
    case 'lead': {
      const lead = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.5, release: 0.6 }
      });
      lead.maxPolyphony = 8;
      const filt = new Tone.Filter(3000, 'lowpass');
      lead.chain(filt, ch); lead.volume.value = -10;
      return {
        trigger: (time, vel = 1, note = 'C5', dur = '8n') => lead.triggerAttackRelease(note, dur, time, vel),
        node: lead, polyphonic: true
      };
    }
    case 'pad': {
      const pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.6, decay: 0.4, sustain: 0.8, release: 1.2 }
      });
      pad.maxPolyphony = 10;
      const filt = new Tone.Filter(1800, 'lowpass');
      const reverb = new Tone.Reverb({ decay: 3, wet: 0.4 });
      pad.chain(filt, reverb, ch); pad.volume.value = -14;
      return {
        trigger: (time, vel = 1, note = 'C4', dur = '1n') => pad.triggerAttackRelease(note, dur, time, vel * 0.6),
        node: pad, polyphonic: true
      };
    }
    case 'pluck': {
      const pl = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.18, sustain: 0.0, release: 0.2 }
      });
      pl.maxPolyphony = 6;
      pl.chain(new Tone.Filter(3500, 'lowpass'), ch);
      pl.volume.value = -8;
      return {
        trigger: (time, vel = 1, note = 'C5', dur = '16n') => pl.triggerAttackRelease(note, dur, time, vel),
        node: pl, polyphonic: true
      };
    }

    case 'vocal1':
    case 'vocal2':
    case 'vocal3': {
      const player = new Tone.Player();
      const gain = new Tone.Gain(0);
      player.chain(gain, ch);
      vocalRecordings.set(def.id, { player, gain, buffer: null, name: `Vokal ${def.id.slice(-1)}` });
      return {
        trigger: (time, vel = 1) => {
          const rec = vocalRecordings.get(def.id);
          if (rec?.buffer) {
            const p = new Tone.Player(rec.buffer).toDestination();
            p.connect(ch);
            p.start(time);
            setTimeout(() => p.dispose(), (rec.buffer.duration + 0.5) * 1000);
          }
        },
        node: player,
        hasRecording: () => !!vocalRecordings.get(def.id)?.buffer,
        getName: () => vocalRecordings.get(def.id)?.name,
        setBuffer: (buf, name) => {
          const rec = vocalRecordings.get(def.id);
          if (rec) { rec.buffer = buf; if (name) rec.name = name; }
        },
        isVocal: true
      };
    }

    default:
      return null;
  }
}

export const VOCAL_TRACK_IDS = ['vocal1', 'vocal2', 'vocal3'];
export const DRUM_TRACK_IDS = TRACK_DEFS.filter((d) => d.type === 'drum' || d.type === 'fx').map((d) => d.id);

function wrapWithSample(inst, def) {
  const origTrigger = inst.trigger;
  const ch = getChannel(def.id).channel;
  inst.trigger = function (time, vel, note, dur) {
    if (hasSample(def.id)) {
      triggerSample(def.id, time, typeof vel === 'number' ? vel : 1, ch);
      return;
    }
    origTrigger(time, vel, note, dur);
  };
  inst.hasSample = () => hasSample(def.id);
  inst.getSample = () => getSample(def.id);
  inst.setSample = (buffer, name) => assignSample(def.id, buffer, name);
  inst.clearSample = () => clearSample(def.id);
  inst.sampleable = true;
  return inst;
}

export function initInstruments() {
  TRACK_DEFS.forEach((def) => {
    if (!instruments.has(def.id)) {
      const inst = buildInstrument(def);
      if (inst) {
        if (def.type !== 'vocal') wrapWithSample(inst, def);
        instruments.set(def.id, inst);
      }
    }
  });
  return instruments;
}

export function getInstrument(trackId) {
  if (!instruments.has(trackId)) {
    const def = TRACK_DEFS.find((d) => d.id === trackId);
    if (def) {
      const inst = buildInstrument(def);
      if (inst) {
        if (def.type !== 'vocal') wrapWithSample(inst, def);
        instruments.set(trackId, inst);
      }
    }
  }
  return instruments.get(trackId);
}

export function getAllInstruments() { return instruments; }
export function setTrackVolume(trackId, db) { const ch = getChannel(trackId); if (ch) ch.channel.volume.rampTo(db, 0.05); }
export function setTrackPan(trackId, pan) { const ch = getChannel(trackId); if (ch) ch.channel.pan.rampTo(pan, 0.05); }
export function setTrackMute(trackId, mute) { const ch = getChannel(trackId); if (ch) ch.channel.mute = mute; }
export function setTrackSolo(trackId, solo) { const ch = getChannel(trackId); if (ch) ch.channel.solo = solo; }
export function getTrackLevel(trackId) {
  const ch = getChannel(trackId);
  if (!ch) return -Infinity;
  const v = ch.meter.getValue();
  return typeof v === 'number' ? v : v[0] || -Infinity;
}

export function getVocalTracks() {
  return VOCAL_TRACK_IDS.map((id) => {
    const def = TRACK_DEFS.find((d) => d.id === id);
    const inst = instruments.get(id);
    return {
      id, def,
      hasRecording: inst?.hasRecording?.() || false,
      name: inst?.getName?.() || def.name
    };
  });
}
export function getNextVocalId() {
  for (const id of VOCAL_TRACK_IDS) {
    if (!instruments.get(id)?.hasRecording?.()) return id;
  }
  return VOCAL_TRACK_IDS[0];
}
export function setVocalBuffer(trackId, buffer, name) {
  const inst = getInstrument(trackId);
  if (inst?.setBuffer) inst.setBuffer(buffer, name);
}
export function getVocalBuffer(trackId) {
  return instruments.get(trackId)?.node?.buffer || null;
}

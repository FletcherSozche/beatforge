import { getPattern } from './sequencer.js';
import { TRACK_DEFS } from './instruments.js';
import { getBpm } from './engine.js';

export async function exportStems(onProgress, onComplete) {
  const pattern = getPattern();
  const bpm = getBpm() || 120;
  const bars = pattern.bars || 1;
  const totalSteps = bars * 16;
  const sixteenth = 60 / bpm / 4;
  const totalDuration = totalSteps * sixteenth + 0.5;

  const trackIds = Object.keys(pattern.tracks || {});
  const activeTracks = trackIds.filter((id) => {
    const track = pattern.tracks[id];
    return track?.steps?.some((s) => s && s.on) && !id.startsWith('vocal');
  });

  if (activeTracks.length === 0) {
    onComplete?.([]);
    return;
  }

  const stems = [];
  for (let i = 0; i < activeTracks.length; i++) {
    const trackId = activeTracks[i];
    onProgress?.({ current: i + 1, total: activeTracks.length, trackId });

    const blob = await renderTrackOffline(trackId, pattern, bpm, totalDuration, totalSteps, sixteenth);
    if (blob) {
      stems.push({ trackId, blob, name: trackIdToName(trackId) });
    }
  }

  onComplete?.(stems);
}

function renderTrackOffline(trackId, pattern, bpm, duration, totalSteps, sixteenth) {
  return new Promise((resolve) => {
    const sr = 44100;
    const numSamples = Math.ceil(sr * duration);
    const ctx = new OfflineAudioContext(2, numSamples, sr);

    const track = pattern.tracks[trackId];
    if (!track?.steps) { resolve(null); return; }

    const oscType = oscTypeForTrack(trackId);
    const freq = freqForTrack(trackId);
    const vol = volForTrack(trackId);

    for (let i = 0; i < totalSteps && i < track.steps.length; i++) {
      const cell = track.steps[i];
      if (!cell || !cell.on) continue;
      const time = i * sixteenth;
      const vel = cell.vel || 0.85;
      const dur = durForTrack(trackId);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = oscType;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol * vel, time + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur + 0.05);
    }

    ctx.startRendering().then((buffer) => {
      if (buffer.duration < 0.01 || !hasAudio(buffer)) { resolve(null); return; }
      const wav = bufferToWav(buffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      resolve(blob);
    }).catch(() => resolve(null));
  });
}

function hasAudio(buffer) {
  const data = buffer.getChannelData(0);
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += Math.abs(data[i]);
  return sum / data.length > 0.0001;
}

function bufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const bps = 2;
  const ba = numChannels * bps;
  const ds = buffer.length * ba;
  const hs = 44;
  const buf = new ArrayBuffer(hs + ds);
  const v = new DataView(buf);

  const ws = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  ws(0, 'RIFF');
  v.setUint32(4, buf.byteLength - 8, true);
  ws(8, 'WAVE');
  ws(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, numChannels, true);
  v.setUint32(24, sr, true);
  v.setUint32(28, sr * ba, true);
  v.setUint16(32, ba, true);
  v.setUint16(34, 16, true);
  ws(36, 'data');
  v.setUint32(40, ds, true);

  const chs = [];
  for (let c = 0; c < numChannels; c++) chs.push(buffer.getChannelData(c));
  let off = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const s = Math.max(-1, Math.min(1, chs[c][i]));
      v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      off += 2;
    }
  }
  return new Uint8Array(buf);
}

function oscTypeForTrack(id) {
  if (['kick', 'sub', 'tom-hi', 'tom-mid', 'tom-lo'].includes(id)) return 'sine';
  if (['snare', 'clap', 'rim', 'shaker', 'fx'].includes(id)) return 'triangle';
  if (['hat', 'ohat', 'ride', 'crash', 'crash2', 'cowbell'].includes(id)) return 'square';
  return 'sawtooth';
}

function freqForTrack(id) {
  const map = {
    kick: 60, sub: 55, snare: 200, clap: 250, rim: 800,
    'tom-hi': 220, 'tom-mid': 175, 'tom-lo': 130,
    hat: 800, ohat: 800, shaker: 650, cowbell: 900,
    ride: 600, crash: 1200, crash2: 1500, fx: 300,
    wobble: 110, bass: 110, lead: 523, pad: 262, pluck: 784
  };
  return map[id] || 200;
}

function durForTrack(id) {
  const map = {
    kick: 0.3, sub: 0.4, snare: 0.2, clap: 0.15, rim: 0.05,
    'tom-hi': 0.2, 'tom-mid': 0.25, 'tom-lo': 0.3,
    hat: 0.03, ohat: 0.2, shaker: 0.03, cowbell: 0.1,
    ride: 0.3, crash: 0.6, crash2: 0.5, fx: 0.2,
    wobble: 0.2, bass: 0.25, lead: 0.3, pad: 0.6, pluck: 0.1
  };
  return map[id] || 0.15;
}

function volForTrack(id) {
  const map = {
    kick: 0.8, sub: 0.9, snare: 0.6, clap: 0.45, rim: 0.35,
    'tom-hi': 0.45, 'tom-mid': 0.45, 'tom-lo': 0.5,
    hat: 0.15, ohat: 0.15, shaker: 0.1, cowbell: 0.25,
    ride: 0.2, crash: 0.25, crash2: 0.25, fx: 0.35,
    wobble: 0.6, bass: 0.5, lead: 0.4, pad: 0.3, pluck: 0.35
  };
  return map[id] || 0.3;
}

function trackIdToName(id) {
  const def = TRACK_DEFS.find((d) => d.id === id);
  return def?.name || id;
}

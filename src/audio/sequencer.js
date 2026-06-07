import * as Tone from 'tone';
import { getInstrument } from './instruments.js';
import { scheduleRepeat, cancelAllSchedules } from './engine.js';
import { applySwing } from './swing.js';

let pattern = {
  bars: 1,
  steps: 16,
  tracks: {}
};

let onStepCallback = null;
let scheduleId = null;
let currentStep = 0;

export function getPattern() {
  return pattern;
}

export function setPattern(newPattern) {
  pattern = { ...pattern, ...newPattern };
  if (!pattern.tracks) pattern.tracks = {};
}

export function ensureTrack(trackId) {
  if (!pattern.tracks[trackId]) {
    pattern.tracks[trackId] = createEmptyTrack(pattern.bars * pattern.steps);
  }
  return pattern.tracks[trackId];
}

export function createEmptyTrack(length = 16) {
  return {
    steps: new Array(length).fill(null).map(() => ({ on: false, vel: 0.85, note: null }))
  };
}

export function setBars(bars) {
  const newLen = bars * pattern.steps;
  pattern.bars = bars;
  Object.keys(pattern.tracks).forEach((tid) => {
    const t = pattern.tracks[tid];
    if (t.steps.length < newLen) {
      while (t.steps.length < newLen) t.steps.push({ on: false, vel: 0.85, note: null });
    } else if (t.steps.length > newLen) {
      t.steps = t.steps.slice(0, newLen);
    }
  });
}

export function totalSteps() {
  return pattern.bars * pattern.steps;
}

export function toggleStep(trackId, stepIdx) {
  const track = ensureTrack(trackId);
  if (!track.steps[stepIdx]) track.steps[stepIdx] = { on: false, vel: 0.85, note: null };
  track.steps[stepIdx].on = !track.steps[stepIdx].on;
  return track.steps[stepIdx].on;
}

export function setStep(trackId, stepIdx, value) {
  const track = ensureTrack(trackId);
  if (!track.steps[stepIdx]) track.steps[stepIdx] = { on: false, vel: 0.85, note: null };
  Object.assign(track.steps[stepIdx], value);
}

export function clearPattern() {
  Object.keys(pattern.tracks).forEach((tid) => {
    pattern.tracks[tid].steps.forEach((s) => { s.on = false; });
  });
}

export function clearTrack(trackId) {
  if (pattern.tracks[trackId]) {
    pattern.tracks[trackId].steps.forEach((s) => { s.on = false; });
  }
}

export function randomize(density = 0.35) {
  const length = totalSteps();
  Object.keys(pattern.tracks).forEach((tid) => {
    const track = pattern.tracks[tid];
    for (let i = 0; i < length; i++) {
      const isBeat = i % 4 === 0;
      const chance = tid === 'kick' ? (isBeat ? 0.7 : 0.05)
        : tid === 'snare' || tid === 'clap' ? (i % 8 === 4 ? 0.85 : 0.05)
        : tid === 'hat' ? 0.55
        : density;
      track.steps[i].on = Math.random() < chance;
    }
  });
}

export function startSequencer(callback) {
  onStepCallback = callback;
  if (scheduleId !== null) return;

  currentStep = 0;
  const sixteenth = 60 / Tone.getTransport().bpm.value / 4;
  scheduleId = scheduleRepeat((time) => {
    const step = currentStep % totalSteps();
    const swungTime = applySwing(currentStep, time, sixteenth);

    Object.entries(pattern.tracks).forEach(([trackId, track]) => {
      const cell = track.steps[step];
      if (!cell || !cell.on) return;
      const inst = getInstrument(trackId);
      if (!inst) return;

      try {
        if (inst.polyphonic !== undefined) {
          const note = cell.note || defaultNoteFor(trackId);
          const dur = cell.dur || '8n';
          inst.trigger(swungTime, cell.vel, note, dur);
        } else {
          inst.trigger(swungTime, cell.vel);
        }
      } catch (err) {
        console.warn(`Trigger error for ${trackId}:`, err);
      }
    });

    if (onStepCallback) {
      Tone.Draw.schedule(() => onStepCallback(step), swungTime);
    }
    currentStep++;
  }, '16n', 0);
}

function defaultNoteFor(trackId) {
  switch (trackId) {
    case 'sub': return 'C1';
    case 'wobble': return 'C2';
    case 'bass': return 'A1';
    case 'lead': return 'C5';
    default: return 'C4';
  }
}

export function stopSequencer() {
  if (scheduleId !== null) {
    cancelAllSchedules();
    scheduleId = null;
  }
  currentStep = 0;
}

export function resetStepCounter() {
  currentStep = 0;
}

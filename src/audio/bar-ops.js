import { getPattern, setStep, ensureTrack, totalSteps, getPattern as _gp } from './sequencer.js';

export function duplicateBar(trackId, sourceBar, targetBar, barsTotal) {
  const track = ensureTrack(trackId);
  if (!track) return false;
  const stepsPerBar = 16;
  const sourceStart = sourceBar * stepsPerBar;
  const targetStart = targetBar * stepsPerBar;
  for (let i = 0; i < stepsPerBar; i++) {
    const src = track.steps[sourceStart + i] || { on: false, vel: 0.85, note: null };
    const destIdx = targetStart + i;
    if (destIdx >= totalSteps()) break;
    setStep(trackId, destIdx, { ...src });
  }
  return true;
}

export function duplicateBarAllTracks(sourceBar, targetBar) {
  const pattern = getPattern();
  Object.keys(pattern.tracks).forEach((tid) => {
    duplicateBar(tid, sourceBar, targetBar);
  });
}

export function fillBar(trackId, barIdx) {
  const track = ensureTrack(trackId);
  if (!track) return;
  const stepsPerBar = 16;
  const start = barIdx * stepsPerBar;
  for (let i = 0; i < stepsPerBar; i++) {
    if (start + i >= totalSteps()) break;
    setStep(trackId, start + i, { on: true, vel: 0.85, note: null });
  }
}

export function clearBar(trackId, barIdx) {
  const track = ensureTrack(trackId);
  if (!track) return;
  const stepsPerBar = 16;
  const start = barIdx * stepsPerBar;
  for (let i = 0; i < stepsPerBar; i++) {
    if (start + i >= totalSteps()) break;
    setStep(trackId, start + i, { on: false, vel: 0.85, note: null });
  }
}

export function shiftBar(trackId, barIdx, offset) {
  const track = ensureTrack(trackId);
  if (!track) return;
  const stepsPerBar = 16;
  const start = barIdx * stepsPerBar;
  const slice = track.steps.slice(start, start + stepsPerBar);
  if (offset > 0) {
    for (let i = 0; i < stepsPerBar - offset; i++) {
      if (start + i + offset < totalSteps()) {
        setStep(trackId, start + i + offset, { ...slice[i] });
      }
    }
  } else if (offset < 0) {
    for (let i = stepsPerBar - 1; i >= -offset; i--) {
      if (start + i + offset >= 0 && start + i + offset < totalSteps()) {
        setStep(trackId, start + i + offset, { ...slice[i] });
      }
    }
  }
}

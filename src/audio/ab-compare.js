import { setPattern, getPattern } from './sequencer.js';

let bufferA = null;
let bufferB = null;
let activeBuffer = 'A';

export function snapshotA() {
  bufferA = JSON.parse(JSON.stringify(getPattern()));
  return bufferA;
}

export function snapshotB() {
  bufferB = JSON.parse(JSON.stringify(getPattern()));
  return bufferB;
}

export function toggleAB() {
  if (activeBuffer === 'A') {
    if (!bufferB) snapshotB();
    activeBuffer = 'B';
    setPattern(bufferB);
  } else {
    if (!bufferA) snapshotA();
    activeBuffer = 'A';
    setPattern(bufferA);
  }
  return activeBuffer;
}

export function copyCurrentToOpposite() {
  const current = JSON.parse(JSON.stringify(getPattern()));
  if (activeBuffer === 'A') bufferB = current;
  else bufferA = current;
}

export function getActiveBuffer() {
  return activeBuffer;
}

export function hasA() { return bufferA !== null; }
export function hasB() { return bufferB !== null; }

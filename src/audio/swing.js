let swing = 0.5;

export function getSwing() {
  return swing;
}

export function setSwing(value) {
  swing = Math.max(0, Math.min(0.75, Number(value) || 0.5));
}

export function applySwing(stepIndex, baseTime, sixteenthSeconds) {
  if (swing === 0.5) return baseTime;
  if (stepIndex % 2 === 0) return baseTime;
  const offset = (swing - 0.5) * sixteenthSeconds;
  return baseTime + offset;
}

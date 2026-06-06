import { TRACK_DEFS } from '../audio/instruments.js';
import { getPattern, toggleStep, ensureTrack, totalSteps, setStep } from '../audio/sequencer.js';

const trackMutes = new Map();

export function buildSequencerUI(rootEl, onCellChange) {
  rootEl.innerHTML = '';
  const pattern = getPattern();
  const length = totalSteps();

  TRACK_DEFS.forEach((track) => {
    ensureTrack(track.id);
    const row = document.createElement('div');
    row.className = 'seq-row';
    row.dataset.trackId = track.id;
    row.style.setProperty('--track-color', track.color);

    const label = document.createElement('div');
    label.className = 'seq-label';
    label.innerHTML = `<span class="label-icon">${track.icon}</span><span class="label-name">${track.name}</span>`;
    label.title = `${track.name} - tikla solo sec`;
    row.appendChild(label);

    const mute = document.createElement('div');
    mute.className = 'seq-mute' + (trackMutes.get(track.id) ? ' muted' : '');
    mute.textContent = 'M';
    mute.title = 'Mute';
    mute.addEventListener('click', () => {
      const isMuted = !trackMutes.get(track.id);
      trackMutes.set(track.id, isMuted);
      mute.classList.toggle('muted', isMuted);
      if (typeof onCellChange === 'function') {
        onCellChange({ type: 'mute', trackId: track.id, value: isMuted });
      }
    });
    row.appendChild(mute);

    const cells = document.createElement('div');
    cells.className = 'seq-cells';
    cells.style.gridTemplateColumns = `repeat(${length}, minmax(0, 1fr))`;

    for (let i = 0; i < length; i++) {
      const cell = document.createElement('div');
      cell.className = 'seq-cell';
      if (i % 4 === 0) cell.classList.add('beat-mark');
      if (i % 16 === 0) cell.classList.add('accent');
      cell.dataset.trackId = track.id;
      cell.dataset.step = String(i);

      const stepData = pattern.tracks[track.id]?.steps[i];
      if (stepData?.on) cell.classList.add('active');

      const trigger = () => {
        const on = toggleStep(track.id, i);
        cell.classList.toggle('active', on);
        if (typeof onCellChange === 'function') {
          onCellChange({ type: 'step', trackId: track.id, step: i, on });
        }
      };

      cell.addEventListener('click', trigger);

      let pressTimer = null;
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        cycleVelocity(track.id, i, cell);
      });

      cells.appendChild(cell);
    }

    row.appendChild(cells);
    rootEl.appendChild(row);
  });
}

function cycleVelocity(trackId, stepIdx, cellEl) {
  const pattern = getPattern();
  const step = pattern.tracks[trackId]?.steps[stepIdx];
  if (!step) return;
  const next = step.vel >= 0.95 ? 0.5 : step.vel >= 0.7 ? 0.95 : 0.75;
  setStep(trackId, stepIdx, { vel: next });
  cellEl.style.filter = `brightness(${0.5 + next * 0.7})`;
}

export function highlightPlayingStep(stepIdx) {
  const cells = document.querySelectorAll('.seq-cell.playing');
  cells.forEach((c) => c.classList.remove('playing'));
  const all = document.querySelectorAll(`.seq-cell[data-step="${stepIdx}"]`);
  all.forEach((c) => c.classList.add('playing'));
}

export function clearPlayingHighlight() {
  document.querySelectorAll('.seq-cell.playing').forEach((c) => c.classList.remove('playing'));
}

export function getMutes() {
  return trackMutes;
}

export function refreshActiveCells() {
  const pattern = getPattern();
  document.querySelectorAll('.seq-cell').forEach((cell) => {
    const tid = cell.dataset.trackId;
    const step = parseInt(cell.dataset.step, 10);
    const on = pattern.tracks[tid]?.steps[step]?.on;
    cell.classList.toggle('active', !!on);
  });
}

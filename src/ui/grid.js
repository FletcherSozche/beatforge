import { TRACK_DEFS } from '../audio/instruments.js';
import { getPattern, toggleStep, ensureTrack, totalSteps, setStep } from '../audio/sequencer.js';

const trackMutes = new Map();
let selectionStart = null;
let selectionEnd = null;
let clipboard = null;
let activeVocalTrack = null;

export function setActiveVocalTrack(trackId) {
  activeVocalTrack = trackId;
  refreshActiveCells();
}

export function buildSequencerUI(rootEl, onCellChange) {
  rootEl.innerHTML = '';
  const pattern = getPattern();
  const length = totalSteps();

  const cellSize = calculateCellSize(length);

  const virtualWrap = document.createElement('div');
  virtualWrap.className = 'seq-virtual';

  TRACK_DEFS.forEach((track) => {
    ensureTrack(track.id);
    const row = document.createElement('div');
    row.className = 'seq-row';
    row.dataset.trackId = track.id;
    row.style.setProperty('--track-color', track.color);
    row.style.setProperty('--cell-size', `${cellSize}px`);

    const label = document.createElement('div');
    label.className = 'seq-label';
    label.innerHTML = `<span class="label-icon">${track.icon}</span><span class="label-name">${track.name}</span>`;
    label.title = track.name;
    row.appendChild(label);

    const mute = document.createElement('div');
    mute.className = 'seq-mute' + (trackMutes.get(track.id) ? ' muted' : '');
    mute.textContent = 'M';
    mute.title = 'Mute (Sag tik: solo)';
    mute.addEventListener('click', () => {
      const isMuted = !trackMutes.get(track.id);
      trackMutes.set(track.id, isMuted);
      mute.classList.toggle('muted', isMuted);
      if (typeof onCellChange === 'function') onCellChange({ type: 'mute', trackId: track.id, value: isMuted });
    });
    row.appendChild(mute);

    const cellsContainer = document.createElement('div');
    cellsContainer.className = 'seq-cells-container';

    const cells = document.createElement('div');
    cells.className = 'seq-cells';
    cells.style.gridTemplateColumns = `repeat(${length}, ${cellSize}px)`;

    for (let i = 0; i < length; i++) {
      const cell = document.createElement('div');
      cell.className = 'seq-cell';
      if (i % 4 === 0) cell.classList.add('beat-mark');
      if (i % 16 === 0) cell.classList.add('bar-mark');
      cell.dataset.trackId = track.id;
      cell.dataset.step = String(i);

      const stepData = pattern.tracks[track.id]?.steps[i];
      if (stepData?.on) {
        cell.classList.add('active');
        const vel = stepData.vel || 0.85;
        const velBar = document.createElement('div');
        velBar.className = 'vel-bar';
        velBar.style.height = `${Math.round(vel * 100)}%`;
        cell.appendChild(velBar);
      }
      if (activeVocalTrack && track.id === activeVocalTrack) cell.classList.add('vocal-target');

      cells.appendChild(cell);
    }
    cellsContainer.appendChild(cells);
    row.appendChild(cellsContainer);
  virtualWrap.appendChild(row);
});

  rootEl.appendChild(virtualWrap);

  const playhead = document.createElement('div');
  playhead.className = 'seq-playhead';
  rootEl.appendChild(playhead);

  bindCellInteractions(rootEl, onCellChange);
  syncRowScroll(rootEl);
}

function calculateCellSize(totalSteps) {
  const containerWidth = Math.min(window.innerWidth - 200, 1400);
  const maxCellSize = 40;
  const minCellSize = 6;
  if (totalSteps * maxCellSize <= containerWidth) return maxCellSize;
  if (totalSteps * minCellSize <= containerWidth) {
    return Math.max(minCellSize, Math.floor(containerWidth / totalSteps));
  }
  return minCellSize;
}

function bindCellInteractions(rootEl, onCellChange) {
  let mouseDown = false;
  let paintMode = null;
  let dragStart = null;
  let velDrag = null;
  let lastX = 0, lastY = 0;

  const getCellFromEvent = (e) => {
    const target = e.target.closest('.seq-cell');
    if (!target) return null;
    return {
      el: target,
      trackId: target.dataset.trackId,
      step: parseInt(target.dataset.step, 10)
    };
  };

  rootEl.addEventListener('mousedown', (e) => {
    if (e.button === 2) return;
    const c = getCellFromEvent(e);
    if (!c) return;

    if (e.altKey && c.el.classList.contains('active')) {
      velDrag = { trackId: c.trackId, step: c.step, startY: e.clientY, startVel: getVel(c.trackId, c.step) };
      e.preventDefault();
      return;
    }

    if (e.shiftKey && selectionStart) {
      selectionEnd = { trackId: c.trackId, step: c.step };
      mouseDown = true;
      updateSelection();
      return;
    }

    mouseDown = true;
    const wasActive = c.el.classList.contains('active');
    paintMode = wasActive ? 'erase' : 'paint';
    dragStart = { trackId: c.trackId, step: c.step };
    selectionStart = { trackId: c.trackId, step: c.step };
    selectionEnd = { trackId: c.trackId, step: c.step };
    updateSelection();
    paintCell(c.trackId, c.step, paintMode, onCellChange);
    lastX = e.clientX; lastY = e.clientY;
  });

  rootEl.addEventListener('mousemove', (e) => {
    if (velDrag) {
      const deltaY = velDrag.startY - e.clientY;
      const newVel = Math.max(0.05, Math.min(1, velDrag.startVel + deltaY / 80));
      setVel(velDrag.trackId, velDrag.step, newVel);
      return;
    }
    if (!mouseDown) return;
    const c = getCellFromEvent(e);
    if (!c) return;
    if (e.shiftKey && dragStart) {
      selectionEnd = { trackId: c.trackId, step: c.step };
      updateSelection();
    } else {
      selectionEnd = { trackId: c.trackId, step: c.step };
      updateSelection();
      paintCell(c.trackId, c.step, paintMode, onCellChange);
    }
  });

  document.addEventListener('mouseup', () => {
    mouseDown = false;
    paintMode = null;
    velDrag = null;
  });

  rootEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const c = getCellFromEvent(e);
    if (!c) return;
    showContextMenu(e.clientX, e.clientY, c, onCellChange, rootEl);
  });
}

function getVel(trackId, stepIdx) {
  const pattern = getPattern();
  return pattern.tracks[trackId]?.steps[stepIdx]?.vel ?? 0.85;
}

function setVel(trackId, stepIdx, vel) {
  setStep(trackId, stepIdx, { vel });
  const cell = document.querySelector(`.seq-cell[data-track-id="${trackId}"][data-step="${stepIdx}"]`);
  if (!cell) return;
  const bar = cell.querySelector('.vel-bar');
  if (bar) {
    bar.style.height = `${Math.round(vel * 100)}%`;
  } else if (cell.classList.contains('active')) {
    const newBar = document.createElement('div');
    newBar.className = 'vel-bar';
    newBar.style.height = `${Math.round(vel * 100)}%`;
    cell.appendChild(newBar);
  }
  cell.style.filter = `brightness(${0.5 + vel * 0.7})`;
}

function paintCell(trackId, stepIdx, mode, onCellChange) {
  const track = ensureTrack(trackId);
  if (!track.steps[stepIdx]) track.steps[stepIdx] = { on: false, vel: 0.85, note: null };
  const newState = mode === 'paint';
  if (track.steps[stepIdx].on !== newState) {
    track.steps[stepIdx].on = newState;
    const cell = document.querySelector(`.seq-cell[data-track-id="${trackId}"][data-step="${stepIdx}"]`);
    if (cell) cell.classList.toggle('active', newState);
    if (onCellChange) onCellChange({ type: 'step', trackId, step: stepIdx, on: newState });
  }
}

function updateSelection() {
  document.querySelectorAll('.seq-cell.selected').forEach((c) => c.classList.remove('selected'));
  if (!selectionStart || !selectionEnd) return;
  const startStep = Math.min(selectionStart.step, selectionEnd.step);
  const endStep = Math.max(selectionStart.step, selectionEnd.step);
  const trackId = selectionStart.trackId;
  for (let i = startStep; i <= endStep; i++) {
    const c = document.querySelector(`.seq-cell[data-track-id="${trackId}"][data-step="${i}"]`);
    if (c) c.classList.add('selected');
  }
}

function showContextMenu(x, y, cell, onCellChange, rootEl) {
  document.querySelectorAll('.ctx-menu').forEach((m) => m.remove());
  const menu = document.createElement('div');
  menu.className = 'ctx-menu';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  const items = [
    { label: 'Toggle', act: () => {
      const on = toggleStep(cell.trackId, cell.step);
      const el = document.querySelector(`.seq-cell[data-track-id="${cell.trackId}"][data-step="${cell.step}"]`);
      if (el) el.classList.toggle('active', on);
      if (onCellChange) onCellChange({ type: 'step', trackId: cell.trackId, step: cell.step, on });
    }},
    { label: 'Velocity +', act: () => adjustVel(cell.trackId, cell.step, 0.1) },
    { label: 'Velocity -', act: () => adjustVel(cell.trackId, cell.step, -0.1) },
    { label: 'Kopyala (Ctrl+C)', act: () => copySelection() },
    { label: 'Temizle', act: () => {
      setStep(cell.trackId, cell.step, { on: false });
      const el = document.querySelector(`.seq-cell[data-track-id="${cell.trackId}"][data-step="${cell.step}"]`);
      if (el) el.classList.remove('active');
    }}
  ];

  items.forEach((it) => {
    const b = document.createElement('button');
    b.className = 'ctx-item';
    b.textContent = it.label;
    b.addEventListener('click', () => { it.act(); menu.remove(); });
    menu.appendChild(b);
  });

  document.body.appendChild(menu);
  setTimeout(() => {
    document.addEventListener('click', () => menu.remove(), { once: true });
  }, 10);
}

function adjustVel(trackId, stepIdx, delta) {
  const pattern = getPattern();
  const step = pattern.tracks[trackId]?.steps[stepIdx];
  if (!step) return;
  const next = Math.max(0.1, Math.min(1, (step.vel || 0.85) + delta));
  setStep(trackId, stepIdx, { vel: next });
  const cell = document.querySelector(`.seq-cell[data-track-id="${trackId}"][data-step="${stepIdx}"]`);
  if (cell) cell.style.filter = `brightness(${0.5 + next * 0.7})`;
}

function copySelection() {
  if (!selectionStart || !selectionEnd) {
    const tracks = TRACK_DEFS;
    const length = totalSteps();
    clipboard = { shape: 'full', tracks: {} };
    tracks.forEach((t) => {
      const pattern = getPattern();
      const arr = [];
      for (let i = 0; i < length; i++) {
        arr.push({ ...(pattern.tracks[t.id]?.steps[i] || { on: false, vel: 0.85, note: null }) });
      }
      clipboard.tracks[t.id] = arr;
    });
    return;
  }
  const startStep = Math.min(selectionStart.step, selectionEnd.step);
  const endStep = Math.max(selectionStart.step, selectionEnd.step);
  const trackId = selectionStart.trackId;
  const pattern = getPattern();
  const arr = [];
  for (let i = startStep; i <= endStep; i++) {
    arr.push({ ...(pattern.tracks[trackId]?.steps[i] || { on: false, vel: 0.85, note: null }) });
  }
  clipboard = { shape: 'range', trackId, sourceStart: startStep, length: endStep - startStep + 1, data: arr };
}

function pasteFromClipboard(targetTrackId, targetStep) {
  if (!clipboard) return;
  const pattern = getPattern();
  if (clipboard.shape === 'range') {
    for (let i = 0; i < clipboard.length; i++) {
      const destStep = targetStep + i;
      if (destStep >= totalSteps()) break;
      const src = clipboard.data[i];
      setStep(targetTrackId, destStep, { ...src });
    }
  } else if (clipboard.shape === 'full') {
    Object.entries(clipboard.tracks).forEach(([tid, arr]) => {
      for (let i = 0; i < arr.length; i++) {
        const destStep = targetStep + i;
        if (destStep >= totalSteps()) break;
        setStep(tid, destStep, { ...arr[i] });
      }
    });
  }
  refreshActiveCells();
}

function syncRowScroll(rootEl) {
  const containers = rootEl.querySelectorAll('.seq-cells-container');
  let isSyncing = false;
  containers.forEach((c) => {
    c.addEventListener('scroll', () => {
      if (isSyncing) return;
      isSyncing = true;
      const scrollLeft = c.scrollLeft;
      containers.forEach((other) => {
        if (other !== c) other.scrollLeft = scrollLeft;
      });
      requestAnimationFrame(() => { isSyncing = false; });
    });
  });
}

export function handleCopyPasteKey(e, targetEl) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const meta = isMac ? e.metaKey : e.ctrlKey;
  if (!meta) return false;
  const key = e.key.toLowerCase();
  if (key === 'c' && !e.shiftKey) {
    e.preventDefault();
    copySelection();
    return true;
  }
  if (key === 'v' && !e.shiftKey) {
    e.preventDefault();
    const baseStep = selectionStart?.step ?? 0;
    const baseTrack = selectionStart?.trackId ?? 'kick';
    pasteFromClipboard(baseTrack, baseStep);
    return true;
  }
  if (key === 'a' && !e.shiftKey) {
    e.preventDefault();
    const length = totalSteps();
    selectionStart = { trackId: 'kick', step: 0 };
    selectionEnd = { trackId: 'kick', step: length - 1 };
    updateSelection();
    return true;
  }
  return false;
}

export function highlightPlayingStep(stepIdx) {
  const cells = document.querySelectorAll('.seq-cell.playing');
  cells.forEach((c) => c.classList.remove('playing'));
  const all = document.querySelectorAll(`.seq-cell[data-step="${stepIdx}"]`);
  all.forEach((c) => {
    c.classList.add('playing');
    if (c.classList.contains('active')) {
      c.classList.remove('trigger-flash');
      void c.offsetWidth;
      c.classList.add('trigger-flash');
      setTimeout(() => c.classList.remove('trigger-flash'), 150);
    }
  });
  const first = all[0];
  if (first) {
    const container = first.closest('.seq-cells-container');
    if (container) {
      const cellLeft = first.offsetLeft;
      const cellWidth = first.offsetWidth || 20;
      const viewLeft = container.scrollLeft;
      const viewRight = viewLeft + container.clientWidth;
      if (cellLeft < viewLeft || cellLeft + cellWidth > viewRight) {
        container.scrollLeft = Math.max(0, cellLeft - container.clientWidth / 2);
      }
    }
  }
  const playhead = document.querySelector('.seq-playhead');
  if (playhead && first) {
    const rootEl = first.closest('.sequencer');
    const wrap = rootEl && rootEl.querySelector('.seq-virtual');
    if (wrap) {
      const wrapRect = wrap.getBoundingClientRect();
      const cellRect = first.getBoundingClientRect();
      const scrollLeftEl = first.closest('.seq-cells-container');
      const scrollLeft = scrollLeftEl ? scrollLeftEl.scrollLeft : 0;
      playhead.style.left = (cellRect.left - wrapRect.left + scrollLeft) + 'px';
      playhead.style.height = wrap.offsetHeight + 'px';
      playhead.classList.add('visible');
    }
  }
}

export function clearPlayingHighlight() {
  document.querySelectorAll('.seq-cell.playing').forEach((c) => c.classList.remove('playing'));
  document.querySelectorAll('.seq-cell.trigger-flash').forEach((c) => c.classList.remove('trigger-flash'));
  const ph = document.querySelector('.seq-playhead');
  if (ph) ph.classList.remove('visible');
}

export function getMutes() { return trackMutes; }

export function refreshActiveCells() {
  const pattern = getPattern();
  document.querySelectorAll('.seq-cell').forEach((cell) => {
    const tid = cell.dataset.trackId;
    const step = parseInt(cell.dataset.step, 10);
    const stepData = pattern.tracks[tid]?.steps[step];
    const on = !!stepData?.on;
    cell.classList.toggle('active', on);
    cell.classList.toggle('vocal-target', activeVocalTrack === tid);
    const existingBar = cell.querySelector('.vel-bar');
    if (on && stepData) {
      const vel = stepData.vel || 0.85;
      if (existingBar) {
        existingBar.style.height = `${Math.round(vel * 100)}%`;
      } else {
        const bar = document.createElement('div');
        bar.className = 'vel-bar';
        bar.style.height = `${Math.round(vel * 100)}%`;
        cell.appendChild(bar);
      }
    } else if (existingBar) {
      existingBar.remove();
    }
  });
}

export function clearSelection() {
  selectionStart = null;
  selectionEnd = null;
  updateSelection();
}

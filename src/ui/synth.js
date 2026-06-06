import { TRACK_DEFS, getInstrument } from '../audio/instruments.js';
import { createKnob } from './knob.js';
import { getPattern, totalSteps, setStep } from '../audio/sequencer.js';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [0, 1, 2, 3, 4, 5, 6];

let selectedTrackId = 'wobble';

export function buildSynthUI(rootEl) {
  rootEl.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'synth-controls';

  const picker = document.createElement('div');
  picker.className = 'synth-track-pick';
  const synthTracks = TRACK_DEFS.filter((t) => ['sub', 'wobble', 'bass', 'lead'].includes(t.id));
  synthTracks.forEach((t) => {
    const btn = document.createElement('button');
    btn.className = 'synth-track-btn' + (t.id === selectedTrackId ? ' active' : '');
    btn.textContent = t.name;
    btn.style.setProperty('--track-color', t.color);
    btn.addEventListener('click', () => {
      selectedTrackId = t.id;
      buildSynthUI(rootEl);
    });
    picker.appendChild(btn);
  });
  wrap.appendChild(picker);

  const noteSection = document.createElement('div');
  noteSection.className = 'synth-section';
  noteSection.innerHTML = `<h4>${synthTracks.find((t) => t.id === selectedTrackId)?.name || 'Synth'} - Pattern Notalari</h4>`;

  const noteRow = document.createElement('div');
  noteRow.className = 'synth-row';

  const noteSel = document.createElement('select');
  noteSel.className = 'select-pill';
  NOTES.forEach((n) => {
    const opt = document.createElement('option'); opt.value = n; opt.textContent = n; noteSel.appendChild(opt);
  });
  const octSel = document.createElement('select');
  octSel.className = 'select-pill';
  OCTAVES.forEach((o) => {
    const opt = document.createElement('option'); opt.value = String(o); opt.textContent = `Oct ${o}`; octSel.appendChild(opt);
  });
  const def = defaultNote(selectedTrackId);
  noteSel.value = def.slice(0, def.length - 1).replace(/\d/g, '');
  octSel.value = def.slice(-1);

  const applyBtn = document.createElement('button');
  applyBtn.className = 'btn-mini';
  applyBtn.textContent = 'Tum aktif adimlara uygula';
  applyBtn.addEventListener('click', () => {
    const note = `${noteSel.value}${octSel.value}`;
    const p = getPattern();
    const len = totalSteps();
    const track = p.tracks[selectedTrackId];
    if (!track) return;
    for (let i = 0; i < len; i++) {
      if (track.steps[i]?.on) setStep(selectedTrackId, i, { note });
    }
  });

  const testBtn = document.createElement('button');
  testBtn.className = 'btn-mini';
  testBtn.textContent = 'Sesi Dene';
  testBtn.addEventListener('click', async () => {
    const inst = getInstrument(selectedTrackId);
    if (!inst) return;
    const note = `${noteSel.value}${octSel.value}`;
    inst.trigger?.(undefined, 0.9, note, '4n');
  });

  noteRow.appendChild(noteSel);
  noteRow.appendChild(octSel);
  noteRow.appendChild(applyBtn);
  noteRow.appendChild(testBtn);
  noteSection.appendChild(noteRow);
  wrap.appendChild(noteSection);

  if (selectedTrackId === 'wobble') {
    const wob = getInstrument('wobble');
    const sec = document.createElement('div');
    sec.className = 'synth-section';
    sec.innerHTML = '<h4>Wobble LFO</h4>';
    const row = document.createElement('div');
    row.className = 'synth-row';
    const rateOptions = [
      { l: '1/2', v: '2n' }, { l: '1/4', v: '4n' }, { l: '1/8', v: '8n' },
      { l: '1/16', v: '16n' }, { l: '1/4T', v: '4t' }, { l: '1/8T', v: '8t' }
    ];
    rateOptions.forEach((opt) => {
      const b = document.createElement('button');
      b.className = 'btn-mini';
      b.textContent = opt.l;
      b.addEventListener('click', () => {
        if (wob?.lfo) wob.lfo.frequency.value = opt.v;
      });
      row.appendChild(b);
    });
    sec.appendChild(row);
    wrap.appendChild(sec);
  }

  rootEl.appendChild(wrap);
}

function defaultNote(trackId) {
  switch (trackId) {
    case 'sub': return 'C1';
    case 'wobble': return 'C2';
    case 'bass': return 'A1';
    case 'lead': return 'C5';
    default: return 'C4';
  }
}

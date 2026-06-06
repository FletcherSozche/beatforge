import { TRACK_DEFS, setTrackVolume, setTrackPan, setTrackMute, setTrackSolo, getTrackLevel } from '../audio/instruments.js';
import { createKnob } from './knob.js';

const channelState = new Map();
const meterRefs = new Map();

export function buildMixerUI(rootEl) {
  rootEl.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'mixer-grid';

  TRACK_DEFS.forEach((track) => {
    const state = channelState.get(track.id) || { volume: -8, pan: 0, muted: false, solo: false };
    channelState.set(track.id, state);

    const ch = document.createElement('div');
    ch.className = 'mixer-channel';
    ch.style.setProperty('--track-color', track.color);

    const name = document.createElement('div');
    name.className = 'ch-name';
    name.textContent = track.name;
    ch.appendChild(name);

    const volKnob = createKnob({
      min: -60, max: 6, value: state.volume, label: 'VOL',
      valueFormat: (v) => `${v.toFixed(1)} dB`,
      onChange: (v) => { state.volume = v; setTrackVolume(track.id, v); }
    });
    ch.appendChild(volKnob.el);

    const panKnob = createKnob({
      min: -1, max: 1, value: state.pan, label: 'PAN',
      valueFormat: (v) => v === 0 ? 'C' : v < 0 ? `L${Math.round(-v * 100)}` : `R${Math.round(v * 100)}`,
      onChange: (v) => { state.pan = v; setTrackPan(track.id, v); }
    });
    ch.appendChild(panKnob.el);

    const meter = document.createElement('div');
    meter.className = 'ch-meter';
    const meterFill = document.createElement('div');
    meterFill.className = 'ch-meter-fill';
    meter.appendChild(meterFill);
    ch.appendChild(meter);
    meterRefs.set(track.id, meterFill);

    const btns = document.createElement('div');
    btns.className = 'ch-buttons';
    const mBtn = document.createElement('button');
    mBtn.className = 'ch-btn m' + (state.muted ? ' active' : '');
    mBtn.textContent = 'M';
    mBtn.title = 'Mute';
    mBtn.addEventListener('click', () => {
      state.muted = !state.muted;
      mBtn.classList.toggle('active', state.muted);
      setTrackMute(track.id, state.muted);
    });
    const sBtn = document.createElement('button');
    sBtn.className = 'ch-btn s' + (state.solo ? ' active' : '');
    sBtn.textContent = 'S';
    sBtn.title = 'Solo';
    sBtn.addEventListener('click', () => {
      state.solo = !state.solo;
      sBtn.classList.toggle('active', state.solo);
      setTrackSolo(track.id, state.solo);
    });
    btns.appendChild(mBtn);
    btns.appendChild(sBtn);
    ch.appendChild(btns);

    grid.appendChild(ch);
  });

  rootEl.appendChild(grid);
}

let meterRaf = null;
export function startMeters() {
  if (meterRaf) return;
  const loop = () => {
    meterRefs.forEach((el, trackId) => {
      const db = getTrackLevel(trackId);
      const normalized = Math.max(0, Math.min(100, ((db + 60) / 66) * 100));
      el.style.height = `${normalized}%`;
    });
    meterRaf = requestAnimationFrame(loop);
  };
  loop();
}

export function stopMeters() {
  if (meterRaf) {
    cancelAnimationFrame(meterRaf);
    meterRaf = null;
  }
  meterRefs.forEach((el) => { el.style.height = '0%'; });
}

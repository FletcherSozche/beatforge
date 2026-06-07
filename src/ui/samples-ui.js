import { TRACK_DEFS, getInstrument } from '../audio/instruments.js';
import { hasSample, getSample, clearSample, loadSampleFromFile } from '../audio/samples.js';
import { toast } from './presets-ui.js';
import { refreshActiveCells } from './grid.js';

const DRUM_TYPES = new Set(['drum', 'fx', 'bass', 'wobble', 'reese', 'lead', 'pad', 'pluck']);

let rootEl = null;
let rerender = null;

export function buildSamplesUI(root) {
  rootEl = root;
  rootEl.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'samples-ui';

  const header = document.createElement('div');
  header.className = 'samples-header';
  header.innerHTML = '<h3>ORNEK SESLER</h3><p class="samples-hint">WAV/MP3 yukle, synth sesi yerine kullan. Vokaller etkilenmez.</p>';
  wrap.appendChild(header);

  const list = document.createElement('div');
  list.className = 'samples-list';

  TRACK_DEFS.forEach((def) => {
    if (!DRUM_TYPES.has(def.type)) return;
    const inst = getInstrument(def.id);
    if (!inst) return;
    const sample = getSample(def.id);
    const item = document.createElement('div');
    item.className = 'samples-item';
    item.dataset.track = def.id;
    item.innerHTML = `
      <div class="samples-item-icon" style="background:${def.color}">${def.icon}</div>
      <div class="samples-item-info">
        <div class="samples-item-name">${def.name}</div>
        <div class="samples-item-file">${sample ? `<span class="samples-loaded">${escapeHtml(sample.name)} (${sample.duration.toFixed(1)}s)</span>` : '<span class="samples-none">Sentezleyici (varsayilan)</span>'}</div>
      </div>
      <div class="samples-item-actions">
        <button class="btn-ghost samples-load-btn" data-track="${def.id}">${sample ? 'Degistir' : 'Yukle'}</button>
        ${sample ? `<button class="btn-ghost samples-clear-btn" data-track="${def.id}" style="color:var(--accent-red,#ff4d6d)">Temizle</button>` : ''}
      </div>
    `;
    list.appendChild(item);
  });

  wrap.appendChild(list);
  rootEl.appendChild(wrap);
  bindSampleEvents();
  rerender = () => buildSamplesUI(rootEl);
}

function bindSampleEvents() {
  function showToast(msg, type) { try { toast(msg, type); } catch (e) {} }

  document.querySelectorAll('.samples-load-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const trackId = btn.dataset.track;
      const file = await pickAudioFile();
      if (!file) return;
      try {
        btn.textContent = 'Yukleniyor...';
        const result = await loadSampleFromFile(file);
        const inst = getInstrument(trackId);
        if (inst?.setSample) inst.setSample(result.buffer, result.name);
        showToast(`${file.name} -> ${getTrackName(trackId)}`, 'success');
        if (rerender) rerender();
      } catch (err) {
        showToast('Hata: ' + err.message, 'error');
        if (rerender) rerender();
      }
    });
  });

  document.querySelectorAll('.samples-clear-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const trackId = btn.dataset.track;
      const inst = getInstrument(trackId);
      if (inst?.clearSample) inst.clearSample();
      showToast(`Sample temizlendi: ${getTrackName(trackId)}`, 'info');
      if (rerender) rerender();
    });
  });
}

function pickAudioFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.wav,.mp3,.ogg,.aiff,.aif,.flac,audio/wav,audio/mpeg,audio/ogg,audio/flac';
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });
}

function getTrackName(id) {
  const def = TRACK_DEFS.find((d) => d.id === id);
  return def?.name || id;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

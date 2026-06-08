import { TRACK_DEFS, getInstrument } from './instruments.js';
import { loadSampleFromFile } from './samples.js';
import { buildSamplesUI } from '../ui/samples-ui.js';

let dropOverlay = null;
let isOver = false;
let onLoadCallback = null;
let toastFn = null;

function showToast(msg, type) {
  if (toastFn) toastFn(msg, type);
}

export function setupDragDropImport(onLoad, toast) {
  onLoadCallback = onLoad;
  toastFn = toast;
  ensureOverlay();

  document.addEventListener('dragenter', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    if (!isOver) {
      isOver = true;
      dropOverlay.classList.add('active');
    }
  });

  document.addEventListener('dragover', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  document.addEventListener('dragleave', (e) => {
    if (e.relatedTarget && document.contains(e.relatedTarget)) return;
    isOver = false;
    if (dropOverlay) dropOverlay.classList.remove('active');
  });

  document.addEventListener('drop', async (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    isOver = false;
    dropOverlay.classList.remove('active');
    const files = Array.from(e.dataTransfer.files);
    const projFile = files.find((f) => /\.bfp$|\.json$/i.test(f.name));
    const audioFile = files.find((f) => /\.(wav|mp3|ogg|aiff?|flac)$/i.test(f.name));

    if (projFile) {
      try {
        const text = await projFile.text();
        const data = JSON.parse(text);
        if (onLoadCallback) onLoadCallback(data, projFile.name);
      } catch (err) {
        showToast('Dosya okunamadi: ' + err.message, 'error');
      }
    } else if (audioFile) {
      const trackEl = e.target.closest('[data-track-id]');
      const trackId = trackEl?.dataset?.trackId;
      const targetTrack = trackId && TRACK_DEFS.find((d) => d.id === trackId && d.type !== 'vocal');
      if (targetTrack) {
        try {
          const result = await loadSampleFromFile(audioFile);
          const inst = getInstrument(targetTrack.id);
          if (inst?.setSample) inst.setSample(result.buffer, result.name);
          showToast(`${audioFile.name} -> ${targetTrack.name}`, 'success');
          const panel = document.getElementById('samples-panel');
          if (panel) buildSamplesUI(panel);
        } catch (err) {
          showToast('Ses yuklenemedi: ' + err.message, 'error');
        }
      } else {
        showToast('Ses dosyasini bir track uzerine birak.', 'info');
      }
    } else {
      showToast('Sadece .bfp/.json (proje) veya .wav/.mp3 (sample) desteklenir', 'error');
    }
  });
}

function hasFiles(e) {
  return e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes('Files');
}

function ensureOverlay() {
  if (dropOverlay) return;
  dropOverlay = document.createElement('div');
  dropOverlay.className = 'drop-overlay';
  dropOverlay.innerHTML = `
    <div class="drop-overlay-card">
      <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
        <defs>
          <linearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#22d3ee"/>
            <stop offset="100%" stop-color="#a78bfa"/>
          </linearGradient>
        </defs>
        <path d="M32 8 L52 22 L52 50 L12 50 L12 22 Z" fill="none" stroke="url(#dg)" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M32 26 L32 42 M22 32 L32 42 L42 32" fill="none" stroke="url(#dg)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h2>Dosyayi birak</h2>
      <p>.bfp/.json (proje) veya .wav/.mp3 (sample)</p>
    </div>
  `;
  document.body.appendChild(dropOverlay);
}

let dropOverlay = null;
let isOver = false;
let onLoadCallback = null;
let toastFn = null;

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
    const file = Array.from(e.dataTransfer.files).find((f) => /\.bfp$|\.json$/i.test(f.name));
    if (!file) {
      if (toastFn) toastFn('Sadece .bfp veya .json dosyalari destekleniyor', 'error');
      return;
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (onLoadCallback) onLoadCallback(data, file.name);
    } catch (err) {
      console.error('Drop import failed', err);
      if (toastFn) toastFn('Dosya okunamadi: ' + err.message, 'error');
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
      <h2>BeatForge projesi yukle</h2>
      <p>Dosyayi birak — desen, BPM, vokaller hazir</p>
    </div>
  `;
  document.body.appendChild(dropOverlay);
}

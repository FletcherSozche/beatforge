export function showHelpModal() {
  closeHelpModal();
  const backdrop = document.createElement('div');
  backdrop.className = 'help-modal-backdrop';
  document.body.appendChild(backdrop);

  const modal = document.createElement('div');
  modal.className = 'help-modal';
  modal.innerHTML = `
    <div class="help-modal-head">
      <h2>BEATFORGE — YARDIM</h2>
      <button class="recent-modal-close" id="help-close" aria-label="Kapat">X</button>
    </div>
    <div class="help-modal-body">
      <div class="help-section">
        <h3>Temel</h3>
        <ul>
          <li>Izgaradaki hucrelere <strong>tikla</strong> — davul/nota ekle/cikar</li>
          <li><strong>Surukle</strong> — birden cok hucreyi ayni anda ac/kapa</li>
          <li><strong>Her vurusun altindaki sayi</strong> — velocity (0-100). Sadece secili hucreleri degistirir.</li>
          <li><strong>Bar sayisi</strong> — 1/2/4/8/16/32/64/128 arasi sec</li>
        </ul>
      </div>
      <div class="help-section">
        <h3>Kisayollar</h3>
        <ul>
          <li><kbd>Space</kbd> — Oynat/Durdur</li>
          <li><kbd>Ctrl+Z</kbd> — Geri al</li>
          <li><kbd>Ctrl+Y</kbd> — Yinele</li>
          <li><kbd>Ctrl+C</kbd> — Secili hucreleri kopyala</li>
          <li><kbd>Ctrl+V</kbd> — Kopyalanan hucreleri yapistir</li>
          <li><kbd>Ctrl+D</kbd> — Sonraki 2 bari kopyala</li>
        </ul>
      </div>
      <div class="help-section">
        <h3>Vokal</h3>
        <ul>
          <li>Vokal tabinda mikrofon izni ver, <strong>Kayit Baslat</strong> a bas, konus/sarki soyle</li>
          <li><strong>Durdur</strong> a basinca ses otomatik eklenir</li>
          <li>Vokal data projeyle kaydedilir (<strong>.bfp</strong> dosyasi)</li>
        </ul>
      </div>
      <div class="help-section">
        <h3>Dosya</h3>
        <ul>
          <li><strong>Kaydet</strong> — projeyi localStorage + dosya indir (.bfp)</li>
          <li><strong>Ac</strong> — son projeler listesi</li>
          <li><strong>.bfp dosyasini surukle</strong> — dogrudan ac</li>
          <li><strong>Demo</strong> — Neon Pulse ornegi (174 BPM DnB)</li>
        </ul>
      </div>
      <div class="help-section">
        <h3>Efektler & Mixer</h3>
        <ul>
          <li>Her kanalda <strong>volume, pan, mute, solo</strong> var</li>
          <li><strong>6 master efekt</strong>: Reverb, Delay, Distortion, Filter, Compressor, Limiter</li>
          <li><strong>A/B karsilastirma</strong>: Oynatma sirasinda A/B anlik gecis (dugme force inaktif)</li>
        </ul>
      </div>
      <div class="help-section">
        <h3>Robot (Telegram Bot)</h3>
        <ul>
          <li>Telegram uzerinden proje olustur, BPM degistir, pattern yukle</li>
          <li>Bot kurulumu icin: <code class="help-link">beatforge-bot/npm run setup</code></li>
          <li>.bfp dosyasi degisince BeatForge otomatik senkron olur</li>
        </ul>
      </div>
      <div class="help-section">
        <h3>Build & Platform</h3>
        <ul>
          <li><code>npm run dev</code> — gelistirme (localhost:5173)</li>
          <li><code>npm run build</code> — PWA production</li>
          <li><code>node scripts/build-all.js</code> — tum platformlar</li>
        </ul>
      </div>
    </div>
  `;
  backdrop.appendChild(modal);

  document.getElementById('help-close').addEventListener('click', closeHelpModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeHelpModal();
  });
  document.addEventListener('keydown', escHelpListener);
}

function escHelpListener(e) {
  if (e.key === 'Escape') closeHelpModal();
}

function closeHelpModal() {
  document.querySelector('.help-modal-backdrop')?.remove();
  document.removeEventListener('keydown', escHelpListener);
}

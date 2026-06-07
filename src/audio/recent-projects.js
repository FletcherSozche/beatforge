import { loadProjectsList } from './storage.js';

const KEY_PROJECTS = 'beatforge.projects.list';

export function showRecentProjectsModal(onLoad, onDelete) {
  closeRecentProjectsModal();
  const list = loadProjectsList();
  const sorted = [...list].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

  const backdrop = document.createElement('div');
  backdrop.className = 'recent-modal-backdrop';
  backdrop.id = 'recent-modal-backdrop';
  backdrop.innerHTML = `
    <div class="recent-modal">
      <div class="recent-modal-head">
        <h2>SON PROJELER</h2>
        <button class="recent-modal-close" id="recent-modal-close" aria-label="Kapat">X</button>
      </div>
      <div class="recent-modal-body">
        ${sorted.length === 0 ? renderEmpty() : renderList(sorted)}
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  document.getElementById('recent-modal-close').addEventListener('click', closeRecentProjectsModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeRecentProjectsModal();
  });
  document.addEventListener('keydown', escListener);

  sorted.forEach((entry, i) => {
    const item = backdrop.querySelector(`[data-idx="${i}"]`);
    if (item) {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.recent-item-btn')) return;
        if (onLoad) onLoad(entry.data);
        closeRecentProjectsModal();
      });
    }
    const del = backdrop.querySelector(`[data-del="${i}"]`);
    if (del) {
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!confirm(`"${entry.name}" silinsin mi?`)) return;
        const all = loadProjectsList();
        const filtered = all.filter((p) => p.name !== entry.name);
        localStorage.setItem(KEY_PROJECTS, JSON.stringify(filtered));
        if (onDelete) onDelete(entry.name);
        closeRecentProjectsModal();
        showRecentProjectsModal(onLoad, onDelete);
      });
    }
  });
}

function escListener(e) {
  if (e.key === 'Escape') closeRecentProjectsModal();
}

function closeRecentProjectsModal() {
  document.getElementById('recent-modal-backdrop')?.remove();
  document.removeEventListener('keydown', escListener);
}

function renderEmpty() {
  return `
    <div class="recent-empty">
      <p>Henuz kayitli proje yok.</p>
      <p>Kaydet dugmesiyle proje olustur, burada listelensin.</p>
    </div>
  `;
}

function renderList(list) {
  return list.map((entry, i) => {
    const date = formatDate(entry.savedAt);
    const size = entry.data?.project?.vocals
      ? `${formatSize(JSON.stringify(entry.data).length)} (vokalli)`
      : formatSize(JSON.stringify(entry.data).length);
    const bpm = entry.data?.project?.bpm || '?';
    const bars = entry.data?.project?.bars || '?';
    return `
      <div class="recent-item" data-idx="${i}">
        <div class="recent-item-icon">${(entry.name || '?')[0].toUpperCase()}</div>
        <div class="recent-item-body">
          <div class="recent-item-name">${escapeHtml(entry.name)}</div>
          <div class="recent-item-meta">${date} - ${bpm} BPM - ${bars} bar - ${size}</div>
        </div>
        <div class="recent-item-actions">
          <button class="recent-item-btn del" data-del="${i}" title="Sil">DEL</button>
        </div>
      </div>
    `;
  }).join('');
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso || '?';
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

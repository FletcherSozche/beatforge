import { getSong, addSection, removeSection, moveSection, updateSection, getTotalBars, clearSong, onArrangeChange } from '../audio/arrange.js';

let rootEl = null;
let rerender = null;

export function buildArrangeUI(root) {
  rootEl = root;
  rootEl.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'arrange-ui';

  const header = document.createElement('div');
  header.className = 'arrange-header';
  header.innerHTML = '<h3>SONG ARRANGE</h3>';
  wrap.appendChild(header);

  const toolbar = document.createElement('div');
  toolbar.className = 'arrange-toolbar';
  const addBtn = document.createElement('button');
  addBtn.className = 'btn-ghost';
  addBtn.textContent = '+ Scene Ekle';
  addBtn.addEventListener('click', () => {
    addSection('Scene ' + (getSong().sections.length + 1), 4);
    renderList();
  });
  toolbar.appendChild(addBtn);

  const clearBtn = document.createElement('button');
  clearBtn.className = 'btn-ghost';
  clearBtn.textContent = 'Temizle';
  clearBtn.style.color = 'var(--danger)';
  clearBtn.addEventListener('click', () => { clearSong(); renderList(); });
  toolbar.appendChild(clearBtn);

  const info = document.createElement('span');
  info.className = 'arrange-info-bar';
  toolbar.appendChild(info);
  wrap.appendChild(toolbar);

  const list = document.createElement('div');
  list.className = 'arrange-list';
  wrap.appendChild(list);

  const hint = document.createElement('div');
  hint.className = 'arrange-hint';
  hint.textContent = 'Scene\'ler sirayla calinir. Her scene mevcut pattern\'i kullanir.';
  wrap.appendChild(hint);

  rootEl.appendChild(wrap);

  onArrangeChange(() => { renderList(); });
  renderList();
}

function renderList() {
  if (!rootEl) return;
  const song = getSong();
  const list = rootEl.querySelector('.arrange-list');
  const info = rootEl.querySelector('.arrange-info-bar');
  if (!list) return;
  list.innerHTML = '';
  if (song.sections.length === 0) {
    list.innerHTML = '<div class="arrange-empty">Henuz scene eklenmemis. "+ Scene Ekle" ile basla.</div>';
    if (info) info.textContent = '0 bar';
    return;
  }
  if (info) info.textContent = `${getTotalBars()} bar toplam`;
  song.sections.forEach((sec, idx) => {
    const item = document.createElement('div');
    item.className = 'arrange-item';
    item.innerHTML = `
      <span class="arrange-idx">${idx + 1}</span>
      <input class="arrange-name" value="${escHtml(sec.name)}" />
      <span class="arrange-bars-label">bar</span>
      <input class="arrange-bars" type="number" min="1" max="64" value="${sec.bars}" />
      <button class="btn-ghost arrange-up" ${idx === 0 ? 'disabled' : ''}>&#8593;</button>
      <button class="btn-ghost arrange-down" ${idx === song.sections.length - 1 ? 'disabled' : ''}>&#8595;</button>
      <button class="btn-ghost arrange-del" style="color:var(--danger)">&times;</button>
    `;
    item.querySelector('.arrange-name').addEventListener('change', (e) => {
      updateSection(sec.id, { name: e.target.value });
    });
    item.querySelector('.arrange-bars').addEventListener('change', (e) => {
      const v = parseInt(e.target.value, 10);
      if (v > 0) updateSection(sec.id, { bars: v });
      if (info) info.textContent = `${getTotalBars()} bar toplam`;
    });
    item.querySelector('.arrange-up')?.addEventListener('click', () => { moveSection(sec.id, -1); renderList(); });
    item.querySelector('.arrange-down')?.addEventListener('click', () => { moveSection(sec.id, 1); renderList(); });
    item.querySelector('.arrange-del').addEventListener('click', () => { removeSection(sec.id); renderList(); });
    list.appendChild(item);
  });
}

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

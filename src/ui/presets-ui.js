import { PRESETS } from '../audio/presets.js';

export function buildPresetList(rootEl, onSelect) {
  rootEl.innerHTML = '';
  PRESETS.forEach((preset) => {
    const card = document.createElement('div');
    card.className = 'preset-card';
    card.style.setProperty('--preset-color', preset.color);
    card.innerHTML = `
      <div class="preset-icon" style="background:${preset.color}">${preset.icon}</div>
      <div class="preset-info">
        <div class="preset-name">${preset.name}</div>
        <div class="preset-desc">${preset.desc}</div>
      </div>
      <div class="preset-meta">${preset.bpm} BPM</div>
    `;
    card.addEventListener('click', () => onSelect(preset));
    rootEl.appendChild(card);
  });
}

export function toast(message, type = 'info', host = document.getElementById('toast-host')) {
  if (!host) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  host.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

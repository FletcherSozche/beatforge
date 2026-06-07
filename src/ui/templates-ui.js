import { PATTERN_TEMPLATES, applyTemplate, getTemplateById } from '../audio/templates.js';
import { setPattern, totalSteps } from '../audio/sequencer.js';
import { setBpm } from '../audio/engine.js';
import { toast } from './presets-ui.js';

export function buildTemplatesUI(rootEl, onTemplateApplied) {
  if (!rootEl) return;
  rootEl.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'templates-grid';

  PATTERN_TEMPLATES.forEach((tmpl) => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.style.setProperty('--tmpl-color', tmpl.color);
    card.innerHTML = `
      <div class="tmpl-icon">${tmpl.icon}</div>
      <div class="tmpl-info">
        <div class="tmpl-name">${tmpl.name}</div>
        <div class="tmpl-desc">${tmpl.desc}</div>
        <div class="tmpl-meta">${tmpl.bpm} BPM</div>
      </div>
    `;
    card.addEventListener('click', () => {
      const pattern = window.beatforgeState?.getPattern?.();
      if (!pattern) return;
      const { pattern: newP, bpm } = applyTemplate(tmpl, pattern);
      setPattern(newP);
      setBpm(bpm);
      if (onTemplateApplied) onTemplateApplied({ bpm, pattern: newP, name: tmpl.name });
      toast(`Sablon yuklendi: ${tmpl.name}`, 'success');
    });
    wrap.appendChild(card);
  });

  rootEl.appendChild(wrap);
}

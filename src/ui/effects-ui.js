import { getFxDefinitions, setFxEnabled, setFxParam } from '../audio/effects.js';
import { createKnob } from './knob.js';

export function buildEffectsUI(rootEl) {
  rootEl.innerHTML = '';
  const rack = document.createElement('div');
  rack.className = 'fx-rack';

  const cards = [
    {
      id: 'reverb', name: 'Reverb', knobs: [
        { param: 'wet',   label: 'Mix',   min: 0, max: 1, value: 0.3, fmt: (v) => `${Math.round(v * 100)}%` },
        { param: 'decay', label: 'Decay', min: 0.1, max: 10, value: 2.5, fmt: (v) => `${v.toFixed(1)}s` }
      ]
    },
    {
      id: 'delay', name: 'Delay', knobs: [
        { param: 'wet',      label: 'Mix',     min: 0, max: 1, value: 0.25, fmt: (v) => `${Math.round(v * 100)}%` },
        { param: 'feedback', label: 'Feedback', min: 0, max: 0.95, value: 0.4, fmt: (v) => `${Math.round(v * 100)}%` }
      ]
    },
    {
      id: 'distortion', name: 'Distortion', knobs: [
        { param: 'wet',        label: 'Mix',    min: 0, max: 1, value: 0.5, fmt: (v) => `${Math.round(v * 100)}%` },
        { param: 'distortion', label: 'Drive', min: 0, max: 1, value: 0.4, fmt: (v) => `${Math.round(v * 100)}%` }
      ]
    },
    {
      id: 'filter', name: 'Filter (LP)', knobs: [
        { param: 'frequency', label: 'Cutoff', min: 60, max: 20000, value: 1200, fmt: (v) => `${Math.round(v)} Hz` },
        { param: 'Q',         label: 'Reso',   min: 0.1, max: 12, value: 1, fmt: (v) => v.toFixed(1) }
      ]
    },
    {
      id: 'phaser', name: 'Phaser', knobs: [
        { param: 'wet',       label: 'Mix',  min: 0, max: 1, value: 0.5, fmt: (v) => `${Math.round(v * 100)}%` },
        { param: 'frequency', label: 'Rate', min: 0.05, max: 8, value: 0.5, fmt: (v) => `${v.toFixed(2)}Hz` }
      ]
    },
    {
      id: 'compressor', name: 'Compressor', knobs: [
        { param: 'threshold', label: 'Thresh', min: -60, max: 0, value: -18, fmt: (v) => `${v.toFixed(1)} dB` },
        { param: 'ratio',     label: 'Ratio',  min: 1, max: 20, value: 4, fmt: (v) => `${v.toFixed(1)}:1` }
      ]
    }
  ];

  cards.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'fx-card';

    const head = document.createElement('div');
    head.className = 'fx-head';
    head.innerHTML = `<div class="fx-name">${c.name}</div>`;
    const toggle = document.createElement('div');
    toggle.className = 'fx-toggle';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-checked', 'false');
    toggle.addEventListener('click', () => {
      const on = !toggle.classList.contains('on');
      toggle.classList.toggle('on', on);
      toggle.setAttribute('aria-checked', String(on));
      setFxEnabled(c.id, on);
    });
    head.appendChild(toggle);
    card.appendChild(head);

    const knobs = document.createElement('div');
    knobs.className = 'fx-knobs';
    c.knobs.forEach((k) => {
      const knob = createKnob({
        min: k.min, max: k.max, value: k.value, label: k.label,
        valueFormat: k.fmt,
        onChange: (v) => setFxParam(c.id, k.param, v)
      });
      knobs.appendChild(knob.el);
    });
    card.appendChild(knobs);

    rack.appendChild(card);
  });

  rootEl.appendChild(rack);
}

export function createKnob({ min = 0, max = 1, value = 0.5, label = '', valueFormat, onChange }) {
  const wrap = document.createElement('div');
  wrap.className = 'knob-wrap';

  const knob = document.createElement('div');
  knob.className = 'knob';
  knob.tabIndex = 0;
  knob.setAttribute('role', 'slider');
  knob.setAttribute('aria-valuemin', String(min));
  knob.setAttribute('aria-valuemax', String(max));
  knob.setAttribute('aria-label', label);

  const labelEl = document.createElement('div');
  labelEl.className = 'knob-label';
  labelEl.textContent = label;

  const valueEl = document.createElement('div');
  valueEl.className = 'knob-value';

  let currentValue = value;
  const range = max - min;

  function format(v) {
    if (valueFormat) return valueFormat(v);
    if (range > 100) return Math.round(v).toString();
    if (range > 10) return v.toFixed(1);
    return v.toFixed(2);
  }

  function update(v, silent = false) {
    currentValue = Math.max(min, Math.min(max, v));
    const ratio = (currentValue - min) / range;
    const deg = -135 + ratio * 270;
    knob.style.setProperty('--rot', `${deg}deg`);
    knob.querySelector('::after');
    knob.style.setProperty('transform', '');
    knob.setAttribute('aria-valuenow', String(currentValue));
    knob.setAttribute('aria-valuetext', format(currentValue));
    valueEl.textContent = format(currentValue);

    const style = knob.style;
    style.setProperty('--knob-rot', `${deg}deg`);
    if (knob._after) {
      knob._after.style.transform = `translateX(-50%) rotate(${deg}deg)`;
    }

    if (!silent && onChange) onChange(currentValue);
  }

  const after = document.createElement('span');
  after.style.cssText = 'position:absolute;top:4px;left:50%;width:3px;height:14px;background:var(--accent-2);border-radius:2px;transform-origin:50% 24px;transform:translateX(-50%);box-shadow:0 0 6px var(--accent-2);pointer-events:none;';
  knob.appendChild(after);
  knob._after = after;

  knob.style.setProperty('--rot-applied', '0');
  const styleSheet = document.styleSheets[0];

  let dragging = false;
  let startY = 0;
  let startValue = 0;

  function onDown(e) {
    dragging = true;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startValue = currentValue;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const delta = startY - y;
    const sensitivity = e.shiftKey ? 0.0005 : 0.005;
    const change = delta * sensitivity * range;
    update(startValue + change);
  }

  function onUp() {
    dragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
  }

  knob.addEventListener('mousedown', onDown);
  knob.addEventListener('touchstart', onDown, { passive: false });

  knob.addEventListener('wheel', (e) => {
    e.preventDefault();
    const sensitivity = e.shiftKey ? 0.001 : 0.02;
    update(currentValue - Math.sign(e.deltaY) * range * sensitivity);
  }, { passive: false });

  knob.addEventListener('dblclick', () => update(value));

  knob.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? range * 0.01 : range * 0.05;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { update(currentValue + step); e.preventDefault(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { update(currentValue - step); e.preventDefault(); }
  });

  wrap.appendChild(knob);
  wrap.appendChild(labelEl);
  wrap.appendChild(valueEl);

  update(value, true);

  return {
    el: wrap,
    set: (v) => update(v, true),
    get: () => currentValue
  };
}

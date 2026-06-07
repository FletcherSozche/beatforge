import { getFFT } from '../audio/engine.js';

let canvas = null;
let ctx = null;
let rafId = null;
let bars = 32;
let peaks = new Array(bars).fill(0);

function colorForBar(i, total) {
  const hue = 180 + (i / total) * 80;
  return `hsl(${hue}, 100%, 60%)`;
}

function draw() {
  if (!canvas || !ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const fft = getFFT();

  ctx.clearRect(0, 0, w, h);

  if (!fft) {
    ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('START AUDIO', w / 2, h / 2);
    rafId = requestAnimationFrame(draw);
    return;
  }

  const data = fft.getValue();
  const slice = Math.floor(data.length / bars);
  const barWidth = w / bars;
  const gap = 1;
  const barInner = barWidth - gap;

  for (let i = 0; i < bars; i++) {
    let sum = 0;
    for (let j = 0; j < slice; j++) {
      const val = data[i * slice + j] || -100;
      sum += Math.max(0, 100 + val);
    }
    const avg = sum / slice;
    const normalized = Math.max(0, Math.min(1, avg / 100));
    const barH = normalized * h * 0.95;

    if (normalized > peaks[i]) {
      peaks[i] = normalized;
    } else {
      peaks[i] = Math.max(0, peaks[i] - 0.02);
    }

    const grd = ctx.createLinearGradient(0, h, 0, h - barH);
    grd.addColorStop(0, colorForBar(i, bars));
    grd.addColorStop(1, 'rgba(180, 0, 255, 0.9)');
    ctx.fillStyle = grd;
    ctx.shadowColor = colorForBar(i, bars);
    ctx.shadowBlur = 6;
    ctx.fillRect(i * barWidth + gap / 2, h - barH, barInner, barH);
    ctx.shadowBlur = 0;

    if (peaks[i] > 0.05) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(i * barWidth + gap / 2, h - peaks[i] * h * 0.95 - 2, barInner, 1.5);
    }
  }

  rafId = requestAnimationFrame(draw);
}

export function mountSpectrum(rootEl) {
  if (!rootEl) return;
  rootEl.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'spectrum-wrap';
  wrap.innerHTML = `
    <div class="spectrum-header">
      <span class="spectrum-label">SPECTRUM</span>
      <span class="spectrum-info">FFT 256</span>
    </div>
    <canvas class="spectrum-canvas" width="600" height="80"></canvas>
  `;
  rootEl.appendChild(wrap);

  canvas = wrap.querySelector('canvas');
  ctx = canvas.getContext('2d');

  const resize = () => {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.scale(dpr, dpr);
  };
  resize();
  window.addEventListener('resize', resize);

  if (rafId) cancelAnimationFrame(rafId);
  draw();

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
  };
}

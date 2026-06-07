import * as Tone from 'tone';

let enabled = false;
let countInEnabled = true;
let player = null;
let callback = null;

function ensurePlayer() {
  if (player) return;
  const ctx = Tone.getContext().rawContext;
  const sr = ctx.sampleRate;
  const duration = 0.015;
  const len = Math.floor(sr * duration);
  const buffer = ctx.createBuffer(1, len, sr);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.max(0, 1 - t / duration);
    data[i] = Math.sin(2 * Math.PI * 800 * t) * env * 0.6;
  }
  player = new Tone.Player(buffer);
  player.volume.value = -8;
  player.toDestination();
}

export function isMetronomeEnabled() {
  return enabled;
}

export function setMetronomeEnabled(v) {
  enabled = !!v;
}

export function isCountInEnabled() {
  return countInEnabled;
}

export function setCountInEnabled(v) {
  countInEnabled = !!v;
}

export function setMetronomeCallback(fn) {
  callback = fn;
}

export function startMetronome() {
  if (!enabled) return;
  ensurePlayer();
  const beatInterval = Tone.Time('4n').toSeconds();
  const sixteenth = Tone.Time('16n').toSeconds();
  const bpm = Tone.getTransport().bpm.value;
  const loop = new Tone.Loop((time) => {
    if (!enabled) return;
    try {
      const p = new Tone.Player(player.buffer);
      p.volume.value = -6;
      p.toDestination();
      p.start(time);
      setTimeout(() => { try { p.dispose(); } catch (e) {} }, 100);
      if (callback) callback(time);
    } catch (e) {
      console.warn('Metronome tick error:', e);
    }
  }, '4n');
  loop.start(0);
  return loop;
}

export async function startCountIn(bars = 1) {
  if (!enabled && !countInEnabled) return;
  ensurePlayer();
  return new Promise((resolve) => {
    const ctx = Tone.getContext().rawContext;
    const bpm = Tone.getTransport().bpm.value;
    const beatMs = 60000 / bpm;
    const beats = bars * 4;
    let count = 0;

    function tick() {
      const p = new Tone.Player(player.buffer);
      p.volume.value = count === 0 ? -3 : -8;
      p.toDestination();
      p.start();
      setTimeout(() => { try { p.dispose(); } catch (e) {} }, 100);
      count++;
      if (count >= beats) {
        resolve();
      } else {
        setTimeout(tick, beatMs);
      }
    }
    tick();
  });
}

export function stopMetronome() {
  Tone.getTransport().cancel();
}

export function disposeMetronome() {
  if (player) { try { player.dispose(); } catch (e) {} player = null; }
}

import { VOCAL_TRACK_IDS, getInstrument, getVocalTracks, setVocalBuffer, getVocalBuffer } from '../audio/instruments.js';
import {
  requestMicPermission, releaseMic, isMicActive,
  startRecording, stopRecording, isCurrentlyRecording, getCurrentVocalId, getCurrentDuration,
  onRecordingEvent
} from '../audio/vocal.js';

let activeTabId = 'vocal1';
let durationTimer = null;

export function buildVocalUI(rootEl) {
  rootEl.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'vocal-ui';

  const tabs = document.createElement('div');
  tabs.className = 'vocal-tabs';

  VOCAL_TRACK_IDS.forEach((id) => {
    const t = document.createElement('button');
    t.className = 'vocal-tab' + (id === activeTabId ? ' active' : '');
    t.dataset.vocalId = id;
    t.innerHTML = `
      <div class="vocal-tab-icon">V</div>
      <div class="vocal-tab-info">
        <div class="vocal-tab-name">${id.toUpperCase()}</div>
        <div class="vocal-tab-status" data-status="${id}">Bos</div>
      </div>
    `;
    t.addEventListener('click', () => {
      activeTabId = id;
      buildVocalUI(rootEl);
    });
    tabs.appendChild(t);
  });
  wrap.appendChild(tabs);

  const controls = document.createElement('div');
  controls.className = 'vocal-controls';
  controls.innerHTML = `
    <div class="vocal-info">
      <div class="vocal-meter">
        <div class="vocal-meter-bar" id="vocal-meter"></div>
      </div>
      <div class="vocal-duration" id="vocal-duration">0:00</div>
    </div>
    <div class="vocal-actions">
      <button class="btn-ghost btn-record" id="vocal-record">
        <svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="6" fill="currentColor"/></svg>
        <span id="vocal-record-text">Kayit Baslat</span>
      </button>
      <button class="btn-ghost" id="vocal-test">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
        <span>Dinle</span>
      </button>
      <button class="btn-ghost" id="vocal-clear">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6h12v12H6z" fill="currentColor"/></svg>
        <span>Temizle</span>
      </button>
    </div>
    <div class="vocal-hint">
      Vokali sequencer'a koymak istedigin adima tikla. Izgara <strong>${activeTabId.toUpperCase()}</strong> kanalinda aktif olur.
    </div>
  `;
  wrap.appendChild(controls);

  const deviceInfo = document.createElement('div');
  deviceInfo.className = 'vocal-device';
  if (!navigator.mediaDevices?.getUserMedia) {
    deviceInfo.innerHTML = '<div class="vocal-warn">Tarayici mikrofon erisimini desteklemiyor. Chrome, Edge veya Firefox kullan.</div>';
  } else {
    deviceInfo.innerHTML = '<div class="vocal-ok">Mikrofon hazir. Kayit icin izin gerekli.</div>';
  }
  wrap.appendChild(deviceInfo);

  rootEl.appendChild(wrap);
  bindVocalEvents();
  refreshVocalStatus();
}

function bindVocalEvents() {
  const recordBtn = document.getElementById('vocal-record');
  const testBtn = document.getElementById('vocal-test');
  const clearBtn = document.getElementById('vocal-clear');

  if (recordBtn) {
    recordBtn.addEventListener('click', async () => {
      if (isCurrentlyRecording()) {
        stopRecording();
        recordBtn.classList.remove('recording');
        document.getElementById('vocal-record-text').textContent = 'Kayit Baslat';
        if (durationTimer) { clearInterval(durationTimer); durationTimer = null; }
      } else {
        const ok = await startRecording(activeTabId);
        if (ok) {
          recordBtn.classList.add('recording');
          document.getElementById('vocal-record-text').textContent = 'Durdur';
          startDurationTimer();
        }
      }
    });
  }

  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      const inst = getInstrument(activeTabId);
      if (!inst?.hasRecording?.()) return;
      inst.trigger(undefined, 0.9);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      setVocalBuffer(activeTabId, null, null);
      refreshVocalStatus();
    });
  }
}

function startDurationTimer() {
  const durEl = document.getElementById('vocal-duration');
  if (durationTimer) clearInterval(durationTimer);
  durationTimer = setInterval(() => {
    const sec = getCurrentDuration();
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    if (durEl) durEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
  }, 100);
}

export function refreshVocalStatus() {
  VOCAL_TRACK_IDS.forEach((id) => {
    const el = document.querySelector(`[data-status="${id}"]`);
    if (!el) return;
    const inst = getInstrument(id);
    if (inst?.hasRecording?.()) {
      const buf = getVocalBuffer(id);
      const sec = buf ? buf.duration : 0;
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      el.textContent = `${m}:${String(s).padStart(2, '0')}`;
      el.classList.add('has-recording');
    } else {
      el.textContent = 'Bos';
      el.classList.remove('has-recording');
    }
  });
}

export function getActiveVocalTrackId() {
  return activeTabId;
}

onRecordingEvent((event) => {
  if (event.type === 'recorded') {
    setVocalBuffer(event.vocalId, event.buffer);
    refreshVocalStatus();
  }
});

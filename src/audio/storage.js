import { VOCAL_TRACK_IDS, getInstrument } from './instruments.js';
import { audioBufferToBase64Wav, base64WavToAudioBuffer } from './wav-encoder.js';

const KEY = 'beatforge.project.v1';
const KEY_SETTINGS = 'beatforge.settings.v1';
const KEY_PROJECTS = 'beatforge.projects.list';
const PROJECT_VERSION = 2;

export function saveProject(name, project) {
  try {
    const payload = {
      version: PROJECT_VERSION,
      savedAt: new Date().toISOString(),
      name: name || 'Yeni Proje',
      project
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
    const list = loadProjectsList();
    const existing = list.findIndex((p) => p.name === name);
    const entry = { name, savedAt: payload.savedAt, data: payload };
    if (existing >= 0) list[existing] = entry; else list.push(entry);
    localStorage.setItem(KEY_PROJECTS, JSON.stringify(list));
    return true;
  } catch (err) {
    console.error('Save failed', err);
    return false;
  }
}

export async function saveProjectWithVocals(name, project) {
  try {
    const vocals = {};
    for (const id of VOCAL_TRACK_IDS) {
      const inst = getInstrument(id);
      const buf = inst?.node?.buffer;
      if (buf && inst.hasRecording()) {
        try {
          const b64 = await audioBufferToBase64Wav(buf);
          vocals[id] = {
            name: inst.getName?.() || id,
            duration: buf.duration,
            sampleRate: buf.sampleRate,
            channels: buf.numberOfChannels,
            format: 'wav',
            data: b64
          };
        } catch (e) {
          console.warn(`Vocal ${id} serialize failed:`, e.message);
        }
      }
    }
    const enriched = { ...project, vocals };
    const payload = {
      version: PROJECT_VERSION,
      savedAt: new Date().toISOString(),
      name: name || 'Yeni Proje',
      project: enriched
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
    const list = loadProjectsList();
    const existing = list.findIndex((p) => p.name === name);
    const entry = { name, savedAt: payload.savedAt, data: payload };
    if (existing >= 0) list[existing] = entry; else list.push(entry);
    try {
      localStorage.setItem(KEY_PROJECTS, JSON.stringify(list));
    } catch (quotaErr) {
      console.warn('Project list quota exceeded (vokal verisi buyuk olabilir)');
    }
    return { ok: true, size: JSON.stringify(payload).length };
  } catch (err) {
    console.error('Save with vocals failed', err);
    return { ok: false, error: err.message };
  }
}

export function loadProject() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Load failed', err);
    return null;
  }
}

export function loadProjectsList() {
  try {
    const raw = localStorage.getItem(KEY_PROJECTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function exportProjectFile(name, project) {
  const enriched = { ...project };
  try {
    const vocals = {};
    for (const id of VOCAL_TRACK_IDS) {
      const inst = getInstrument(id);
      const buf = inst?.node?.buffer;
      if (buf && inst.hasRecording()) {
        const b64 = await audioBufferToBase64Wav(buf);
        vocals[id] = {
          name: inst.getName?.() || id,
          duration: buf.duration,
          sampleRate: buf.sampleRate,
          channels: buf.numberOfChannels,
          format: 'wav',
          data: b64
        };
      }
    }
    if (Object.keys(vocals).length) enriched.vocals = vocals;
  } catch (e) {
    console.warn('Vokal serialize basarisiz (dosyasi vokalsiz kaydedilecek):', e.message);
  }
  const payload = JSON.stringify({
    version: PROJECT_VERSION,
    name,
    savedAt: new Date().toISOString(),
    project: enriched
  }, null, 2);

  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(name || 'beatforge-project').replace(/[^a-z0-9-_]/gi, '-')}.bfp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function restoreVocals(project, audioContext) {
  if (!project?.vocals) return 0;
  const ctx = audioContext || window.__beatforgeAudioCtx || null;
  let restored = 0;
  for (const id of VOCAL_TRACK_IDS) {
    const data = project.vocals[id];
    if (!data?.data) continue;
    try {
      const buf = await base64WavToAudioBuffer(data.data, ctx);
      const inst = getInstrument(id);
      if (inst?.setBuffer) {
        inst.setBuffer(buf, data.name);
        restored++;
      }
    } catch (e) {
      console.warn(`Vocal ${id} restore failed:`, e.message);
    }
  }
  return restored;
}

export async function importProjectFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.bfp,.json,application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      try {
        const text = await file.text();
        resolve(JSON.parse(text));
      } catch (err) {
        console.error('Import failed', err);
        resolve(null);
      }
    };
    input.click();
  });
}

export async function exportAudioBlob(blob, filename = 'beatforge-export.wav') {
  if (window.beatforge?.isDesktop && window.beatforge.saveAudio) {
    const arrayBuffer = await blob.arrayBuffer();
    return window.beatforge.saveAudio({ buffer: arrayBuffer, defaultName: filename });
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { ok: true };
}

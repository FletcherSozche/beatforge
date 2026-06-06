const KEY = 'beatforge.project.v1';
const KEY_SETTINGS = 'beatforge.settings.v1';
const KEY_PROJECTS = 'beatforge.projects.list';

export function saveProject(name, project) {
  try {
    const payload = {
      version: 1,
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

export function exportProjectFile(name, project) {
  const payload = JSON.stringify({
    version: 1,
    name,
    savedAt: new Date().toISOString(),
    project
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

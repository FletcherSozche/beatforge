import { saveProject } from './storage.js';

const AUTOSAVE_KEY = 'beatforge.autosave';
const AUTOSAVE_INTERVAL = 30000;
let timer = null;
let enabled = true;

export function startAutosave(getProjectName, getProjectData) {
  if (timer) return;
  enabled = true;
  timer = setInterval(() => {
    if (!enabled) return;
    try {
      const name = getProjectName();
      const data = getProjectData();
      saveProject(name + ' [auto]', data);
      window.dispatchEvent(new CustomEvent('beatforge:autosave', { detail: { at: Date.now() } }));
    } catch (err) {
      console.warn('Autosave failed', err);
    }
  }, AUTOSAVE_INTERVAL);
}

export function stopAutosave() {
  if (timer) clearInterval(timer);
  timer = null;
}

export function setAutosaveEnabled(v) {
  enabled = !!v;
}

export function getLastAutosave() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function manualAutosave(getProjectName, getProjectData) {
  const name = getProjectName();
  const data = getProjectData();
  saveProject(name + ' [auto]', data);
  return Date.now();
}

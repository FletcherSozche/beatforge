import { saveProject, saveProjectWithVocals } from './storage.js';

const AUTOSAVE_KEY = 'beatforge.autosave';
const AUTOSAVE_INTERVAL = 30000;
let timer = null;
let enabled = true;
let includeVocals = false;

export function startAutosave(getProjectName, getProjectData, opts = {}) {
  if (timer) return;
  enabled = true;
  includeVocals = !!opts.includeVocals;
  timer = setInterval(() => {
    if (!enabled) return;
    autosaveNow(getProjectName, getProjectData).catch((e) => {
      console.warn('Autosave failed', e);
    });
  }, AUTOSAVE_INTERVAL);
}

export async function autosaveNow(getProjectName, getProjectData) {
  const name = getProjectName();
  const data = getProjectData();
  if (includeVocals) {
    const res = await saveProjectWithVocals(name + ' [auto]', data);
    if (res?.ok) {
      window.dispatchEvent(new CustomEvent('beatforge:autosave', { detail: { at: Date.now(), size: res.size, withVocals: true } }));
    }
  } else {
    saveProject(name + ' [auto]', data);
    window.dispatchEvent(new CustomEvent('beatforge:autosave', { detail: { at: Date.now(), withVocals: false } }));
  }
  return Date.now();
}

export function stopAutosave() {
  if (timer) clearInterval(timer);
  timer = null;
}

export function setAutosaveEnabled(v) {
  enabled = !!v;
}

export function setAutosaveIncludeVocals(v) {
  includeVocals = !!v;
}

export function getLastAutosave() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function manualAutosave(getProjectName, getProjectData) {
  return autosaveNow(getProjectName, getProjectData);
}

let song = { sections: [], loop: true };
let currentSectionIndex = -1;
let onChangeCallback = null;

export function getSong() {
  return song;
}

export function setSong(newSong) {
  song = { ...song, ...newSong };
  if (!song.sections) song.sections = [];
  notifyChange();
}

export function addSection(name, bars) {
  song.sections.push({
    id: Date.now().toString(36),
    name: name || 'Scene ' + (song.sections.length + 1),
    bars: bars || 4
  });
  notifyChange();
}

export function removeSection(id) {
  song.sections = song.sections.filter((s) => s.id !== id);
  if (currentSectionIndex >= song.sections.length) currentSectionIndex = song.sections.length - 1;
  notifyChange();
}

export function moveSection(id, direction) {
  const idx = song.sections.findIndex((s) => s.id === id);
  if (idx < 0) return;
  const target = idx + direction;
  if (target < 0 || target >= song.sections.length) return;
  const tmp = song.sections[idx];
  song.sections[idx] = song.sections[target];
  song.sections[target] = tmp;
  if (currentSectionIndex === idx) currentSectionIndex = target;
  else if (currentSectionIndex === target) currentSectionIndex = idx;
  notifyChange();
}

export function updateSection(id, changes) {
  const sec = song.sections.find((s) => s.id === id);
  if (sec) Object.assign(sec, changes);
  notifyChange();
}

export function getTotalBars() {
  return song.sections.reduce((sum, s) => sum + (s.bars || 4), 0);
}

export function getSectionAtBar(barIndex) {
  let accum = 0;
  for (let i = 0; i < song.sections.length; i++) {
    accum += song.sections[i].bars || 4;
    if (barIndex < accum) return { index: i, section: song.sections[i], offset: barIndex - (accum - (song.sections[i].bars || 4)) };
  }
  if (song.sections.length > 0) {
    const last = song.sections.length - 1;
    return { index: last, section: song.sections[last], offset: (song.sections[last].bars || 4) - 1 };
  }
  return null;
}

export function getCurrentSectionIndex() {
  return currentSectionIndex;
}

export function setCurrentSectionIndex(idx) {
  currentSectionIndex = idx;
  notifyChange();
}

export function onArrangeChange(cb) {
  onChangeCallback = cb;
}

export function clearSong() {
  song.sections = [];
  currentSectionIndex = -1;
  notifyChange();
}

function notifyChange() {
  if (onChangeCallback) onChangeCallback(song);
}

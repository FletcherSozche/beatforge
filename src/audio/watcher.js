let pollTimer = null;
let lastMtime = 0;
let currentFilePath = null;
let onUpdate = null;
let detachChangeHandler = null;

async function checkOnce() {
  if (!currentFilePath || !onUpdate) return;
  try {
    let mtime = 0;
    let content = null;

    if (typeof window !== 'undefined' && window.beatforge?.getFileMeta) {
      const meta = await window.beatforge.getFileMeta(currentFilePath);
      if (!meta) return;
      mtime = meta.mtime;
      if (mtime === lastMtime) return;
      lastMtime = mtime;
      content = await window.beatforge.readFile(currentFilePath);
    } else {
      return;
    }

    if (content) {
      try {
        const data = JSON.parse(content);
        onUpdate(data);
      } catch (e) {
        console.warn('watcher parse fail', e.message);
      }
    }
  } catch (e) {
    // dosya yoksa sessizce yoksay
  }
}

export function setupProjectWatcher(filePath, callback) {
  stopWatching();
  currentFilePath = filePath;
  onUpdate = callback;
  lastMtime = 0;

  if (typeof window !== 'undefined' && window.beatforge?.watchFile) {
    window.beatforge.watchFile(filePath);
    if (window.beatforge.onFileChanged) {
      detachChangeHandler = window.beatforge.onFileChanged((payload) => {
        if (payload?.filePath !== currentFilePath) return;
        try {
          const data = JSON.parse(payload.content);
          if (onUpdate) onUpdate(data);
        } catch (e) {
          console.warn('watcher parse fail', e.message);
        }
      });
    }
  } else {
    pollTimer = setInterval(checkOnce, 2000);
  }

  return () => stopWatching();
}

export function stopWatching() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
  if (currentFilePath && window.beatforge?.unwatchFile) {
    window.beatforge.unwatchFile(currentFilePath);
  }
  if (detachChangeHandler) {
    detachChangeHandler();
    detachChangeHandler = null;
  }
  currentFilePath = null;
  onUpdate = null;
  lastMtime = 0;
}

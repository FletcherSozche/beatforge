const MAX_HISTORY = 80;
const stack = [];
let cursor = -1;
let pendingSnapshot = null;
let debounceTimer = null;

function snapshot(pattern) {
  return JSON.parse(JSON.stringify(pattern));
}

function isDifferent(a, b) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export function pushHistory(pattern) {
  const snap = snapshot(pattern);
  if (cursor >= 0 && !isDifferent(snap, stack[cursor])) return;
  if (cursor < stack.length - 1) stack.length = cursor + 1;
  stack.push(snap);
  if (stack.length > MAX_HISTORY) {
    stack.shift();
  } else {
    cursor++;
  }
}

export function debouncedHistory(pattern, delay = 400) {
  pendingSnapshot = pattern;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (pendingSnapshot) {
      pushHistory(pendingSnapshot);
      pendingSnapshot = null;
    }
  }, delay);
}

export function flushHistory(pattern) {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (pendingSnapshot) {
    pushHistory(pendingSnapshot);
    pendingSnapshot = null;
  } else {
    pushHistory(pattern);
  }
}

export function canUndo() { return cursor > 0; }
export function canRedo() { return cursor < stack.length - 1; }

export function undo() {
  if (!canUndo()) return null;
  cursor--;
  return snapshot(stack[cursor]);
}

export function redo() {
  if (!canRedo()) return null;
  cursor++;
  return snapshot(stack[cursor]);
}

export function clearHistory() {
  stack.length = 0;
  cursor = -1;
  pendingSnapshot = null;
  if (debounceTimer) clearTimeout(debounceTimer);
}

export function getHistorySize() {
  return { stack: stack.length, cursor };
}

const PPQN = 480;
const TICK_16TH = PPQN / 4;

const DRUM_NOTE_MAP = {
  kick: 36, sub: 36, snare: 38, clap: 39, rim: 37,
  'tom-hi': 50, 'tom-mid': 48, 'tom-lo': 45,
  hat: 42, ohat: 46, shaker: 54, cowbell: 56,
  ride: 51, crash: 49, crash2: 57, fx: 55, wobble: 52,
  bass: 40, lead: 76, pad: 73, pluck: 77
};

function toVarLen(value) {
  const bytes = [];
  bytes.push(value & 0x7F);
  value >>= 7;
  while (value > 0) {
    bytes.push((value & 0x7F) | 0x80);
    value >>= 7;
  }
  bytes.reverse();
  return Uint8Array.from(bytes);
}

function writeU16(view, off, val) {
  view.setUint16(off, val, false);
  return off + 2;
}

function writeU32(view, off, val) {
  view.setUint32(off, val, false);
  return off + 4;
}

function writeBytes(view, off, bytes) {
  view.set(bytes, off);
  return off + bytes.length;
}

function makeMetaEvent(type, data) {
  const d = toVarLen(0);
  const payload = new Uint8Array(3 + d.length + data.length);
  let off = 0;
  payload.set(d, off); off += d.length;
  payload[off++] = 0xFF;
  payload[off++] = type;
  const len = toVarLen(data.length);
  payload.set(len, off); off += len.length;
  payload.set(data, off); off += data.length;
  return payload.subarray(0, off);
}

function makeNoteOn(delta, channel, note, vel) {
  const d = toVarLen(delta);
  const buf = new Uint8Array(d.length + 3);
  let off = 0;
  buf.set(d, off); off += d.length;
  buf[off++] = 0x90 | (channel & 0x0F);
  buf[off++] = note;
  buf[off++] = vel;
  return buf;
}

function makeNoteOff(delta, channel, note, vel) {
  const d = toVarLen(delta);
  const buf = new Uint8Array(d.length + 3);
  let off = 0;
  buf.set(d, off); off += d.length;
  buf[off++] = 0x80 | (channel & 0x0F);
  buf[off++] = note;
  buf[off++] = vel;
  return buf;
}

function makeEndOfTrack() {
  return new Uint8Array([0x00, 0xFF, 0x2F, 0x00]);
}

export function exportPatternToMidi(pattern, bpm = 174) {
  const midiNotes = getMidiNotesFromPattern(pattern);
  const notesPerTrack = {};
  midiNotes.forEach((n) => {
    if (!notesPerTrack[n.trackId]) notesPerTrack[n.trackId] = [];
    notesPerTrack[n.trackId].push(n);
  });

  const trackIds = Object.keys(notesPerTrack);
  const trackCount = trackIds.length + 1;
  const headerSize = 14;
  const trackHeadersSize = trackCount * 8;
  let totalDataSize = headerSize + trackHeadersSize;

  const trackBytes = [];

  for (const trackId of trackIds) {
    const notes = notesPerTrack[trackId];
    notes.sort((a, b) => a.tick - b.tick);

    let lastTick = 0;
    const events = [];

    events.push(makeMetaEvent(0x03, strToBytes(trackId)));

      for (const n of notes) {
        const midiChannel = n.trackId.startsWith('vocal') ? 10 : (DRUM_NOTE_MAP[n.trackId] !== undefined ? 9 : 0);
        const deltaOn = n.tick - lastTick;
        events.push(makeNoteOn(deltaOn, midiChannel, n.note, Math.round(n.vel * 127)));
        const deltaOff = (n.tick + n.durationTicks) - n.tick;
        events.push(makeNoteOff(deltaOff, midiChannel, n.note, 0));
        lastTick = n.tick + n.durationTicks;
      }

    events.push(makeEndOfTrack());
    const trackData = concatBytes(events);
    totalDataSize += trackData.length;
    trackBytes.push(trackData);
  }

  {
    const tempoEvents = [];
    const tempoBpm = Math.round(60000000 / (bpm || 120));
    const tempoMeta = new Uint8Array(7);
    tempoMeta[0] = 0x00; // delta
    tempoMeta[1] = 0xFF; // meta
    tempoMeta[2] = 0x51; // tempo
    tempoMeta[3] = 0x03; // length 3
    tempoMeta[4] = (tempoBpm >> 16) & 0xFF;
    tempoMeta[5] = (tempoBpm >> 8) & 0xFF;
    tempoMeta[6] = tempoBpm & 0xFF;
    tempoEvents.push(tempoMeta);
    tempoEvents.push(makeMetaEvent(0x03, strToBytes('BeatForge Export')));
    tempoEvents.push(makeEndOfTrack());
    const tempoTrack = concatBytes(tempoEvents);
    totalDataSize += tempoTrack.length;
    trackBytes.unshift(tempoTrack);
  }

  const finalBuf = new ArrayBuffer(totalDataSize);
  const view = new DataView(finalBuf);
  let offset = 0;

  writeAscii(view, offset, 'MThd'); offset += 4;
  writeU32(view, offset, 6); offset += 4;
  writeU16(view, offset, 1); offset += 2;
  writeU16(view, offset, trackCount); offset += 2;
  writeU16(view, offset, PPQN); offset += 2;

  for (const tb of trackBytes) {
    writeAscii(view, offset, 'MTrk'); offset += 4;
    writeU32(view, offset, tb.length); offset += 4;
    offset = writeBytes(view, offset, tb);
  }

  const blob = new Blob([finalBuf], { type: 'audio/midi' });
  return blob;
}

function getMidiNotesFromPattern(pattern) {
  const notes = [];
  const totalSteps = (pattern.bars || 1) * 16;
  const defaultDuration = TICK_16TH;

  for (const [trackId, track] of Object.entries(pattern.tracks || {})) {
    if (!track?.steps) continue;
    const note = DRUM_NOTE_MAP[trackId] || 60;
    const isVocal = trackId.startsWith('vocal');
    if (isVocal) continue;

    for (let i = 0; i < totalSteps && i < track.steps.length; i++) {
      const cell = track.steps[i];
      if (!cell || !cell.on) continue;
      notes.push({
        trackId,
        note: cell.note ? midiNoteFromString(cell.note) : note,
        tick: i * TICK_16TH,
        durationTicks: TICK_16TH,
        vel: cell.vel || 0.85
      });
    }
  }
  return notes;
}

function midiNoteFromString(str) {
  const map = { 'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11 };
  const m = str.match(/^([A-G][b#]?)(-?\d+)$/);
  if (!m) return 60;
  const pitch = map[m[1]];
  if (pitch === undefined) return 60;
  const octave = parseInt(m[2], 10);
  return (octave + 1) * 12 + pitch;
}

function strToBytes(s) {
  return new TextEncoder().encode(s);
}

function concatBytes(arrays) {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const r = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) { r.set(a, off); off += a.length; }
  return r;
}

function writeAscii(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

export function downloadMidi(blob, filename = 'beatforge-export.mid') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

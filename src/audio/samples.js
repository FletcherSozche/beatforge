import * as Tone from 'tone';

const samples = new Map();

export function assignSample(trackId, buffer, name) {
  samples.set(trackId, { buffer, name, duration: buffer.duration, sampleRate: buffer.sampleRate });
}

export function clearSample(trackId) {
  samples.delete(trackId);
}

export function getSample(trackId) {
  return samples.get(trackId) || null;
}

export function hasSample(trackId) {
  return samples.has(trackId);
}

export function getAllSamples() {
  return samples;
}

export function triggerSample(trackId, time, vel = 1, channel) {
  const s = samples.get(trackId);
  if (!s) return null;
  const player = new Tone.Player(s.buffer);
  player.volume.value = Tone.gainToDb(Math.max(0.01, vel || 1));
  if (channel) player.connect(channel);
  player.start(time);
  const dur = s.buffer.duration;
  setTimeout(() => { try { player.dispose(); } catch (e) {} }, (dur + 0.5) * 1000);
  return player;
}

const ACCEPTED_TYPES = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/aiff', 'audio/x-aiff', 'audio/flac'];

export function loadSampleFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !/\.(wav|mp3|ogg|aiff?|flac)$/i.test(file.name)) {
      reject(new Error('Desteklenmeyen format: ' + file.name));
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const ctx = Tone.getContext().rawContext;
        const ab = e.target.result;
        const buffer = await ctx.decodeAudioData(ab);
        resolve({ buffer, name: file.name.replace(/\.[^.]+$/, ''), duration: buffer.duration });
      } catch (err) {
        reject(new Error('Ses cozulemedi: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Dosya okunamadi'));
    reader.readAsArrayBuffer(file);
  });
}

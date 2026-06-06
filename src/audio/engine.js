import * as Tone from 'tone';

let started = false;
let masterLimiter = null;
let masterVolume = null;
let masterAnalyser = null;
let masterRecorder = null;

export async function startAudio() {
  if (started) return true;
  try {
    await Tone.start();
    if (Tone.getContext().state !== 'running') {
      await Tone.getContext().resume();
    }
    started = true;
    return true;
  } catch (err) {
    console.error('Audio start failed', err);
    return false;
  }
}

export function isStarted() {
  return started && Tone.getContext().state === 'running';
}

export function initMasterChain() {
  if (masterLimiter) return { volume: masterVolume, analyser: masterAnalyser };
  masterVolume = new Tone.Volume(-6);
  masterLimiter = new Tone.Limiter(-1);
  masterAnalyser = new Tone.Meter({ smoothing: 0.85 });
  masterVolume.chain(masterLimiter, masterAnalyser, Tone.getDestination());
  return { volume: masterVolume, analyser: masterAnalyser };
}

export function getMasterInput() {
  if (!masterVolume) initMasterChain();
  return masterVolume;
}

export function setMasterVolumeDb(db) {
  if (!masterVolume) initMasterChain();
  masterVolume.volume.rampTo(db, 0.05);
}

export function getMasterLevel() {
  if (!masterAnalyser) return -Infinity;
  const v = masterAnalyser.getValue();
  return typeof v === 'number' ? v : v[0] || -Infinity;
}

export function setBpm(bpm) {
  Tone.getTransport().bpm.rampTo(bpm, 0.1);
}

export function getBpm() {
  return Tone.getTransport().bpm.value;
}

export function play() {
  if (Tone.getTransport().state !== 'started') {
    Tone.getTransport().start('+0.05');
  }
}

export function pause() {
  Tone.getTransport().pause();
}

export function stop() {
  Tone.getTransport().stop();
  Tone.getTransport().position = '0:0:0';
}

export function getTransportState() {
  return Tone.getTransport().state;
}

export function getPosition() {
  const pos = Tone.getTransport().position.toString();
  const [bar, beat, sixteenth] = pos.split(':');
  return {
    bar: parseInt(bar, 10) + 1,
    beat: parseInt(beat, 10) + 1,
    sixteenth: Math.floor(parseFloat(sixteenth)) + 1
  };
}

export function scheduleRepeat(callback, interval, startTime = 0) {
  return Tone.getTransport().scheduleRepeat(callback, interval, startTime);
}

export function clearSchedule(id) {
  Tone.getTransport().clear(id);
}

export function cancelAllSchedules() {
  Tone.getTransport().cancel(0);
}

export async function startRecording() {
  if (masterRecorder) return false;
  masterRecorder = new Tone.Recorder();
  getMasterInput().connect(masterRecorder);
  await masterRecorder.start();
  return true;
}

export async function stopRecording() {
  if (!masterRecorder) return null;
  const blob = await masterRecorder.stop();
  try { getMasterInput().disconnect(masterRecorder); } catch {}
  masterRecorder.dispose();
  masterRecorder = null;
  return blob;
}

export function isRecording() {
  return masterRecorder !== null;
}

export { Tone };

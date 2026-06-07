import * as Tone from 'tone';

let mediaStream = null;
let mediaRecorder = null;
let audioChunks = [];
let recordStartTime = 0;
let isRecording = false;
let activeVocalId = null;

const listeners = new Set();

export function onRecordingEvent(handler) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

function emit(event) {
  listeners.forEach((h) => h(event));
}

export async function requestMicPermission() {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Tarayici mikrofon erisimini desteklemiyor');
    }
    if (mediaStream) return true;
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    return true;
  } catch (err) {
    console.error('Mikrofon izni reddedildi:', err);
    emit({ type: 'error', message: err.message });
    return false;
  }
}

export function releaseMic() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
}

export function isMicActive() {
  return mediaStream !== null;
}

export async function startRecording(vocalId) {
  if (isRecording) return false;
  const ok = await requestMicPermission();
  if (!ok) return false;

  audioChunks = [];
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : '';

  mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
  activeVocalId = vocalId;
  recordStartTime = performance.now();

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };

  mediaRecorder.onstop = async () => {
    const duration = (performance.now() - recordStartTime) / 1000;
    const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioCtx = Tone.getContext().rawContext;
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      emit({ type: 'recorded', vocalId: activeVocalId, buffer: decoded, duration, blob });
    } catch (err) {
      console.error('Decode failed', err);
      emit({ type: 'error', message: 'Ses dosyasi cozumlenemedi' });
    }
    isRecording = false;
    activeVocalId = null;
  };

  mediaRecorder.start(100);
  isRecording = true;
  emit({ type: 'started', vocalId });
  return true;
}

export function stopRecording() {
  if (!mediaRecorder || !isRecording) return;
  mediaRecorder.stop();
}

export function isCurrentlyRecording() {
  return isRecording;
}

export function getCurrentVocalId() {
  return activeVocalId;
}

export function getCurrentDuration() {
  if (!isRecording) return 0;
  return (performance.now() - recordStartTime) / 1000;
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(base64, type = 'audio/webm') {
  const bin = atob(base64);
  const len = bin.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type });
}

import './styles/main.css';
import {
  startAudio, initMasterChain, setBpm, getBpm, play, pause, stop,
  getTransportState, getPosition, startRecording, stopRecording, isRecording,
  setMasterVolumeDb
} from './audio/engine.js';
import { initInstruments } from './audio/instruments.js';
import { initMasterFx } from './audio/effects.js';
import {
  getPattern, setPattern, setBars, startSequencer, stopSequencer,
  clearPattern, randomize, ensureTrack, totalSteps, resetStepCounter
} from './audio/sequencer.js';
import { PRESETS, applyPreset } from './audio/presets.js';
import {
  saveProject, loadProject, saveSettings, loadSettings,
  exportProjectFile, importProjectFile, exportAudioBlob
} from './audio/storage.js';
import { buildSequencerUI, highlightPlayingStep, clearPlayingHighlight, refreshActiveCells } from './ui/grid.js';
import { buildMixerUI, startMeters, stopMeters } from './ui/mixer.js';
import { buildEffectsUI } from './ui/effects-ui.js';
import { buildSynthUI } from './ui/synth.js';
import { buildPresetList, toast } from './ui/presets-ui.js';

const state = {
  ready: false,
  projectName: 'Yeni Proje',
  bars: 1,
  bpm: 174,
  playing: false,
  recording: false
};

const els = {};

function $(id) { return document.getElementById(id); }

function bindElements() {
  els.splash = $('splash');
  els.app = $('app');
  els.projectName = $('project-name');
  els.btnPlay = $('btn-play');
  els.btnStop = $('btn-stop');
  els.btnRec = $('btn-rec');
  els.btnPresets = $('btn-presets');
  els.btnSave = $('btn-save');
  els.btnExport = $('btn-export');
  els.btnMenu = $('btn-menu');
  els.btnClear = $('btn-clear');
  els.btnRandomize = $('btn-randomize');
  els.bpmInput = $('bpm-input');
  els.bpmUp = $('bpm-up');
  els.bpmDown = $('bpm-down');
  els.position = $('position-display');
  els.sequencer = $('sequencer');
  els.mixerPanel = $('mixer-panel');
  els.effectsPanel = $('effects-panel');
  els.synthPanel = $('synth-panel');
  els.presetsList = $('presets-list');
  els.modalPresets = $('modal-presets');
  els.modalMenu = $('modal-menu');
  els.navPlay = $('nav-play');
  els.toastHost = $('toast-host');
}

async function ensureAudioStarted() {
  if (state.ready) return true;
  const ok = await startAudio();
  if (!ok) {
    toast('Ses motoru baslatilamadi. Sayfayi yenileyin.', 'error');
    return false;
  }
  initMasterChain();
  initInstruments();
  initMasterFx();
  state.ready = true;
  setBpm(state.bpm);
  return true;
}

function bootstrapInitialPattern() {
  setPattern({ bars: state.bars, steps: 16, tracks: {} });
  ['kick', 'snare', 'clap', 'hat', 'ohat', 'crash', 'sub', 'wobble', 'bass', 'lead'].forEach(ensureTrack);
}

function rebuildAllUI() {
  buildSequencerUI(els.sequencer, () => {});
  buildMixerUI(els.mixerPanel);
  buildEffectsUI(els.effectsPanel);
  buildSynthUI(els.synthPanel);
  buildPresetList(els.presetsList, handlePresetSelect);
}

function handlePresetSelect(preset) {
  state.bpm = preset.bpm;
  els.bpmInput.value = String(preset.bpm);
  if (state.ready) setBpm(preset.bpm);
  state.bars = preset.bars || 1;
  document.querySelectorAll('.seg-btn[data-bars]').forEach((b) => {
    b.classList.toggle('active', parseInt(b.dataset.bars, 10) === state.bars);
  });
  setBars(state.bars);
  const newPattern = applyPreset(preset, getPattern(), totalSteps());
  setPattern(newPattern);
  refreshActiveCells();
  buildSequencerUI(els.sequencer);
  closeModal(els.modalPresets);
  toast(`Yuklendi: ${preset.name}`, 'success');
  state.projectName = preset.name;
  els.projectName.textContent = preset.name;
}

function togglePlay() {
  if (!state.ready) {
    ensureAudioStarted().then(() => togglePlay());
    return;
  }
  const transportState = getTransportState();
  if (transportState === 'started') {
    pause();
    state.playing = false;
    els.btnPlay.classList.remove('playing');
    els.navPlay?.classList.remove('playing');
    clearPlayingHighlight();
  } else {
    startSequencer((stepIdx) => highlightPlayingStep(stepIdx));
    play();
    state.playing = true;
    els.btnPlay.classList.add('playing');
    els.navPlay?.classList.add('playing');
  }
}

function handleStop() {
  stop();
  stopSequencer();
  resetStepCounter();
  state.playing = false;
  els.btnPlay.classList.remove('playing');
  els.navPlay?.classList.remove('playing');
  clearPlayingHighlight();
  els.position.textContent = '1.1.1';
}

async function handleRecord() {
  await ensureAudioStarted();
  if (isRecording()) {
    const blob = await stopRecording();
    state.recording = false;
    els.btnRec.classList.remove('recording');
    if (blob) {
      const filename = `${state.projectName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.wav`;
      await exportAudioBlob(blob, filename);
      toast('Kayit kaydedildi: ' + filename, 'success');
    }
  } else {
    const ok = await startRecording();
    if (ok) {
      state.recording = true;
      els.btnRec.classList.add('recording');
      toast('Kayit basladi', 'warn');
      if (getTransportState() !== 'started') togglePlay();
    }
  }
}

function changeBpm(delta) {
  const newBpm = Math.max(40, Math.min(240, state.bpm + delta));
  state.bpm = newBpm;
  els.bpmInput.value = String(newBpm);
  if (state.ready) setBpm(newBpm);
}

function openModal(modal) { modal.classList.add('open'); }
function closeModal(modal) { modal.classList.remove('open'); }

function bindEvents() {
  els.btnPlay.addEventListener('click', togglePlay);
  els.btnStop.addEventListener('click', handleStop);
  els.btnRec.addEventListener('click', handleRecord);
  els.navPlay?.addEventListener('click', togglePlay);

  els.bpmUp.addEventListener('click', () => changeBpm(+1));
  els.bpmDown.addEventListener('click', () => changeBpm(-1));
  els.bpmInput.addEventListener('change', (e) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) {
      state.bpm = Math.max(40, Math.min(240, v));
      els.bpmInput.value = String(state.bpm);
      if (state.ready) setBpm(state.bpm);
    }
  });

  els.btnPresets.addEventListener('click', () => openModal(els.modalPresets));
  els.btnMenu.addEventListener('click', () => openModal(els.modalMenu));
  els.btnSave.addEventListener('click', () => doSave());
  els.btnExport.addEventListener('click', () => doExport());

  document.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.modal.open').forEach((m) => m.classList.remove('open'));
    });
  });

  els.btnClear.addEventListener('click', () => {
    clearPattern();
    refreshActiveCells();
    toast('Pattern temizlendi', 'info');
  });

  els.btnRandomize.addEventListener('click', () => {
    randomize();
    refreshActiveCells();
    toast('Rastgele pattern olusturuldu', 'info');
  });

  document.querySelectorAll('.seg-btn[data-bars]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bars = parseInt(btn.dataset.bars, 10);
      document.querySelectorAll('.seg-btn[data-bars]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.bars = bars;
      setBars(bars);
      buildSequencerUI(els.sequencer);
    });
  });

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      document.querySelector(`.tab-panel[data-panel="${target}"]`)?.classList.add('active');
    });
  });

  document.querySelectorAll('.nav-btn[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      document.querySelectorAll('.nav-btn[data-view]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (view === 'grid') {
        document.querySelector('.sequencer-panel').scrollIntoView({ behavior: 'smooth' });
      } else if (view === 'mixer') {
        document.querySelector('.tab[data-tab="mixer"]').click();
        document.querySelector('.tabs-panel').scrollIntoView({ behavior: 'smooth' });
      } else if (view === 'fx') {
        document.querySelector('.tab[data-tab="effects"]').click();
        document.querySelector('.tabs-panel').scrollIntoView({ behavior: 'smooth' });
      } else if (view === 'lib') {
        openModal(els.modalPresets);
      }
    });
  });

  $('menu-new')?.addEventListener('click', () => { newProject(); closeModal(els.modalMenu); });
  $('menu-open')?.addEventListener('click', () => { doOpen(); closeModal(els.modalMenu); });
  $('menu-save')?.addEventListener('click', () => { doSave(); closeModal(els.modalMenu); });
  $('menu-export')?.addEventListener('click', () => { doExport(); closeModal(els.modalMenu); });
  $('menu-about')?.addEventListener('click', () => {
    closeModal(els.modalMenu);
    toast('BeatForge v0.1 - © 2026 BeatForge Studio', 'info');
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.code === 'Escape') { handleStop(); document.querySelectorAll('.modal.open').forEach((m) => m.classList.remove('open')); }
    else if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) { handleRecord(); }
    else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') { e.preventDefault(); doSave(); }
    else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyO') { e.preventDefault(); doOpen(); }
    else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyN') { e.preventDefault(); newProject(); }
    else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyE') { e.preventDefault(); doExport(); }
  });

  if (window.beatforge?.onMenu) {
    window.beatforge.onMenu('app:new-project', () => newProject());
    window.beatforge.onMenu('app:save-project', () => doSave());
    window.beatforge.onMenu('app:export-wav', () => doExport());
    window.beatforge.onMenu('app:open-project', (data) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        loadProjectData(parsed);
      } catch (err) {
        toast('Proje yuklenemedi', 'error');
      }
    });
  }
}

function newProject() {
  handleStop();
  state.projectName = 'Yeni Proje';
  els.projectName.textContent = state.projectName;
  state.bars = 1;
  document.querySelectorAll('.seg-btn[data-bars]').forEach((b) => {
    b.classList.toggle('active', b.dataset.bars === '1');
  });
  bootstrapInitialPattern();
  buildSequencerUI(els.sequencer);
  toast('Yeni proje olusturuldu', 'info');
}

async function doSave() {
  const name = prompt('Proje adi:', state.projectName) || state.projectName;
  state.projectName = name;
  els.projectName.textContent = name;
  const proj = {
    bpm: state.bpm,
    bars: state.bars,
    pattern: getPattern()
  };

  if (window.beatforge?.isDesktop && window.beatforge.saveProject) {
    const res = await window.beatforge.saveProject(JSON.stringify({ name, project: proj }, null, 2));
    if (res?.ok) toast('Proje kaydedildi', 'success');
  } else {
    saveProject(name, proj);
    exportProjectFile(name, proj);
    toast('Proje kaydedildi (dosya indirildi)', 'success');
  }
}

async function doOpen() {
  const data = await importProjectFile();
  if (!data) return;
  loadProjectData(data);
}

function loadProjectData(data) {
  const name = data.name || 'Acilan Proje';
  const proj = data.project || data;
  state.projectName = name;
  els.projectName.textContent = name;
  if (proj.bpm) {
    state.bpm = proj.bpm;
    els.bpmInput.value = String(state.bpm);
    if (state.ready) setBpm(state.bpm);
  }
  if (proj.bars) {
    state.bars = proj.bars;
    document.querySelectorAll('.seg-btn[data-bars]').forEach((b) => {
      b.classList.toggle('active', parseInt(b.dataset.bars, 10) === state.bars);
    });
  }
  if (proj.pattern) setPattern(proj.pattern);
  buildSequencerUI(els.sequencer);
  toast(`Yuklendi: ${name}`, 'success');
}

async function doExport() {
  await ensureAudioStarted();
  toast('Disa aktarim icin Rec dugmesine basin, oynatin, sonra tekrar Rec.', 'info');
  if (!isRecording()) handleRecord();
}

function updatePositionLoop() {
  if (state.ready && getTransportState() === 'started') {
    const p = getPosition();
    els.position.textContent = `${p.bar}.${p.beat}.${p.sixteenth}`;
  }
  requestAnimationFrame(updatePositionLoop);
}

function tryRestoreLastSession() {
  const saved = loadProject();
  if (saved?.project) {
    try {
      loadProjectData(saved);
    } catch (err) {
      console.warn('Restore failed', err);
    }
  }
}

async function init() {
  bindElements();
  bootstrapInitialPattern();
  rebuildAllUI();
  bindEvents();
  tryRestoreLastSession();
  startMeters();
  updatePositionLoop();

  setTimeout(() => {
    els.splash?.remove();
    els.app?.classList.remove('hidden');
  }, 1600);

  const settings = loadSettings();
  if (settings?.bpm) {
    state.bpm = settings.bpm;
    els.bpmInput.value = String(state.bpm);
  }

  const onFirstInteract = async () => {
    await ensureAudioStarted();
    document.removeEventListener('pointerdown', onFirstInteract);
    document.removeEventListener('keydown', onFirstInteract);
  };
  document.addEventListener('pointerdown', onFirstInteract);
  document.addEventListener('keydown', onFirstInteract);

  window.addEventListener('beforeunload', () => {
    saveSettings({ bpm: state.bpm });
    if (state.projectName !== 'Yeni Proje') {
      saveProject(state.projectName, {
        bpm: state.bpm, bars: state.bars, pattern: getPattern()
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

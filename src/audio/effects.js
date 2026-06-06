import * as Tone from 'tone';
import { getMasterInput } from './engine.js';

const FX_DEFS = [
  { id: 'reverb',     name: 'Reverb',     defaults: { decay: 2.5, wet: 0.3 } },
  { id: 'delay',      name: 'Delay',      defaults: { delayTime: '8n', feedback: 0.4, wet: 0.25 } },
  { id: 'distortion', name: 'Distortion', defaults: { distortion: 0.3, wet: 0.5 } },
  { id: 'filter',     name: 'Filter',     defaults: { frequency: 1200, Q: 1, type: 'lowpass' } },
  { id: 'phaser',     name: 'Phaser',     defaults: { frequency: 0.5, octaves: 3, baseFrequency: 350, wet: 0.5 } },
  { id: 'compressor', name: 'Compressor', defaults: { threshold: -18, ratio: 4, attack: 0.005, release: 0.1 } }
];

let masterFx = null;

export function getFxDefinitions() {
  return FX_DEFS;
}

export function initMasterFx() {
  if (masterFx) return masterFx;
  masterFx = {
    reverb:     new Tone.Reverb({ decay: 2.5, wet: 0 }),
    delay:      new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.4, wet: 0 }),
    distortion: new Tone.Distortion({ distortion: 0.3, wet: 0 }),
    filter:     new Tone.Filter({ frequency: 20000, Q: 1, type: 'lowpass' }),
    phaser:     new Tone.Phaser({ frequency: 0.5, octaves: 3, baseFrequency: 350, wet: 0 }),
    compressor: new Tone.Compressor({ threshold: -18, ratio: 4, attack: 0.005, release: 0.1 })
  };

  masterFx.enabled = {
    reverb: false, delay: false, distortion: false,
    filter: false, phaser: false, compressor: false
  };

  masterFx.reverb.generate?.();

  const master = getMasterInput();
  master.disconnect();
  master.chain(
    masterFx.distortion,
    masterFx.filter,
    masterFx.phaser,
    masterFx.delay,
    masterFx.reverb,
    masterFx.compressor,
    Tone.getDestination()
  );

  return masterFx;
}

export function setFxEnabled(id, enabled) {
  if (!masterFx || !masterFx[id]) return;
  masterFx.enabled[id] = enabled;
  if (id === 'filter') {
    masterFx.filter.frequency.rampTo(enabled ? 1200 : 20000, 0.1);
  } else if (id === 'compressor') {
    masterFx.compressor.threshold.value = enabled ? -18 : 0;
  } else if (typeof masterFx[id].wet?.rampTo === 'function') {
    const target = enabled ? (id === 'reverb' ? 0.3 : id === 'delay' ? 0.25 : 0.5) : 0;
    masterFx[id].wet.rampTo(target, 0.1);
  }
}

export function setFxParam(id, param, value) {
  if (!masterFx || !masterFx[id]) return;
  const node = masterFx[id];
  if (param === 'wet' && node.wet) node.wet.rampTo(value, 0.05);
  else if (param === 'frequency' && node.frequency) node.frequency.rampTo(value, 0.05);
  else if (param === 'feedback' && node.feedback) node.feedback.rampTo(value, 0.05);
  else if (param === 'delayTime' && node.delayTime) node.delayTime.value = value;
  else if (param === 'decay' && 'decay' in node) node.decay = value;
  else if (param === 'distortion' && 'distortion' in node) node.distortion = value;
  else if (param === 'Q' && node.Q) node.Q.rampTo(value, 0.05);
  else if (param === 'threshold' && node.threshold) node.threshold.value = value;
  else if (param === 'ratio' && node.ratio) node.ratio.value = value;
}

export function getMasterFx() {
  return masterFx;
}

#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const off = { on: false, vel: 0.85, note: null };
const on = (vel = 0.85, note = null) => ({ on: true, vel, note });
const arr = (n, fill) => new Array(n).fill(null).map(() => fill);
const pat = (n, fill) => arr(n, fill);
const extend = (track, len) => {
  while (track.length < len) track.push(off);
  return track.slice(0, len);
};

const TOTAL = 64;

const kick = [];
for (let i = 0; i < TOTAL; i++) kick.push(off);
[kick[0], kick[6], kick[16], kick[22], kick[32], kick[38], kick[48], kick[54], kick[60]] = [on(0.95), on(0.80), on(0.95), on(0.80), on(0.95), on(0.80), on(0.95), on(0.80), on(0.95)];

const snare = [];
for (let i = 0; i < TOTAL; i++) snare.push(off);
[snare[4], snare[12], snare[20], snare[28], snare[36], snare[44], snare[52], snare[60]] = [on(0.95), on(0.90), on(0.95), on(0.90), on(0.95), on(0.90), on(0.95), on(0.95)];

const clap = [];
for (let i = 0; i < TOTAL; i++) clap.push(off);
[clap[4], clap[20], clap[36], clap[52], clap[60]] = [on(0.90), on(0.90), on(0.90), on(0.90), on(0.90)];

const hat = [];
for (let i = 0; i < TOTAL; i++) hat.push(off);
for (let i = 0; i < TOTAL; i++) {
  if (i % 4 === 1) hat[i] = on(0.50);
  if (i % 4 === 3) hat[i] = on(0.40);
}

const ohat = [];
for (let i = 0; i < TOTAL; i++) ohat.push(off);
for (let i = 0; i < TOTAL; i++) {
  if (i % 16 === 7 || i % 16 === 15) ohat[i] = on(0.60);
}

const sub = [];
for (let i = 0; i < TOTAL; i++) sub.push(off);
[sub[0], sub[16], sub[32]] = [on(0.95, 'C1'), on(0.95, 'C1'), on(0.95, 'C1')];
[sub[42], sub[48], sub[60]] = [on(0.85, 'A1'), on(0.95, 'A1'), on(0.85, 'C1')];

const bass = [];
for (let i = 0; i < TOTAL; i++) bass.push(off);
[bass[16], bass[32], bass[40], bass[48], bass[56], bass[60]] = [
  on(0.85, 'A1'), on(0.85, 'G1'), on(0.80, 'F1'), on(0.85, 'A1'), on(0.90, 'C2'), on(0.90, 'C2')
];

const lead = [];
for (let i = 0; i < TOTAL; i++) lead.push(off);
[lead[32], lead[40], lead[48], lead[56]] = [on(0.70, 'E5'), on(0.75, 'G5'), on(0.80, 'A5'), on(0.85, 'C6')];

const track = (id, name, color, icon, steps) => ({ id, name, color, icon, steps: extend(steps, TOTAL) });

const tracks = {
  kick: track('kick', 'Kick', '#ff0066', 'K', kick),
  snare: track('snare', 'Snare', '#ff6600', 'S', snare),
  clap: track('clap', 'Clap', '#00ff88', 'C', clap),
  hat: track('hat', 'Hat', '#ffcc00', 'H', hat),
  ohat: track('ohat', 'Open Hat', '#ffaa00', 'O', ohat),
  sub: track('sub', 'Sub', '#aa44ff', 'U', sub),
  bass: track('bass', 'Bass', '#b400ff', 'B', bass),
  lead: track('lead', 'Lead', '#00ffaa', 'L', lead)
};

const project = {
  version: 1,
  name: 'Neon Pulse (Demo DnB)',
  savedAt: '2026-06-07T03:30:00.000Z',
  project: {
    bpm: 174,
    bars: 4,
    pattern: {
      bars: 4,
      steps: 16,
      tracks
    }
  }
};

const outDir = join(root, 'projects');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'neon-pulse-demo.bfp');
writeFileSync(outPath, JSON.stringify(project, null, 2), 'utf8');
console.log(`OK: ${outPath}`);

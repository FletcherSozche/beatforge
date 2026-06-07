#!/usr/bin/env node
/**
 * Track artwork generator
 * Procedurally generates sci-fi themed cover art SVGs for tracks.
 * Usage:
 *   node scripts/generate-track-art.js [name] [bpm] [genre] [out-file]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const args = process.argv.slice(2);
const name = args[0] || 'Neon Pulse';
const bpm = args[1] || '174';
const genre = args[2] || 'DnB';
const outFile = args[3] || join(root, 'store-assets', 'track-art', `${name.toLowerCase().replace(/\s+/g, '-')}.svg`);

const palettes = {
  dnb: ['#00f0ff', '#b400ff', '#ff00d4'],
  neuro: ['#7c5cff', '#00d4ff', '#22c55e'],
  dubstep: ['#fb923c', '#ef4444', '#ff0066'],
  riddim: ['#a78bfa', '#fb923c', '#ef4444'],
  trap: ['#facc15', '#ef4444', '#000000'],
  house: ['#22c55e', '#00d4ff', '#7c5cff'],
  techno: ['#4dabf7', '#7c5cff', '#00ff88'],
  hiphop: ['#ff9d3a', '#a78bfa', '#7c5cff']
};

const colors = palettes[genre.toLowerCase()] || palettes.dnb;

function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const hexBg = '#02040a';
const shapes = [];
for (let i = 0; i < 6; i++) {
  const cx = rand(80, 920);
  const cy = rand(80, 920);
  const r = rand(40, 220);
  const c = pick(colors);
  const op = rand(0.1, 0.4).toFixed(2);
  shapes.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${c}" opacity="${op}"/>`);
}

for (let i = 0; i < 12; i++) {
  const x1 = rand(0, 1000);
  const y1 = rand(0, 1000);
  const x2 = x1 + rand(-300, 300);
  const y2 = y1 + rand(-300, 300);
  const c = pick(colors);
  const w = rand(0.5, 3).toFixed(1);
  const op = rand(0.2, 0.7).toFixed(2);
  shapes.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="${w}" opacity="${op}"/>`);
}

const barsCount = parseInt(bpm, 10) > 150 ? 32 : 16;
const barW = 800 / barsCount;
for (let i = 0; i < barsCount; i++) {
  if (Math.random() > 0.55) {
    const h = rand(20, 100);
    const x = 100 + i * barW + 2;
    const y = 700 - h;
    const c = pick(colors);
    shapes.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(barW - 4).toFixed(1)}" height="${h.toFixed(1)}" fill="${c}" opacity="0.9"/>`);
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#02040a"/>
      <stop offset="50%" stop-color="#0a1024"/>
      <stop offset="100%" stop-color="#10183a"/>
    </linearGradient>
    <linearGradient id="text" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="50%" stop-color="${colors[1]}"/>
      <stop offset="100%" stop-color="${colors[2]}"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
    <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${colors[0]}" stroke-width="0.4" opacity="0.18"/>
    </pattern>
  </defs>

  <rect width="1000" height="1000" fill="url(#bg)"/>
  <rect width="1000" height="1000" fill="url(#grid)"/>

  <g filter="url(#glow)" opacity="0.85">${shapes.join('\n  ')}</g>

  <g transform="translate(100, 760)">
    <text font-family="'Orbitron', monospace" font-size="62" font-weight="900" fill="url(#text)" filter="url(#glow)">${name.toUpperCase()}</text>
  </g>
  <g transform="translate(100, 830)">
    <text font-family="'Share Tech Mono', monospace" font-size="28" font-weight="600" fill="${colors[0]}" letter-spacing="6">${genre.toUpperCase()} · ${bpm} BPM</text>
  </g>
  <g transform="translate(100, 880)">
    <text font-family="'Share Tech Mono', monospace" font-size="20" font-weight="500" fill="${colors[1]}" letter-spacing="4" opacity="0.7">BEATFORGE</text>
  </g>
</svg>
`;

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, svg, 'utf8');
console.log(`OK: ${outFile}`);

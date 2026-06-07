export const PRESETS = [
  {
    id: 'dnb-classic',
    name: 'Drum n Bass - Classic',
    desc: 'Klasik amen break temasi, 174 BPM',
    bpm: 174,
    color: 'linear-gradient(135deg,#ff4d6d,#7c5cff)',
    icon: 'D',
    bars: 1,
    pattern: {
      kick:   [1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0],
      snare:  [0,0,0,0, 1,0,0,0, 0,0,0,1, 0,0,0,0],
      clap:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0],
      hat:    [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
      ohat:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
      sub:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      bass:   [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0]
    },
    notes: { sub: 'C1', bass: 'A1' }
  },
  {
    id: 'dnb-neuro',
    name: 'Neurofunk DnB',
    desc: 'Sert reese bass + tight drums, 172 BPM',
    bpm: 172,
    color: 'linear-gradient(135deg,#7c5cff,#00d4ff)',
    icon: 'N',
    bars: 1,
    pattern: {
      kick:   [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
      snare:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hat:    [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
      ohat:   [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1],
      sub:    [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
      bass:   [1,1,0,1, 0,1,1,0, 1,0,1,1, 0,1,0,1]
    },
    notes: { sub: 'C1', bass: 'A1' }
  },
  {
    id: 'dubstep-classic',
    name: 'Dubstep - 140',
    desc: 'Half-time vibe, wobble bass on drop, 140 BPM',
    bpm: 140,
    color: 'linear-gradient(135deg,#fb923c,#ef4444)',
    icon: 'W',
    bars: 1,
    pattern: {
      kick:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      snare:  [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      clap:   [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      hat:    [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
      ohat:   [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1],
      wobble: [1,0,0,1, 1,0,1,0, 1,0,0,1, 1,0,1,0],
      sub:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]
    },
    notes: { wobble: 'C2', sub: 'C1' }
  },
  {
    id: 'dubstep-riddim',
    name: 'Riddim Dubstep',
    desc: 'Triplet wobble, agresif, 140 BPM',
    bpm: 140,
    color: 'linear-gradient(135deg,#a78bfa,#fb923c)',
    icon: 'R',
    bars: 1,
    pattern: {
      kick:   [1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0],
      snare:  [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      hat:    [1,0,1,1, 0,1,1,0, 1,1,0,1, 1,0,1,1],
      wobble: [1,1,0,1, 1,0,1,1, 1,0,1,1, 0,1,1,0],
      sub:    [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0]
    },
    notes: { wobble: 'F2', sub: 'F1' }
  },
  {
    id: 'trap',
    name: 'Trap',
    desc: 'Tipik trap groove, 808s + hi-hat rolls, 140 BPM',
    bpm: 140,
    color: 'linear-gradient(135deg,#facc15,#ef4444)',
    icon: 'T',
    bars: 1,
    pattern: {
      kick:   [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0],
      snare:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      clap:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hat:    [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
      sub:    [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0]
    },
    notes: { sub: 'C1' }
  },
  {
    id: 'house',
    name: 'House - Four on the Floor',
    desc: 'Klasik 4/4 house beat, 124 BPM',
    bpm: 124,
    color: 'linear-gradient(135deg,#22c55e,#00d4ff)',
    icon: 'H',
    bars: 1,
    pattern: {
      kick:   [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      clap:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hat:    [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
      ohat:   [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
      bass:   [1,0,1,0, 0,0,1,0, 1,0,1,0, 0,0,1,0]
    },
    notes: { bass: 'A1' }
  },
  {
    id: 'techno',
    name: 'Techno',
    desc: 'Driving techno, 128 BPM',
    bpm: 128,
    color: 'linear-gradient(135deg,#4dabf7,#7c5cff)',
    icon: 'X',
    bars: 1,
    pattern: {
      kick:   [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      clap:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hat:    [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
      ohat:   [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
      sub:    [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0]
    },
    notes: { sub: 'C1' }
  },
  {
    id: 'hiphop',
    name: 'Hip-Hop Boom Bap',
    desc: 'Klasik hip-hop break, 90 BPM',
    bpm: 90,
    color: 'linear-gradient(135deg,#ff9d3a,#a78bfa)',
    icon: 'B',
    bars: 1,
    pattern: {
      kick:   [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0],
      snare:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hat:    [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      sub:    [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0]
    },
    notes: { sub: 'F1' }
  },
  {
    id: 'progressive',
    name: 'Progressive',
    desc: 'Kademeli yukselen katmanlar, 128 BPM',
    bpm: 128,
    color: 'linear-gradient(135deg,#22d3ee,#3b82f6)',
    icon: 'P',
    bars: 2,
    pattern: {
      kick:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      clap:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hat:    [0,1,1,1, 0,1,1,1, 0,1,1,1, 0,1,1,1, 0,1,1,1, 0,1,1,1, 0,1,1,1, 0,1,1,1],
      ohat:   [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1],
      sub:    [1,0,0,0, 0,1,0,0, 1,0,0,0, 0,1,0,0, 1,0,0,0, 0,1,0,0, 1,0,0,0, 0,1,0,0],
      bass:   [0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0],
      pad:    [1,1,1,1, 1,1,1,1, 0,0,0,0, 0,0,0,0, 1,1,1,1, 1,1,1,1, 0,0,0,0, 0,0,0,0],
      arp:    [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]
    },
    notes: { sub: 'C1', bass: 'C2', pad: 'C3', arp: 'A3' }
  },
  {
    id: 'goa',
    name: 'Goa Trance',
    desc: 'Psikedelik bas hatlari, 145 BPM',
    bpm: 145,
    color: 'linear-gradient(135deg,#c084fc,#ec4899)',
    icon: 'G', 
    bars: 2,
    pattern: {
      kick:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      snare:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      clap:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hat:    [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
      ohat:   [0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0],
      sub:    [1,0,0,1, 0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,1, 0,0,0,0],
      bass:   [1,1,0,0, 1,1,0,0, 1,1,0,1, 0,0,1,1, 1,1,0,0, 1,1,0,0, 1,1,0,1, 0,0,1,1],
      lead:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0]
    },
    notes: { sub: 'C1', bass: 'E1', lead: 'D3' }
  },
  {
    id: 'empty',
    name: 'Bos Sablon',
    desc: 'Sifirdan baslamak icin tum kanallar bos',
    bpm: 120,
    color: 'linear-gradient(135deg,#5d6585,#8b94b3)',
    icon: '+',
    bars: 1,
    pattern: {},
    notes: {}
  }
];

export function getPresetById(id) {
  return PRESETS.find((p) => p.id === id);
}

export function applyPreset(preset, pattern, totalLen) {
  const out = JSON.parse(JSON.stringify(pattern));
  Object.keys(out.tracks).forEach((tid) => {
    out.tracks[tid].steps.forEach((s) => { s.on = false; });
  });

  Object.entries(preset.pattern).forEach(([trackId, steps]) => {
    if (!out.tracks[trackId]) {
      out.tracks[trackId] = { steps: new Array(totalLen).fill(null).map(() => ({ on: false, vel: 0.85, note: null })) };
    }
    steps.forEach((v, i) => {
      if (i >= totalLen) return;
      if (!out.tracks[trackId].steps[i]) {
        out.tracks[trackId].steps[i] = { on: false, vel: 0.85, note: null };
      }
      out.tracks[trackId].steps[i].on = v === 1;
      if (preset.notes && preset.notes[trackId]) {
        out.tracks[trackId].steps[i].note = preset.notes[trackId];
      }
    });
  });

  return out;
}

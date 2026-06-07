const _ = (steps) => steps;

export const PATTERN_TEMPLATES = [
  {
    id: 'amen-break',
    name: 'Amen Break',
    desc: 'Efsanevi 90s jungle/dnb break',
    bpm: 174,
    color: 'linear-gradient(135deg,#ff4d6d,#7c5cff)',
    icon: 'A',
    pattern: {
      kick:   _(1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0),
      snare:  _(0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0),
      hat:    _(0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0),
      ohat:   _(0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0)
    }
  },
  {
    id: 'think-break',
    name: 'Think Break',
    desc: 'Lyn Collins - Think (breakbeat klasiği)',
    bpm: 110,
    color: 'linear-gradient(135deg,#ff9d3a,#a78bfa)',
    icon: 'T',
    pattern: {
      kick:   _(1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0),
      snare:  _(0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0),
      hat:    _(0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0)
    }
  },
  {
    id: 'four-on-floor',
    name: 'Four on the Floor',
    desc: 'Klasik 4/4 dance/techno',
    bpm: 124,
    color: 'linear-gradient(135deg,#22c55e,#00d4ff)',
    icon: '4',
    pattern: {
      kick:   _(1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0),
      clap:   _(0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0),
      hat:    _(0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0),
      ohat:   _(0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0)
    }
  },
  {
    id: 'breakcore',
    name: 'Breakcore Chaos',
    desc: 'Hızlı, kaotik breakcore',
    bpm: 200,
    color: 'linear-gradient(135deg,#ef4444,#fb923c)',
    icon: 'X',
    pattern: {
      kick:   _(1,0,1,0, 0,1,0,1, 1,0,0,1, 0,1,0,0),
      snare:  _(0,1,0,0, 1,0,1,0, 0,0,1,0, 0,1,0,0),
      hat:    _(1,1,0,1, 1,0,1,1, 0,1,1,0, 1,1,0,1),
      crash:  _(1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0)
    }
  },
  {
    id: 'trap-rolls',
    name: 'Trap Hi-Hat Rolls',
    desc: 'Tipik trap 808 + hat roll',
    bpm: 140,
    color: 'linear-gradient(135deg,#facc15,#ef4444)',
    icon: 'T',
    pattern: {
      kick:   _(1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0),
      snare:  _(0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0),
      clap:   _(0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0),
      hat:    _(1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1),
      ohat:   _(0,0,0,0, 0,0,1,0, 0,0,0,0, 0,1,1,1)
    }
  },
  {
    id: 'liquid-funk',
    name: 'Liquid Funk',
    desc: 'Sıcak, melodik DnB',
    bpm: 174,
    color: 'linear-gradient(135deg,#7c5cff,#22c55e)',
    icon: 'L',
    pattern: {
      kick:   _(1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0),
      snare:  _(0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0),
      hat:    _(0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0),
      sub:    _(1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0),
      pad:    _(1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0)
    }
  },
  {
    id: 'halftime-dubstep',
    name: 'Halftime Dubstep',
    desc: 'Yavaş ama ağır',
    bpm: 140,
    color: 'linear-gradient(135deg,#fb923c,#ef4444)',
    icon: 'H',
    pattern: {
      kick:   _(1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0),
      snare:  _(0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0),
      clap:   _(0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0),
      hat:    _(0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0),
      wobble: _(1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0)
    }
  },
  {
    id: 'gabber',
    name: 'Gabber Kick',
    desc: 'Hızlı ve agresif',
    bpm: 180,
    color: 'linear-gradient(135deg,#ef4444,#000000)',
    icon: 'G',
    pattern: {
      kick:   _(1,0,0,0, 1,0,1,0, 1,0,0,0, 1,0,1,0),
      clap:   _(0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0),
      hat:    _(0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1)
    }
  },
  {
    id: 'lofi-chill',
    name: 'Lo-Fi Chill',
    desc: 'Sakin hip-hop groove',
    bpm: 80,
    color: 'linear-gradient(135deg,#ff9d3a,#a78bfa)',
    icon: 'L',
    pattern: {
      kick:   _(1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0),
      snare:  _(0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0),
      hat:    _(1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0)
    }
  },
  {
    id: 'drumstep',
    name: 'Drumstep',
    desc: 'Half-time DnB (170+ BPM)',
    bpm: 174,
    color: 'linear-gradient(135deg,#7c5cff,#00d4ff)',
    icon: 'D',
    pattern: {
      kick:   _(1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0),
      snare:  _(0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0),
      hat:    _(0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0),
      ohat:   _(0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1),
      lead:   _(1,0,0,1, 0,1,0,0, 1,0,0,1, 0,1,0,0)
    }
  },
  {
    id: 'industrial',
    name: 'Industrial',
    desc: 'Mekanik, sert',
    bpm: 130,
    color: 'linear-gradient(135deg,#4dabf7,#7c5cff)',
    icon: 'I',
    pattern: {
      kick:   _(1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0),
      snare:  _(0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0),
      hat:    _(1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0),
      fx:     _(0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0)
    }
  },
  {
    id: 'footwork',
    name: 'Footwork/Juke',
    desc: 'Chicago footwork juke',
    bpm: 160,
    color: 'linear-gradient(135deg,#fb923c,#7c5cff)',
    icon: 'F',
    pattern: {
      kick:   _(1,0,0,1, 0,1,0,0, 1,0,0,1, 0,1,0,0),
      clap:   _(0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0),
      hat:    _(1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1),
      ohat:   _(0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1)
    }
  }
];

export function getTemplateById(id) {
  return PATTERN_TEMPLATES.find(t => t.id === id);
}

export function applyTemplate(template, pattern) {
  const out = JSON.parse(JSON.stringify(pattern));
  Object.keys(out.tracks).forEach((tid) => {
    out.tracks[tid].steps.forEach((s) => { s.on = false; });
  });
  Object.entries(template.pattern).forEach(([trackId, steps]) => {
    if (!out.tracks[trackId]) return;
    steps.forEach((v, i) => {
      if (i < out.tracks[trackId].steps.length) {
        out.tracks[trackId].steps[i].on = v === 1;
      }
    });
  });
  return { pattern: out, bpm: template.bpm };
}

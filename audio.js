// Klänge (alle synthetisch per WebAudio, keine Dateien) und Piratenstimme (Sprachausgabe des Geräts)

let ctx = null;
let master = null;
let ocean = null;

export function initAudio() {
  // iOS 17+: Ton auch bei aktiviertem Lautlos-Schalter abspielen
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* egal */ }
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.connect(ctx.destination);
    ctx.resume?.();
  } catch { ctx = null; }
}

export function pauseAudio() {
  stopVoice();
  ctx?.suspend?.();
}
export function resumeAudio() { ctx?.resume?.(); }

let noise = null;
function noiseBuffer() {
  if (noise) return noise;
  noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noise;
}

// Schiffsglocke
export function bell(strikes = 2) {
  if (!ctx) return;
  const partials = [[1, 1], [2.02, 0.55], [2.74, 0.35], [4.08, 0.2], [5.4, 0.12]];
  for (let s = 0; s < strikes; s++) {
    const t0 = ctx.currentTime + s * 0.55;
    const g0 = ctx.createGain();
    g0.gain.value = 0.35;
    g0.connect(master);
    for (const [ratio, amp] of partials) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 660 * ratio;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(amp, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.2 / ratio + 0.4);
      o.connect(g).connect(g0);
      o.start(t0);
      o.stop(t0 + 3);
    }
  }
}

// Sonar-Ping, wird mit der Hitze höher
export function ping(heat) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(700 + heat * 700, t);
  o.frequency.exponentialRampToValueAtTime(600 + heat * 600, t + 0.25);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.28, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.4);
}

// Kanonenschuss: dumpfer Knall + Rauschen
export function cannon() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(1800, t);
  lp.frequency.exponentialRampToValueAtTime(90, t + 1.2);
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(1, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
  src.connect(lp).connect(ng).connect(master);
  src.start(t);
  src.stop(t + 1.7);

  const o = ctx.createOscillator();
  const og = ctx.createGain();
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(35, t + 0.6);
  og.gain.setValueAtTime(0.9, t);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
  o.connect(og).connect(master);
  o.start(t);
  o.stop(t + 0.9);
}

// Meeresrauschen mit gelegentlichen Möwen
export function setOcean(on) {
  if (!ctx) return;
  if (on && !ocean) startOcean();
  if (!on && ocean) stopOcean();
}

function startOcean() {
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 500;
  const swell = ctx.createGain();
  swell.gain.value = 0.55;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.11; // eine Welle alle ~9 s
  const lfoAmp = ctx.createGain();
  lfoAmp.gain.value = 0.45;
  const lfoFilt = ctx.createGain();
  lfoFilt.gain.value = 320;
  lfo.connect(lfoAmp).connect(swell.gain);
  lfo.connect(lfoFilt).connect(lp.frequency);
  const out = ctx.createGain();
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(0.14, t + 3);
  src.connect(lp).connect(swell).connect(out).connect(master);
  src.start();
  lfo.start();
  ocean = { src, lfo, out, timer: null };
  const nextGull = () => {
    ocean.timer = setTimeout(() => { if (ocean) { gull(ocean.out); nextGull(); } }, 7000 + Math.random() * 14000);
  };
  nextGull();
}

function stopOcean() {
  const o = ocean;
  ocean = null;
  clearTimeout(o.timer);
  const t = ctx.currentTime;
  o.out.gain.cancelScheduledValues(t);
  o.out.gain.setValueAtTime(o.out.gain.value, t);
  o.out.gain.linearRampToValueAtTime(0, t + 0.8);
  o.src.stop(t + 1);
  o.lfo.stop(t + 1);
}

function gull(dest) {
  const calls = 2 + Math.floor(Math.random() * 3);
  const base = 1200 + Math.random() * 400;
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  if (pan) { pan.pan.value = Math.random() * 1.6 - 0.8; pan.connect(dest); }
  for (let i = 0; i < calls; i++) {
    const t0 = ctx.currentTime + i * (0.28 + Math.random() * 0.1);
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(base, t0);
    o.frequency.linearRampToValueAtTime(base * 1.5, t0 + 0.06);
    o.frequency.exponentialRampToValueAtTime(base * 0.85, t0 + 0.24);
    const vib = ctx.createOscillator();
    vib.frequency.value = 30;
    const vibAmt = ctx.createGain();
    vibAmt.gain.value = 50;
    vib.connect(vibAmt).connect(o.frequency);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = base * 1.2;
    bp.Q.value = 1.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.26);
    o.connect(bp).connect(g).connect(pan || dest);
    o.start(t0); vib.start(t0);
    o.stop(t0 + 0.3); vib.stop(t0 + 0.3);
  }
}

function duckOcean(down) {
  if (!ocean) return;
  const t = ctx.currentTime;
  ocean.out.gain.cancelScheduledValues(t);
  ocean.out.gain.setValueAtTime(ocean.out.gain.value, t);
  ocean.out.gain.linearRampToValueAtTime(down ? 0.03 : 0.14, t + 0.4);
}

/* ---------------------------------------------------------- Piratenstimme (Audio-Schnipsel aus sounds/) */

const clips = new Map();
const tried = new Set();
let voiceSrc = null;

export async function loadClips(names) {
  if (!ctx) return;
  await Promise.all(names.filter((n) => !tried.has(n)).map(async (n) => {
    tried.add(n);
    try {
      const res = await fetch(`sounds/${n}.mp3`);
      if (!res.ok) return;
      clips.set(n, await ctx.decodeAudioData(await res.arrayBuffer()));
    } catch (e) { console.warn('Sprachschnipsel nicht lesbar:', n, e); }
  }));
}

export const clipCount = () => clips.size;

// zufällige Variante: "nah" findet nah, nah-1, nah-2 …
export function pickClip(prefix) {
  const opts = [...clips.keys()].filter((k) => k === prefix || k.startsWith(`${prefix}-`));
  return opts.length ? opts[Math.floor(Math.random() * opts.length)] : null;
}

export function stopVoice() {
  try { voiceSrc?.stop(); } catch { /* schon aus */ }
  voiceSrc = null;
}

function playClip(name) {
  return new Promise((resolve) => {
    const buf = name && clips.get(name);
    if (!ctx || !buf) { resolve(false); return; }
    stopVoice();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(master);
    duckOcean(true);
    src.onended = () => {
      if (voiceSrc === src) { voiceSrc = null; duckOcean(false); }
      resolve(true);
    };
    voiceSrc = src;
    src.start();
  });
}

// spielt die Schnipsel nacheinander; fehlende werden übersprungen
export async function playVoice(names) {
  await loadClips(names.filter(Boolean));
  let played = false;
  for (const n of names) {
    if (await playClip(n)) played = true;
  }
  return played;
}

// Fernrohr-Modus (Station Wasserturm): Rückkamera im Messing-Fernrohr. Das Bild wird scharf,
// wenn man in die gespeicherte Richtung schaut; nach 3,5 s Treffer erscheint das Rätselbild.
import { angleDiff, circularMean, scopeBlur } from './geo.js';

const $ = (s) => document.querySelector(s);
const HIT_DEG = 20;      // Treffer-Korridor ±20°
const HIT_MS = 3500;     // so lange muss man draufhalten
const SMOOTH_MS = 450;   // gleitender Mittelwert über diese Zeitspanne
const CALIB_MS = 3000;   // Countdown beim Einmessen
const CALIB_AVG_MS = 1000; // gemittelt wird die letzte Sekunde davor

const box = $('#scope');
const video = $('#scopeVideo');
const content = $('#scopeContent');
const fog = $('#scopeFog');
const img = $('#scopeImg');
const msg = $('#scopeMsg');
const progress = $('#scopeProgress');
const RING_LEN = 2 * Math.PI * 105; // Umfang des Fortschrittsrings im Messingrand
progress.style.strokeDasharray = `${RING_LEN} ${RING_LEN}`;

let shown = false;
let hideTimer = null;
let stream = null;
let camState = 'idle'; // idle | asking | on | denied | none
let samples = [];      // { t, h }
let onSince = null;
let hit = false;
let calib = null;      // { t0, done }
let lastBlur = -1;
let lastMsg = null;
let lastProgress = -1;

// Nieten rund um den Messingrand
for (let a = 15; a < 360; a += 30) {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', (Math.sin((a * Math.PI) / 180) * 105).toFixed(2));
  c.setAttribute('cy', (-Math.cos((a * Math.PI) / 180) * 105).toFixed(2));
  c.setAttribute('r', '2.2');
  $('#scopeRivets').append(c);
}

export const cameraState = () => camState;
export const scopeOpen = () => shown;
export const calibrating = () => !!calib;

export function setScopeImage(src) { img.src = src; }

/* ---------------------------------------------------------- Kamera */

async function startCamera() {
  if (stream) { stream.getVideoTracks().forEach((t) => { t.enabled = true; }); return; }
  if (camState === 'asking' || camState === 'denied' || camState === 'none') return;
  if (!navigator.mediaDevices?.getUserMedia) { camState = 'none'; return; }
  camState = 'asking';
  try {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    if (!shown) { s.getTracks().forEach((t) => t.stop()); camState = 'idle'; return; }
    stream = s;
    video.srcObject = s;
    await video.play().catch(() => {});
    camState = 'on';
  } catch (e) {
    // verweigert oder keine Kamera: schwarzer Hintergrund, die Suche geht trotzdem
    camState = e?.name === 'NotAllowedError' || e?.name === 'SecurityError' ? 'denied' : 'none';
  }
}

// ganz ausschalten (Ziel gewechselt, App im Hintergrund)
export function stopCamera() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  video.srcObject = null;
  if (camState === 'on') camState = 'idle';
}

/* ---------------------------------------------------------- Haptik */

// iPhone-Safari kennt navigator.vibrate nicht; ab iOS 18 gibt das Umschalten eines
// <input switch> einen kurzen Haptik-Tick. Ohne vorheriges Tippen wirkt das evtl. nicht.
let hapticLabel = null;
function buzz() {
  if (navigator.vibrate?.([120, 60, 120, 60, 240])) return;
  if (!hapticLabel) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.id = 'hapticSwitch';
    hapticLabel = document.createElement('label');
    hapticLabel.htmlFor = input.id;
    hapticLabel.className = 'haptic-trick';
    hapticLabel.append(input);
    document.body.append(hapticLabel);
  }
  hapticLabel.click();
  setTimeout(() => hapticLabel.click(), 180);
}

/* ---------------------------------------------------------- Einblenden */

function show() {
  clearTimeout(hideTimer);
  shown = true;
  box.hidden = false;
  void box.offsetWidth; // damit die Ausfahr-Animation startet
  box.classList.add('open');
  startCamera();
}

function hide() {
  shown = false;
  box.classList.remove('open');
  stream?.getVideoTracks().forEach((t) => { t.enabled = false; });
  hideTimer = setTimeout(() => {
    box.hidden = true;
    resetHit();
  }, 350);
}

function resetHit() {
  hit = false;
  onSince = null;
  box.classList.remove('hit');
}

function setMsg(v) {
  if (v === lastMsg) return;
  lastMsg = v;
  msg.textContent = v;
  msg.hidden = !v;
}

function setBlur(px) {
  if (Math.abs(px - lastBlur) < 0.25) return;
  lastBlur = px;
  video.style.filter = px > 0.1 ? `blur(${px.toFixed(1)}px)` : 'none';
  fog.style.opacity = (px / 14 * 0.85).toFixed(2);
}

// Ring im Messingrand füllt sich, solange man aufs Ziel hält (0 … 1)
function setProgress(p) {
  const v = Math.max(0, Math.min(1, p));
  if (Math.abs(v - lastProgress) < 0.004) return;
  lastProgress = v;
  progress.style.strokeDashoffset = (RING_LEN * (1 - v)).toFixed(1);
  progress.style.opacity = v > 0 ? '1' : '0';
}

function smoothed(t, h) {
  if (h != null) samples.push({ t, h });
  while (samples.length && t - samples[0].t > SMOOTH_MS) samples.shift();
  return circularMean(samples.map((s) => s.h));
}

/* ---------------------------------------------------------- Einmessen */

// Admin: Countdown, dann Mittel der letzten Sekunde zurückgeben (null = kein Kompass)
export function calibrate() {
  return new Promise((resolve) => {
    calib = { t0: performance.now(), done: resolve, raw: [] };
  });
}

function calibFrame(t, h) {
  const left = CALIB_MS - (t - calib.t0);
  if (h != null) calib.raw.push({ t, h });
  box.classList.add('calib');
  setBlur(0);
  setProgress(0);
  if (left > 0) {
    const cur = h == null ? '—' : `${Math.round(h) % 360}°`;
    setMsg(`Aufs Versteck zielen … ${Math.ceil(left / 1000)} · ${cur}`);
    return;
  }
  const last = calib.raw.filter((s) => t - s.t <= CALIB_AVG_MS).map((s) => s.h);
  const done = calib.done;
  calib = null;
  box.classList.remove('calib');
  done(circularMean(last));
}

/* ---------------------------------------------------------- pro Frame */

// active: Fernrohr soll gezeigt werden · rotate: Drehung des Inhalts (Grad) bei gesperrter Bildschirmdrehung
// heading: Kurs der Rückkamera (roh) oder null · target: gespeicherte Zielrichtung oder null
export function scopeFrame(t, { active, rotate, heading, target, onHit }) {
  const want = active || !!calib;
  if (want && !shown) show();
  else if (!want && shown) hide();
  if (!shown) { samples = []; return; }

  content.style.setProperty('--rot', `${rotate}deg`);
  const h = smoothed(t, heading);

  if (calib) { calibFrame(t, h); return; }

  if (h == null) {
    setMsg('Kompass neu kalibrieren – Handy kurz flach halten');
    setBlur(14);
    setProgress(0);
    onSince = null;
    return;
  }
  if (target == null) {
    setMsg('Noch kein Fernrohr-Ziel eingemessen');
    setBlur(14);
    setProgress(0);
    return;
  }
  if (hit) { setMsg(''); setBlur(0); setProgress(1); return; }

  const dev = Math.abs(angleDiff(h, target));
  setBlur(scopeBlur(dev));
  setMsg('');
  if (dev < HIT_DEG) {
    onSince ??= t;
    if (t - onSince >= HIT_MS) {
      hit = true;
      box.classList.add('hit');
      buzz();
      onHit?.();
    }
  } else {
    onSince = null;
  }
  setProgress(hit ? 1 : onSince == null ? 0 : (t - onSince) / HIT_MS);
}

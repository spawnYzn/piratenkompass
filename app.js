import {
  distance, bearing, norm, angleDiff, dirName, parseCoords, formatCoords, formatDistance, encodeHunt, decodeHunt,
} from './geo.js';

const $ = (s, r = document) => r.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const STORE = 'piratenkompass.v1';
const DEFAULTS = { title: 'Schatzsuche', radius: 15, secret: false, offset: 0, stations: [], current: 0 };
const STEP_M = 0.6; // ein Kinder-Piratenschritt
const KORNBURG = { lat: 49.3839, lon: 11.1119 };
const LEAFLET = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/';
const DEMO = new URLSearchParams(location.search).has('demo');

const uid = () => Math.random().toString(36).slice(2, 10);

let hunt = loadHunt();

const S = {
  started: false,
  startAt: 0,
  raw: null,          // Sensor-Kurs in Grad
  compassAcc: null,   // iOS webkitCompassAccuracy
  beta: null,
  pos: null,          // { lat, lon, acc }
  geoErr: null,
  rose: 0,            // geglättete Rosendrehung (fortlaufend, ohne 360-Sprung)
  needle: 0,          // Nadelwinkel auf dem Bildschirm (fortlaufend)
  vel: 0,
  shownArrival: -1,
  capture: null,
  audio: null,
  lastText: 0,
};

function loadHunt() {
  try {
    const h = JSON.parse(localStorage.getItem(STORE));
    if (h && Array.isArray(h.stations)) return { ...DEFAULTS, ...h };
  } catch { /* leer */ }
  return structuredClone(DEFAULTS);
}

function saveHunt() {
  if (DEMO) return;
  try { localStorage.setItem(STORE, JSON.stringify(hunt)); } catch { /* privat-Modus */ }
}

/* ------------------------------------------------------------------ Kompass zeichnen */

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent?.appendChild(e);
  return e;
}
const P = (a, r) => [+(Math.sin((a * Math.PI) / 180) * r).toFixed(2), +(-Math.cos((a * Math.PI) / 180) * r).toFixed(2)];

function buildCompass() {
  const g = $('#roseG');
  el('circle', { r: 160, class: 'ink-line' }, g);
  el('circle', { r: 138, class: 'ink-line' }, g);
  el('circle', { r: 135, class: 'ink-thin' }, g);
  el('circle', { r: 62, class: 'ink-dash' }, g);

  for (let a = 0; a < 360; a += 2.5) {
    const major = a % 30 === 0;
    const mid = a % 10 === 0;
    const five = a % 5 === 0;
    const [x1, y1] = P(a, 175);
    const [x2, y2] = P(a, major ? 161 : mid ? 164 : five ? 167 : 170);
    el('line', { x1, y1, x2, y2, class: major ? 'tick major' : mid ? 'tick mid' : 'tick' }, g);
  }

  const point = (a, L, w, north = false) => {
    const tip = P(a, L);
    const l = P(a - 45, w);
    const r = P(a + 45, w);
    el('path', { d: `M0,0L${tip}L${l}Z`, class: north ? 'pt-dark north' : 'pt-dark' }, g);
    el('path', { d: `M0,0L${tip}L${r}Z`, class: 'pt-light' }, g);
  };
  for (let a = 22.5; a < 360; a += 45) point(a, 76, 11);
  for (let a = 45; a < 360; a += 90) point(a, 108, 17);
  for (let a = 0; a < 360; a += 90) point(a, 134, 23, a === 0);
  el('circle', { r: 9, class: 'rose-center' }, g);

  const text = (label, a, r, cls) => {
    const t = el('text', { class: cls, transform: `rotate(${a}) translate(0,${-r})` }, g);
    t.textContent = label;
  };
  [['N', 0], ['O', 90], ['S', 180], ['W', 270]].forEach(([l, a]) => text(l, a, 149, a === 0 ? 'card-letter north' : 'card-letter'));
  [['NO', 45], ['SO', 135], ['SW', 225], ['NW', 315]].forEach(([l, a]) => text(l, a, 149, 'inter-letter'));
  for (let a = 30; a < 360; a += 30) if (a % 90) text(String(a), a, 149, 'deg-num');

  const rivets = $('#rivets');
  for (let a = 22.5; a < 360; a += 45) {
    if (a > 100 && a < 260) continue; // unten steht die Gravur
    const [cx, cy] = P(a, 191);
    el('circle', { cx, cy, r: 3.2 }, rivets);
  }
}

/* ------------------------------------------------------------------ Sensoren */

async function start() {
  const err = $('#startError');
  err.textContent = '';
  try {
    S.audio = new (window.AudioContext || window.webkitAudioContext)();
    S.audio.resume?.();
  } catch { /* ohne Ton */ }

  if (!DEMO && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res !== 'granted') {
        err.textContent = 'Kompass-Zugriff wurde abgelehnt. Safari ganz schließen (in der App-Übersicht nach oben wischen), neu öffnen und „Erlauben“ tippen.';
        return;
      }
    } catch (e) {
      err.textContent = `Kompass konnte nicht aktiviert werden (${e.message || e}). Läuft die Seite über https?`;
      return;
    }
  }

  S.started = true;
  S.startAt = performance.now();
  if (DEMO) {
    S.pos = { lat: KORNBURG.lat, lon: KORNBURG.lon, acc: 5 };
  } else {
    if ('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute', onOrient, true);
    window.addEventListener('deviceorientation', onOrient, true);
    startGeo();
  }
  keepAwake();
  $('#startScreen').hidden = true;
}

function onOrient(e) {
  let h = null;
  if (typeof e.webkitCompassHeading === 'number' && e.webkitCompassHeading >= 0) {
    h = e.webkitCompassHeading;
    S.compassAcc = e.webkitCompassAccuracy;
  } else if (e.absolute && e.alpha != null) {
    h = 360 - e.alpha;
  }
  if (h == null) return;
  S.raw = h;
  S.beta = e.beta;
}

function startGeo() {
  if (!('geolocation' in navigator)) { S.geoErr = 'unsupported'; return; }
  navigator.geolocation.watchPosition(
    (p) => {
      S.pos = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy };
      S.geoErr = null;
      S.capture?.(S.pos);
    },
    (e) => { S.geoErr = e.code === 1 ? 'denied' : 'unavailable'; },
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 30000 },
  );
}

let wakeLock = null;
async function keepAwake() {
  try {
    if ('wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch { /* nicht verfügbar */ }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && S.started) keepAwake();
});

function heading(t) {
  if (DEMO) return norm(t / 90 + Math.sin(t / 900) * 4);
  if (S.raw == null) return null;
  return norm(S.raw + (+hunt.offset || 0));
}

const activeStation = () => hunt.stations[hunt.current] || null;

/* ------------------------------------------------------------------ Render-Schleife */

const roseEl = $('#rose');
const needleEl = $('#needle');

function frame(t) {
  const h = heading(t);
  if (h != null) {
    S.rose += angleDiff(S.rose, h) * 0.2;

    const st = activeStation();
    const b = st && S.pos ? bearing(S.pos, st) : null;
    // relativ zur angezeigten Rose, damit Nadel und X-Markierung deckungsgleich bleiben
    const desired = (b ?? 0) - S.rose;
    // gedämpfte Feder: die Nadel schwingt leicht nach wie eine echte
    S.vel = S.vel * 0.72 + angleDiff(S.needle, desired) * 0.09;
    S.needle += S.vel;

    roseEl.style.transform = `rotate(${(-S.rose).toFixed(2)}deg)`;
    needleEl.style.transform = `rotate(${S.needle.toFixed(2)}deg)`;
  }
  if (t - S.lastText > 150) {
    S.lastText = t;
    updateText(h);
  }
  requestAnimationFrame(frame);
}

const textCache = new Map();
function setText(sel, v) {
  if (textCache.get(sel) === v) return;
  textCache.set(sel, v);
  $(sel).textContent = v;
}

function updateText(h) {
  const n = hunt.stations.length;
  const i = hunt.current;
  const st = activeStation();

  setText('#headingDeg', h == null ? '—' : `${Math.round(norm(h)) % 360}°`);
  setText('#headingDir', h == null ? '' : dirName(h));

  if (!n) {
    setText('#tcLabel', 'Kein Kurs gesetzt');
    setText('#tcName', 'Freier Kompass');
    setText('#tcStep', 'Stationen im Logbuch anlegen – Anker lange drücken');
  } else if (!st) {
    setText('#tcLabel', 'Jagd beendet');
    setText('#tcName', 'Schatz gefunden!');
    setText('#tcStep', `Alle ${n} Stationen geschafft`);
  } else {
    setText('#tcLabel', 'Kurs auf');
    setText('#tcName', hunt.secret ? `Station ${i + 1}` : st.name || `Station ${i + 1}`);
    setText('#tcStep', `Station ${i + 1} von ${n}`);
  }

  const d = st && S.pos ? distance(S.pos, st) : null;
  const b = st && S.pos ? bearing(S.pos, st) : null;
  const targetMode = b != null;
  document.body.classList.toggle('mode-target', targetMode);

  const xm = $('#xMark');
  xm.style.display = targetMode ? '' : 'none';
  if (targetMode) xm.setAttribute('transform', `rotate(${b.toFixed(1)})`);

  $('#distance').hidden = d == null;
  if (d != null) {
    setText('#distVal', formatDistance(d));
    setText('#distSteps', d < 1000 ? `≈ ${Math.round(d / STEP_M)} Piratenschritte` : '');
  }

  // Kursangabe in Seemannssprache
  const hint = $('#courseHint');
  let hintText = '';
  let onCourse = false;
  let near = false;
  if (targetMode && h != null) {
    const rel = angleDiff(h, b);
    near = d <= Math.max(hunt.radius * 2.5, S.pos.acc);
    if (near) hintText = 'Ganz nah! Augen auf!';
    else if (Math.abs(rel) <= 15) { hintText = 'Auf Kurs, Käpt\'n!'; onCourse = true; }
    else if (Math.abs(rel) > 150) hintText = 'Kehrt marsch! ↶';
    else if (rel > 60) hintText = 'Hart Steuerbord! →';
    else if (rel > 0) hintText = 'Etwas Steuerbord →';
    else if (rel < -60) hintText = '← Hart Backbord!';
    else hintText = '← Etwas Backbord';
  }
  setText('#courseHint', hintText);
  hint.classList.toggle('near', near);
  document.body.classList.toggle('on-course', onCourse);

  $('#status').innerHTML = statusHtml(h);

  if (st && d != null && S.pos.acc <= 40 && d <= hunt.radius && S.shownArrival !== i) showArrival();
}

function statusHtml(h) {
  if (!S.started) return '';
  const parts = [];
  const warn = (s) => `<span class="warn">${s}</span>`;
  if (h == null && performance.now() - S.startAt > 2500) parts.push(warn('Kein Kompass-Sensor – bitte am Handy öffnen'));
  else if (S.compassAcc != null && (S.compassAcc < 0 || S.compassAcc > 30)) parts.push(warn('Kompass ungenau – Handy in einer Acht schwenken'));
  else if (S.beta != null && Math.abs(S.beta) > 65) parts.push(warn('Handy flacher halten'));

  if (S.geoErr === 'denied') parts.push(warn('Standort blockiert – in den iPhone-Einstellungen für Safari erlauben'));
  else if (S.geoErr === 'unsupported') parts.push(warn('Kein GPS verfügbar'));
  else if (!S.pos) parts.push('Suche GPS-Signal …');
  else if (S.pos.acc > 30) parts.push(warn(`GPS ungenau (±${Math.round(S.pos.acc)} m) – kurz warten`));
  else if (hunt.stations.length) parts.push(`GPS ±${Math.round(S.pos.acc)} m`);
  return parts.join(' · ');
}

/* ------------------------------------------------------------------ Ankunft */

function showArrival() {
  const i = hunt.current;
  const st = hunt.stations[i];
  const last = i === hunt.stations.length - 1;
  S.shownArrival = i;
  $('#arrivalTitle').textContent = last ? 'Der Schatz ist hier!' : 'Land in Sicht!';
  $('#arrivalName').textContent = st.name || `Station ${i + 1}`;
  $('#arrivalNote').textContent = st.note || '';
  $('#nextBtn').textContent = last ? 'Jagd beenden' : 'Kurs auf nächste Station';
  $('#arrival').hidden = false;
  rainCoins(last ? 60 : 28);
  shipBell(last ? 3 : 2);
  navigator.vibrate?.([200, 100, 200]);
}

$('#nextBtn').addEventListener('click', () => {
  hunt.current = Math.min(hunt.current + 1, hunt.stations.length);
  saveHunt();
  $('#arrival').hidden = true;
});
$('#stayBtn').addEventListener('click', () => { $('#arrival').hidden = true; });

function rainCoins(count) {
  const box = $('#coins');
  box.innerHTML = '';
  for (let k = 0; k < count; k++) {
    const c = document.createElement('span');
    c.className = 'coin';
    c.style.left = `${Math.random() * 100}vw`;
    c.style.animationDuration = `${1.6 + Math.random() * 1.8}s`;
    c.style.animationDelay = `${Math.random() * 1.2}s`;
    const s = 16 + Math.random() * 16;
    c.style.width = c.style.height = `${s}px`;
    box.appendChild(c);
  }
}

// Schiffsglocke, synthetisch – braucht keine Audiodatei
function shipBell(strikes) {
  const ctx = S.audio;
  if (!ctx) return;
  ctx.resume?.();
  const partials = [[1, 1], [2.02, 0.55], [2.74, 0.35], [4.08, 0.2], [5.4, 0.12]];
  for (let s = 0; s < strikes; s++) {
    const t0 = ctx.currentTime + s * 0.55;
    const master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    for (const [ratio, amp] of partials) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 660 * ratio;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(amp, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.2 / ratio + 0.4);
      o.connect(g).connect(master);
      o.start(t0);
      o.stop(t0 + 3);
    }
  }
}

/* ------------------------------------------------------------------ Logbuch */

const logBtn = $('#openLog');
let pressTimer = null;
logBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  logBtn.classList.add('pressing');
  pressTimer = setTimeout(() => {
    pressTimer = null;
    logBtn.classList.remove('pressing');
    openLog();
  }, 700);
});
const cancelPress = (showHint) => {
  if (!pressTimer) return;
  clearTimeout(pressTimer);
  pressTimer = null;
  logBtn.classList.remove('pressing');
  if (showHint) toast('Lange drücken – nur für den Käpt\'n!');
};
logBtn.addEventListener('pointerup', () => cancelPress(true));
logBtn.addEventListener('pointerleave', () => cancelPress(false));
logBtn.addEventListener('pointercancel', () => cancelPress(false));
logBtn.addEventListener('contextmenu', (e) => e.preventDefault());

function openLog() {
  renderLog();
  $('#setTitle').value = hunt.title;
  $('#setRadius').value = String(hunt.radius);
  $('#setSecret').checked = !!hunt.secret;
  $('#setOffset').value = String(hunt.offset || 0);
  $('#log').hidden = false;
}
$('#closeLog').addEventListener('click', () => { $('#log').hidden = true; resetForm(); });

function renderLog() {
  const ol = $('#stationList');
  ol.innerHTML = '';
  const n = hunt.stations.length;
  $('#logProgress').textContent = n
    ? hunt.current < n ? `Aktuelles Ziel: Station ${hunt.current + 1} von ${n}` : 'Alle Stationen geschafft.'
    : '';
  if (!n) {
    ol.innerHTML = '<li class="empty">Noch keine Stationen. Leg unten die erste an!</li>';
    return;
  }
  hunt.stations.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = `st${i === hunt.current ? ' active' : ''}${i < hunt.current ? ' done' : ''}`;
    li.dataset.id = s.id;
    li.innerHTML = `
      <span class="st-num">${i + 1}</span>
      <div class="st-main"><div class="st-name"></div><div class="st-meta"></div><div class="st-note"></div></div>
      <div class="st-actions">
        <button class="go" data-act="go">${i === hunt.current ? 'Aktuelles Ziel' : 'Kurs setzen'}</button>
        <button data-act="up" aria-label="nach oben">↑</button>
        <button data-act="down" aria-label="nach unten">↓</button>
        <button data-act="edit">Ändern</button>
        <button data-act="del">Löschen</button>
      </div>`;
    li.querySelector('.st-name').textContent = s.name || `Station ${i + 1}`;
    const dist = S.pos ? ` · ${formatDistance(distance(S.pos, s))} von hier` : '';
    li.querySelector('.st-meta').textContent = formatCoords(s) + dist;
    li.querySelector('.st-note').textContent = s.note || '';
    ol.appendChild(li);
  });
}

$('#stationList').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = btn.closest('li').dataset.id;
  const i = hunt.stations.findIndex((s) => s.id === id);
  if (i < 0) return;
  const activeId = activeStation()?.id;
  const keepActive = () => {
    const k = hunt.stations.findIndex((s) => s.id === activeId);
    hunt.current = k >= 0 ? k : Math.min(hunt.current, hunt.stations.length);
  };

  switch (btn.dataset.act) {
    case 'go':
      hunt.current = i;
      S.shownArrival = -1;
      toast(`Kurs gesetzt auf Station ${i + 1}`);
      break;
    case 'up':
      if (i === 0) return;
      [hunt.stations[i - 1], hunt.stations[i]] = [hunt.stations[i], hunt.stations[i - 1]];
      keepActive();
      break;
    case 'down':
      if (i === hunt.stations.length - 1) return;
      [hunt.stations[i + 1], hunt.stations[i]] = [hunt.stations[i], hunt.stations[i + 1]];
      keepActive();
      break;
    case 'edit':
      editStation(hunt.stations[i]);
      return;
    case 'del':
      if (!btn.classList.contains('armed')) {
        btn.classList.add('armed');
        btn.textContent = 'Sicher?';
        setTimeout(() => { btn.classList.remove('armed'); btn.textContent = 'Löschen'; }, 3000);
        return;
      }
      hunt.stations.splice(i, 1);
      if (i < hunt.current) hunt.current--;
      hunt.current = Math.min(hunt.current, hunt.stations.length);
      if (editingId === id) resetForm();
      break;
  }
  saveHunt();
  renderLog();
});

/* Stationsformular */

let editingId = null;
const coordsInput = $('#stCoords');

function previewCoords() {
  const box = $('#coordPreview');
  const v = coordsInput.value.trim();
  if (!v) { box.textContent = ''; box.className = 'coord-preview'; return null; }
  const p = parseCoords(v);
  if (p) {
    const extra = S.pos ? ` · ${formatDistance(distance(S.pos, p))} von hier` : '';
    box.textContent = `✓ ${formatCoords(p)}${extra}`;
    box.className = 'coord-preview ok';
  } else {
    box.textContent = '✗ Koordinaten nicht erkannt';
    box.className = 'coord-preview bad';
  }
  return p;
}
coordsInput.addEventListener('input', previewCoords);

function editStation(s) {
  editingId = s.id;
  $('#stName').value = s.name;
  coordsInput.value = formatCoords(s);
  $('#stNote').value = s.note || '';
  $('#formTitle').textContent = 'Station ändern';
  $('#saveStation').textContent = 'Änderungen speichern';
  $('#cancelEdit').hidden = false;
  previewCoords();
  $('#stationForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  editingId = null;
  $('#stName').value = '';
  coordsInput.value = '';
  $('#stNote').value = '';
  $('#formTitle').textContent = 'Neue Station';
  $('#saveStation').textContent = 'Station hinzufügen';
  $('#cancelEdit').hidden = true;
  previewCoords();
}
$('#cancelEdit').addEventListener('click', resetForm);

$('#saveStation').addEventListener('click', () => {
  const p = parseCoords(coordsInput.value);
  if (!p) { toast('Bitte gültige Koordinaten angeben'); coordsInput.focus(); return; }
  const note = $('#stNote').value.trim();
  if (editingId) {
    const s = hunt.stations.find((x) => x.id === editingId);
    if (s) Object.assign(s, { name: $('#stName').value.trim() || s.name, ...p, note });
    toast('Station gespeichert');
  } else {
    const name = $('#stName').value.trim() || `Station ${hunt.stations.length + 1}`;
    hunt.stations.push({ id: uid(), name, ...p, note });
    toast(`${name} ins Logbuch eingetragen`);
  }
  saveHunt();
  resetForm();
  renderLog();
});

/* Position vor Ort peilen: einige Sekunden GPS sammeln und gewichtet mitteln */

$('#gpsBtn').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  if (S.geoErr === 'denied') { toast('Standortzugriff ist blockiert'); return; }
  const label = btn.textContent;
  const samples = S.pos ? [S.pos] : [];
  const t0 = Date.now();
  let done = false;
  btn.disabled = true;

  const finish = () => {
    if (done) return;
    done = true;
    S.capture = null;
    clearInterval(iv);
    btn.disabled = false;
    btn.textContent = label;
    if (!samples.length) { toast('Kein GPS-Signal – draußen nochmal versuchen'); return; }
    const best = Math.min(...samples.map((s) => s.acc));
    const use = samples.filter((s) => s.acc <= best * 1.5 + 1);
    let w = 0, lat = 0, lon = 0;
    for (const s of use) {
      const k = 1 / Math.max(s.acc, 1) ** 2;
      w += k; lat += s.lat * k; lon += s.lon * k;
    }
    coordsInput.value = formatCoords({ lat: lat / w, lon: lon / w });
    previewCoords();
    toast(`Position gepeilt (±${Math.round(best)} m)`);
  };

  S.capture = (p) => {
    samples.push(p);
    if (samples.filter((s) => s.acc <= 5).length >= 4) finish();
  };
  const iv = setInterval(() => {
    const left = 8 - Math.floor((Date.now() - t0) / 1000);
    btn.textContent = `Peile … ${left} s`;
    if (left <= 0) finish();
  }, 250);
});

/* Einstellungen */

$('#setTitle').addEventListener('input', (e) => {
  hunt.title = e.target.value.trim() || 'Schatzsuche';
  applyTitle();
  saveHunt();
});
$('#setRadius').addEventListener('change', (e) => { hunt.radius = +e.target.value; saveHunt(); });
$('#setSecret').addEventListener('change', (e) => { hunt.secret = e.target.checked; saveHunt(); });
$('#setOffset').addEventListener('input', (e) => {
  const v = Math.max(-30, Math.min(30, Math.round(+e.target.value || 0)));
  hunt.offset = v;
  saveHunt();
});

function applyTitle() {
  const t = hunt.title || 'Schatzsuche';
  $('#huntTitle').textContent = t;
  $('#engraveText').textContent = `✦ ${t.toUpperCase()} ✦`;
  document.title = `${t} · Piratenkompass`;
}

$('#restartBtn').addEventListener('click', () => {
  hunt.current = 0;
  S.shownArrival = -1;
  saveHunt();
  renderLog();
  toast('Die Jagd beginnt von vorn – Kurs auf Station 1');
});

$('#wipeBtn').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  if (!btn.classList.contains('armed')) {
    btn.classList.add('armed');
    btn.textContent = 'Wirklich alles löschen?';
    setTimeout(() => { btn.classList.remove('armed'); btn.textContent = 'Alle Stationen löschen'; }, 3000);
    return;
  }
  hunt.stations = [];
  hunt.current = 0;
  S.shownArrival = -1;
  saveHunt();
  resetForm();
  renderLog();
  btn.classList.remove('armed');
  btn.textContent = 'Alle Stationen löschen';
  toast('Logbuch geleert');
});

/* ------------------------------------------------------------------ Teilen & Import */

$('#shareBtn').addEventListener('click', async () => {
  if (!hunt.stations.length) { toast('Erst Stationen anlegen'); return; }
  const url = `${location.origin}${location.pathname}#karte=${encodeHunt(hunt)}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: hunt.title, text: `Schatzkarte „${hunt.title}“ für den Piratenkompass`, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast('Link kopiert!');
  } catch (err) {
    if (err?.name !== 'AbortError') {
      window.prompt('Diesen Link kopieren:', url);
    }
  }
});

let pendingImport = null;
function checkImport() {
  const m = location.hash.match(/karte=([A-Za-z0-9_-]+)/);
  if (!m) return;
  history.replaceState(null, '', location.pathname + location.search);
  const h = decodeHunt(m[1]);
  if (!h || !h.stations.length) { toast('Die Schatzkarte ist unleserlich'); return; }
  pendingImport = h;
  const replace = hunt.stations.length ? ` Deine ${hunt.stations.length} bisherigen Stationen werden ersetzt.` : '';
  $('#importText').textContent = `„${h.title}“ mit ${h.stations.length} Station${h.stations.length === 1 ? '' : 'en'}.${replace}`;
  $('#importDlg').hidden = false;
}
$('#importYes').addEventListener('click', () => {
  const h = pendingImport;
  hunt = { ...DEFAULTS, offset: hunt.offset, ...h, current: 0, stations: h.stations.map((s) => ({ id: uid(), ...s })) };
  S.shownArrival = -1;
  saveHunt();
  applyTitle();
  $('#importDlg').hidden = true;
  toast('Schatzkarte übernommen!');
});
$('#importNo').addEventListener('click', () => { $('#importDlg').hidden = true; pendingImport = null; });

/* ------------------------------------------------------------------ Karte (Leaflet, lädt erst bei Bedarf) */

let map = null;
let mapMarks = null;

function loadLeaflet() {
  if (window.L) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `${LEAFLET}leaflet.min.css`;
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = `${LEAFLET}leaflet.min.js`;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Karte konnte nicht geladen werden – Internet an?'));
    document.head.appendChild(s);
  });
}

function updateMapReadout() {
  const c = map.getCenter();
  $('#mapReadout').textContent = formatCoords({ lat: c.lat, lon: c.lng });
}

$('#mapBtn').addEventListener('click', async () => {
  try { await loadLeaflet(); } catch (e) { toast(e.message); return; }
  $('#mapSheet').hidden = false;
  const L = window.L;
  const startAt = parseCoords(coordsInput.value) || hunt.stations.at(-1) || S.pos || KORNBURG;
  if (!map) {
    map = L.map('map', { zoomControl: true });
    const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap',
    });
    const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, attribution: '© Esri',
    });
    osm.addTo(map);
    L.control.layers({ Karte: osm, Satellit: sat }, null, { collapsed: false }).addTo(map);
    mapMarks = L.layerGroup().addTo(map);
    map.on('move', updateMapReadout);
    map.on('click', (e) => map.panTo(e.latlng));
  }
  mapMarks.clearLayers();
  hunt.stations.forEach((s, i) => {
    L.circleMarker([s.lat, s.lon], { radius: 8, color: '#2b1a0e', weight: 2, fillColor: '#8c1c13', fillOpacity: 0.9 })
      .bindTooltip(`${i + 1}`, { permanent: true, direction: 'top', offset: [0, -6] })
      .addTo(mapMarks);
  });
  if (S.pos) {
    L.circleMarker([S.pos.lat, S.pos.lon], { radius: 7, color: '#fff', weight: 2, fillColor: '#1a73e8', fillOpacity: 1 }).addTo(mapMarks);
  }
  map.setView([startAt.lat, startAt.lon], 17);
  setTimeout(() => { map.invalidateSize(); updateMapReadout(); }, 60);
});

$('#closeMap').addEventListener('click', () => { $('#mapSheet').hidden = true; });
$('#mapTake').addEventListener('click', () => {
  const c = map.getCenter();
  coordsInput.value = formatCoords({ lat: c.lat, lon: c.lng });
  previewCoords();
  $('#mapSheet').hidden = true;
});

/* ------------------------------------------------------------------ Kleinkram & Start */

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

if (DEMO && !hunt.stations.length) {
  hunt.stations = [
    { id: uid(), name: 'Die alte Eiche', lat: 49.3862, lon: 11.1151, note: 'Sucht in der Astgabel nach der Flaschenpost!' },
    { id: uid(), name: 'Die Brücke', lat: 49.3818, lon: 11.1080, note: '' },
  ];
}

buildCompass();
applyTitle();
$('#startBtn').addEventListener('click', start);
checkImport();
requestAnimationFrame(frame);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

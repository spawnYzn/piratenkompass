// Geo-Mathematik, Koordinaten-Parser und Teilen-Codec (ohne DOM, testbar mit node --test)

export const R_EARTH = 6371008.8;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

export const norm = (a) => ((a % 360) + 360) % 360;
// kürzester vorzeichenbehafteter Winkel von a nach b (-180..180)
export const angleDiff = (a, b) => norm(b - a + 180) - 180;

export function distance(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearing(a, b) {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat));
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return norm(deg(Math.atan2(y, x)));
}

// Punkt, der von a aus in Richtung brg (Grad) dist Meter entfernt liegt
export function destination(a, brg, dist) {
  const d = dist / R_EARTH;
  const t = rad(brg);
  const la1 = rad(a.lat);
  const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(t));
  const lo2 = rad(a.lon) + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2));
  return { lat: deg(la2), lon: deg(lo2) };
}

const DIRS = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
export const dirName = (h) => DIRS[Math.round(norm(h) / 22.5) % 16];

export const validLatLon = (lat, lon) =>
  Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;

const ok = (lat, lon) => (validLatLon(lat, lon) ? { lat, lon } : null);
const num = (s) => (s == null || s === '' ? 0 : parseFloat(String(s).replace(',', '.')));

// Versteht: "49.3839, 11.1119" · "49,3839 11,1119" · Google-/Apple-Maps-Links ·
// 49°23'02.0"N 11°06'43.0"E · N 49° 23.034 E 011° 06.714 (auch O für Ost)
export function parseCoords(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  try { s = decodeURIComponent(s); } catch { /* egal */ }

  const urlPats = [
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /[?&](?:q|ll|query|sll|daddr|destination|center)=(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/,
    /@(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/,
  ];
  for (const p of urlPats) {
    const m = s.match(p);
    if (m) return ok(+m[1], +m[2]);
  }

  if (/°/.test(s)) return parseDMS(s);

  // deutsches Dezimalkomma: "49,3839 11,1119" oder "49,3839; 11,1119"
  if (/^\s*-?\d+,\d+\s*[;\s]\s*-?\d+,\d+\s*$/.test(s)) s = s.replace(/(\d),(\d)/g, '$1.$2');

  const nums = s.match(/-?\d+(?:\.\d+)?/g);
  if (!nums || nums.length < 2) return null;
  let lat = +nums[0];
  let lon = +nums[1];
  if (/\bS\b/i.test(s) && lat > 0) lat = -lat;
  if (/\bW\b/i.test(s) && lon > 0) lon = -lon;
  return ok(lat, lon);
}

function parseDMS(s) {
  const prefix = /^[NSEWO]/i.test(s.trim());
  const re = prefix
    ? /([NSEWO])\s*(\d{1,3}(?:[.,]\d+)?)\s*°\s*(?:(\d{1,2}(?:[.,]\d+)?)\s*['′’]?\s*)?(?:(\d{1,2}(?:[.,]\d+)?)\s*(?:["″”]|''))?/gi
    : /(\d{1,3}(?:[.,]\d+)?)\s*°\s*(?:(\d{1,2}(?:[.,]\d+)?)\s*['′’]\s*)?(?:(\d{1,2}(?:[.,]\d+)?)\s*(?:["″”]|'')\s*)?([NSEWO])?/gi;
  const parts = [];
  for (const m of s.matchAll(re)) {
    const [hemi, d, mi, se] = prefix ? [m[1], m[2], m[3], m[4]] : [m[4], m[1], m[2], m[3]];
    parts.push({ hemi: (hemi || '').toUpperCase(), v: num(d) + num(mi) / 60 + num(se) / 3600 });
  }
  if (parts.length < 2) return null;
  let [a, b] = parts;
  if ('EWO'.includes(a.hemi) && a.hemi) [a, b] = [b, a];
  const lat = a.hemi === 'S' ? -a.v : a.v;
  const lon = b.hemi === 'W' ? -b.v : b.v;
  return ok(lat, lon);
}

export const formatCoords = (p) => `${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}`;

export function formatDistance(m) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(m < 10000 ? 2 : 1).replace('.', ',')} km`;
}

// --- Schatzkarte teilen: Jagd kompakt als base64url in den Link-Hash ---

export function encodeHunt(h) {
  const o = {
    v: 1,
    t: h.title,
    r: h.radius,
    x: h.secret ? 1 : 0,
    s: h.stations.map((st) => {
      const a = [st.name, +st.lat.toFixed(6), +st.lon.toFixed(6)];
      if (st.note) a.push(st.note);
      return a;
    }),
  };
  let bin = '';
  for (const byte of new TextEncoder().encode(JSON.stringify(o))) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeHunt(str) {
  try {
    let b = String(str).replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4) b += '=';
    const bytes = Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
    const o = JSON.parse(new TextDecoder().decode(bytes));
    if (!o || !Array.isArray(o.s)) return null;
    const stations = o.s
      .map((a) => ({ name: String(a[0] || ''), lat: +a[1], lon: +a[2], note: a[3] ? String(a[3]) : '' }))
      .filter((st) => validLatLon(st.lat, st.lon));
    return { title: String(o.t || 'Schatzsuche'), radius: +o.r || 15, secret: !!o.x, stations };
  } catch {
    return null;
  }
}

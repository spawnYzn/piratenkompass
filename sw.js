// Offline-Cache: App sofort aus dem Cache, im Hintergrund aktualisieren
const CACHE = 'kompass-v7';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'geo.js', 'audio.js', 'fernrohr.js', 'assets/ausguck_raetsel.png', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', (e) => {
  // cache: 'reload' umgeht den HTTP-Cache (GitHub Pages: max-age=600), sonst landen alte Dateien in der neuen Version
  const reqs = SHELL.map((u) => new Request(u, { cache: 'reload' }));
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(reqs)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const own = url.origin === self.location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  const leaflet = url.hostname === 'cdnjs.cloudflare.com';
  if (!own && !fonts && !leaflet) return; // Kartenkacheln etc. direkt aus dem Netz

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: own });
      const fresh = fetch(own ? new Request(req.url, { cache: 'no-cache' }) : req)
        .then((res) => {
          if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || fresh;
    }),
  );
});

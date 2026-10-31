// Caches the app shell so the survey tool opens with no signal.
// Only this app's own files are cached; every other request (Apps Script, the estimator, etc.) passes straight through.
// Bump CACHE when you deploy a new version so crews pick it up.
const CACHE = 'wsfs-v10';
const FILES = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'watermark.png'].concat(["textures/mulch.jpg", "textures/mulch-pine-bark.jpg", "textures/mulch-brown-mulch.jpg", "textures/mulch-red-mulch.jpg", "textures/mulch-chocolate-mulch.jpg", "textures/rock.jpg", "textures/rock-2-granite.jpg", "textures/rock-3-4-brown-pea-stone.jpg", "textures/rock-1-5-brown-river-rock.jpg", "textures/rock-1-3-brown-river-rock.jpg", "textures/rock-red-lava-rock.jpg", "textures/dirt.jpg", "textures/dirt-fill-dirt-top-soil.jpg", "textures/sod.jpg", "textures/sod-argentine-bahia.jpg", "textures/sod-st-augustine-floratam.jpg", "textures/sod-st-augustine-pro-vista.jpg", "textures/sod-st-augustine-citra-blue.jpg", "textures/sod-icon-zoysia.jpg", "textures/sod-seville-st-augustine-shade-tolerant.jpg", "textures/sod-bimini-bermuda.jpg"]);
const SCOPE = new URL(self.registration.scope);
const MINE = new Set(['', ...FILES].map(f => new URL(f, SCOPE).pathname));
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(['./', ...FILES].map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || !MINE.has(u.pathname)) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});

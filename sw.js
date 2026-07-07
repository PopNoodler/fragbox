const CACHE = 'fragbox-v135';
const ASSETS = ['./', './index.html', './lib/three.module.js', './lib/GLTFLoader.js', './lib/BufferGeometryUtils.js', './models/soldier.glb', './models/weapons.glb', './models/props.glb', './shared/map.mjs', './shared/weapons.mjs', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first for navigations (playbook §4 — ends stale-page pain), cache-first for assets.
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(r => {
        if(r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  // network-first for EVERYTHING: gameplay data (weapons/maps) must never be stale.
  // Cache is the offline fallback only.
  e.respondWith(
    fetch(e.request).then(resp => {
      if(resp.ok){ const copy = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return resp;
    }).catch(() => caches.match(e.request))
  );
});

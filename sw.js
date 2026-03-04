'use strict';

const CACHE = 'recall-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './src/assets/morning.jpg',
  './src/assets/evening.jpg',
  './src/icons/icon-192.svg',
  './src/icons/icon-512.svg',
];

// ── Install: precache static assets ───────────────────────────────────────────
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: remove old caches ────────────────────────────────────────────────
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for same-origin, passthrough for external ───────────────
self.addEventListener('fetch', evt => {
  const { request } = evt;
  const url = new URL(request.url);

  // Always pass through cross-origin requests (API, fonts, etc.)
  if (url.origin !== self.location.origin) return;

  // Cache-first strategy for local assets
  evt.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // Cache successful GET responses
        if (response.ok && request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: return cached index.html for navigation
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

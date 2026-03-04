'use strict';

// Bump this version on every deploy to bust stale caches.
// Network-first for HTML means version bumps are no longer
// required for app updates — but bump anyway for clean rollover.
const CACHE = 'recall-v2';

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

// ── Fetch ──────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', evt => {
  const { request } = evt;
  const url = new URL(request.url);

  // Always pass through cross-origin requests (API, fonts, etc.)
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML navigation — always fetches fresh app shell,
  // falls back to cache only when offline.
  if (request.mode === 'navigate' || request.destination === 'document') {
    evt.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            caches.open(CACHE).then(c => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache-first for static assets (images, icons, manifest)
  evt.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok && request.method === 'GET') {
          caches.open(CACHE).then(c => c.put(request, response.clone()));
        }
        return response;
      });
    })
  );
});

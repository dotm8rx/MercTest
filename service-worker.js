// Smarter service worker: network-first for index.html, cache-first for assets
const CACHE = 'qa-lite-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install: cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

// Fetch: network-first for index.html, cache-first for others
self.addEventListener('fetch', event => {
  const req = event.request;

  // Always get fresh HTML so the app updates
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Everything else: cache-first
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});

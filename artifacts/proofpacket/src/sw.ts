// Basic service worker for offline support and PWA install prompt
const CACHE_NAME = 'conditionlock-v1';

const PRECACHE = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  (self as any).skipWaiting();
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  (self as any).clients.claim();
});

self.addEventListener('fetch', (event: any) => {
  // Network-first for API, cache-first for assets
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

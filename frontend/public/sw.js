const CACHE_NAME = 'hillclimb-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/generated/hillclimb-logo.dim_1024x512.png',
  '/assets/generated/hillclimb-pwa-icon.dim_512x512.png',
  '/assets/generated/hillclimb-pwa-icon-maskable.dim_512x512.png',
  '/assets/generated/stage-canyon-bg.dim_1920x1080.png',
  '/assets/generated/stage-moon-bg.dim_1920x1080.png',
  '/assets/generated/vehicles-sprites.dim_1024x512.png',
  '/assets/generated/icon-fuel.dim_128x128.png',
  '/assets/generated/icon-coin.dim_128x128.png',
  '/assets/generated/hud-panel.dim_800x200.png',
  '/assets/generated/gallery-photo-01-free.dim_1024x1024.png',
  '/assets/generated/gallery-photo-02-locked.dim_1024x1024.png',
  '/assets/generated/gallery-photo-03-locked.dim_1024x1024.png',
  '/assets/generated/gallery-photo-04-locked.dim_1024x1024.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

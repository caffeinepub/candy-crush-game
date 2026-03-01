const CACHE_NAME = 'snake-game-3d-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/generated/pwa-icon.dim_192x192.png',
  '/assets/generated/pwa-icon.dim_512x512.png',
  '/assets/generated/pwa-icon-maskable.dim_512x512.png',
  '/assets/generated/space-bg.dim_1920x1080.png',
  '/assets/generated/game-logo-wz.dim_1024x512.png',
  '/assets/generated/coin-icon-wz.dim_128x128.png',
  '/assets/generated/food-pickups-sprites-wz-fruit.dim_1024x1024.png',
  '/assets/generated/minimap-frame-wz.dim_320x320.png',
  '/assets/generated/arena-bg-tile-wz.dim_512x512.png',
  '/assets/generated/btn-primary-green-wz.dim_900x260.png',
  '/assets/generated/booster-btn-bg-wz.dim_256x256.png',
  '/assets/generated/booster-icons-wz.dim_512x512.png',
  '/assets/generated/hud-panel-dark-wz.dim_800x200.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

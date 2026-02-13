const CACHE_NAME = 'snake-arena-v11';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/generated/arena-bg-tile.dim_512x512.png',
  '/assets/generated/game-logo.dim_1024x512.png',
  '/assets/generated/btn-primary-green.dim_900x260.png',
  '/assets/generated/hud-panel-dark.dim_800x200.png',
  '/assets/generated/minimap-frame.dim_320x320.png',
  '/assets/generated/coin-icon.dim_128x128.png',
  '/assets/generated/food-pickups-sprites.dim_1024x1024.png',
  '/assets/generated/booster-btn-bg.dim_256x256.png',
  '/assets/generated/booster-icons.dim_512x512.png',
  '/assets/generated/pwa-icon.dim_192x192.png',
  '/assets/generated/pwa-icon.dim_512x512.png',
  '/assets/generated/pwa-icon-maskable.dim_512x512.png',
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
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

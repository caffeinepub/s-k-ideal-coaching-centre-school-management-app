const CACHE_NAME = 'school-mitra-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/assets/generated/school-mitra-icon.dim_192x192.png',
  '/assets/generated/school-mitra-icon.dim_512x512.png',
  '/assets/generated/favicon.dim_32x32.png',
  '/assets/generated/education-icon-transparent.dim_64x64.png',
  '/assets/generated/dashboard-analytics.dim_400x300.jpg',
  '/assets/generated/school-building.dim_800x400.jpg',
  '/assets/generated/student-avatar.dim_100x100.jpg',
  '/assets/generated/teacher-avatar.dim_100x100.jpg',
  '/assets/generated/achievement-badge-transparent.dim_64x64.png',
  '/assets/generated/report-card-template.dim_400x300.png'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell and assets');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first with cache fallback for API, cache first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip Internet Identity URLs - never cache authentication
  if (url.hostname.includes('identity.ic0.app') || url.hostname.includes('identity.internetcomputer.org')) {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If not in cache, return offline page
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Handle API requests (backend canister calls) - network first with cache fallback
  if (url.pathname.includes('/api/') || url.hostname.includes('.ic0.app') || url.hostname.includes('.icp0.io')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to return cached response
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[Service Worker] Serving cached API response for:', request.url);
              return cachedResponse;
            }
            // No cached response available
            throw new Error('Network request failed and no cache available');
          });
        })
    );
    return;
  }

  // Handle static assets - cache first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cache the fetched response for future use
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});

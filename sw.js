const CACHE_NAME = 'inmate-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts.js',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/forge.css',
  'https://cdn.forge.tylertech.com/v1/css/tyler-font.css',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/index.js',
  'https://cdn.forge.tylertech.com/v1/images/branding/tyler/tyler-logo-white.svg'
];

// Install service worker and cache the static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercept fetch requests and serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }
        
        // Not in cache - fetch and cache the response
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response since it can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache if it's a dynamic API request
                if (event.request.url.includes('/api/')) {
                  return;
                }
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If fetch fails (offline), try to serve the index page
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
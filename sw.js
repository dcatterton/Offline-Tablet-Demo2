// Service Worker with improved caching for CSS files
const CACHE_NAME = 'inmate-app-v1'; // Increment this version when you update styles

// Files to cache immediately on SW installation
const precacheResources = [
  '/',
  '/index.html',
  '/new_order.html',
  '/styles.css',
  '/scripts.js',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/forge.css',
  'https://cdn.forge.tylertech.com/v1/css/tyler-font.css',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/index.js'
];

// Install event - cache all initial resources
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(precacheResources);
      })
      .then(() => {
        return self.skipWaiting(); // Force activation without waiting
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of all clients immediately
    })
  );
});

// Fetch event - special handling for CSS files
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Check if this is a CSS request - either by file extension or Accept header
  const isCSSRequest = 
    requestUrl.pathname.endsWith('.css') || 
    (event.request.headers.get('Accept') && 
     event.request.headers.get('Accept').includes('text/css'));
  
  if (isCSSRequest) {
    // For CSS files: Network-first strategy
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response before using it
          const clonedResponse = response.clone();
          
          // Update the cache with fresh CSS
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
            console.log('Updated cache for CSS:', requestUrl.pathname);
          });
          
          return response;
        })
        .catch(() => {
          // If network fetch fails, fall back to cache
          console.log('Network fetch failed for CSS, using cache:', requestUrl.pathname);
          return caches.match(event.request);
        })
    );
  } else {
    // For non-CSS resources: Cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Not in cache, get from network
          return fetch(event.request)
            .then(response => {
              // Cache the fetched response for next time
              // Only cache successful responses for same-origin requests
              if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
                const clonedResponse = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, clonedResponse);
                });
              }
              return response;
            });
        })
    );
  }
});

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('All caches cleared by client request');
        // Notify client that caches were cleared
        if (event.source) {
          event.source.postMessage({
            type: 'CACHE_CLEARED'
          });
        }
      })
    );
  }
});
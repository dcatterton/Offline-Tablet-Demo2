// Service Worker with improved caching for offline functionality
const CACHE_NAME = 'inmate-app-v2'; // Incrementing version

// Files to cache immediately on SW installation
const precacheResources = [
  '/',
  '/index.html',
  '/new_order.html',
  '/styles.css',
  '/scripts.js',
  '/manifest.json',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/forge.css',
  'https://cdn.forge.tylertech.com/v1/css/tyler-font.css',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/index.js',
  'https://cdn.forge.tylertech.com/v1/images/branding/tyler/tyler-logo-white.svg'
];

// Install event - cache all initial resources
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell and assets');
        return cache.addAll(precacheResources);
      })
      .then(() => {
        return self.skipWaiting(); // Force activation without waiting
      })
      .catch(error => {
        console.error('Pre-caching failed:', error);
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
      console.log('Service worker now controls the page');
      return self.clients.claim(); // Take control of all clients immediately
    })
  );
});

// Fetch event - enhanced offline strategy
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Skip cross-origin requests like Google Analytics
  if (requestUrl.origin !== location.origin && 
      !requestUrl.href.includes('cdn.forge.tylertech.com')) {
    return;
  }
  
  // Special handling for HTML navigation requests
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Update cache with fresh HTML
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        })
        .catch(() => {
          // If network fails, try to serve index.html from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              // Return cached HTML response or fallback to index
              return cachedResponse || caches.match('/index.html');
            });
        })
    );
    return;
  }
  
  // For CSS files: Network-first strategy
  if (requestUrl.pathname.endsWith('.css') || 
     (event.request.headers.get('Accept') && 
      event.request.headers.get('Accept').includes('text/css'))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response before using it
          const clonedResponse = response.clone();
          
          // Update the cache with fresh CSS
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          
          return response;
        })
        .catch(() => {
          // If network fetch fails, fall back to cache
          return caches.match(event.request);
        })
    );
  } else {
    // For all other resources: Cache-first strategy 
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Not in cache, get from network
          return fetch(event.request)
            .then(response => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response
              const responseToCache = response.clone();
              
              // Add to cache for next time
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
              
              return response;
            })
            .catch(error => {
              console.error('Fetch failed:', error);
              // You could return a custom offline page/image here
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

// Add an offline event listener
self.addEventListener('fetch', function(event) {
  // Check if the request fails due to network issues
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
  }
});
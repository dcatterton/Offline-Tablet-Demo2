// Enhanced Service Worker with Improved Offline Support
const CACHE_NAME = 'inmate-app-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts.js',
  '/manifest.json',
  // Forge components
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/forge.css',
  'https://cdn.forge.tylertech.com/v1/css/tyler-font.css',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/index.js',
  'https://cdn.forge.tylertech.com/v1/images/branding/tyler/tyler-logo-white.svg'
  // Make sure to add paths to your icon files
  // '/icons/icon-72x72.png',
  // '/icons/icon-96x96.png',
  // ... other icons
];

// Install event - cache the app shell
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        console.log('[Service Worker] Install completed');
      })
      .catch(error => {
        console.error('[Service Worker] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Activation complete');
    })
  );
});

// Improved fetch strategy - Cache, falling back to network, updating cache
self.addEventListener('fetch', event => {
  console.log('[Service Worker] Fetch event for', event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Handle requests for the app shell differently
  const isAppShellRequest = APP_SHELL.some(url => 
    event.request.url.endsWith(url) || event.request.url.includes(url)
  );
  
  if (isAppShellRequest) {
    // For app shell resources - use cache first, fall back to network
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', event.request.url);
            return cachedResponse;
          }
          
          console.log('[Service Worker] Not in cache, fetching:', event.request.url);
          return fetch(event.request)
            .then(response => {
              // Don't cache bad responses
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Cache the new response
              let responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch(error => {
              console.error('[Service Worker] Fetch failed:', error);
              // If it's a page navigation, return the offline page
              if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
              }
              
              return new Response('Network error', {
                status: 408,
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        })
    );
  } else {
    // For other requests - try network first with a timeout, fall back to cache
    event.respondWith(
      Promise.race([
        // Network request with timeout
        new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('timeout')), 3000);
          fetch(event.request).then(resolve, reject);
        }),
        // Cache lookup
        caches.match(event.request)
      ])
      .catch(() => {
        // If both fail, return cached version if available
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // For page navigations, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Otherwise, return a basic error
            return new Response('Network and cache both failed', {
              status: 504,
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
    );
    
    // Update cache in background (stale-while-revalidate pattern)
    event.waitUntil(
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) {
            return;
          }
          
          let responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        })
        .catch(() => {
          // Silently fail - this is just a background refresh
        })
    );
  }
});
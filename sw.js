// Enhanced Service Worker with comprehensive offline support
const CACHE_NAME = 'inmate-app-v3';

// The minimum set of files needed for the app shell
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts.js',
  '/manifest.json'
];

// External forge resources - cached separately
const FORGE_ASSETS = [
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/forge.css',
  'https://cdn.forge.tylertech.com/v1/css/tyler-font.css',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/index.js',
  'https://cdn.forge.tylertech.com/v1/images/branding/tyler/tyler-logo-white.svg'
];

// Special handling for external icon requests
const SVG_ICON_PATTERN = /cdn\.forge\.tylertech\.com\/.*\/icons\/svg\//;

// Install event handler with better error handling
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Skip waiting - activate immediately
  self.skipWaiting();
  
  // First cache core assets
  event.waitUntil(
    caches.open(CACHE_NAME + '-core')
      .then(cache => {
        console.log('[Service Worker] Caching core assets');
        return cache.addAll(CORE_ASSETS).catch(error => {
          console.error('[Service Worker] Failed to cache core assets:', error);
          // Continue even if some assets fail to cache
          return Promise.resolve();
        });
      })
      .then(() => {
        // Then cache forge assets separately
        return caches.open(CACHE_NAME + '-forge')
          .then(cache => {
            console.log('[Service Worker] Caching forge assets');
            // Cache each forge asset individually to prevent a single failure from stopping all
            const cachePromises = FORGE_ASSETS.map(url => 
              cache.add(url).catch(error => {
                console.error(`[Service Worker] Failed to cache ${url}:`, error);
                // Continue even if one asset fails
                return Promise.resolve();
              })
            );
            return Promise.all(cachePromises);
          });
      })
      .then(() => {
        console.log('[Service Worker] Install completed');
      })
  );
});

// Activate event handler - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  // Claim clients to take control immediately
  event.waitUntil(clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete any cache that doesn't match our current versions
          if (!cacheName.startsWith(CACHE_NAME)) {
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

// Optimized fetch event handler
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Log important fetches only to reduce console spam
  if (event.request.mode === 'navigate' || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.json')) {
    console.log('[Service Worker] Fetch event for', event.request.url);
  }
  
  // Special handling for icon SVG requests
  if (SVG_ICON_PATTERN.test(event.request.url)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving icon from cache:', event.request.url);
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              // Cache valid responses
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME + '-forge')
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            })
            .catch(error => {
              console.log('[Service Worker] Icon fetch failed, using fallback');
              // Use a placeholder for SVG icons when offline
              return new Response(
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <rect width="24" height="24" fill="#2196F3" />
                </svg>`,
                { 
                  headers: new Headers({
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'no-store'
                  })
                }
              );
            });
        })
    );
    return;
  }
  
  // Handle navigation requests (page loads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then(cachedResponse => {
          if (cachedResponse) {
            // Respond with cached version first (cache-first for navigation)
            console.log('[Service Worker] Serving index.html from cache');
            
            // Update the cache in the background
            fetch(event.request)
              .then(response => {
                if (response && response.status === 200) {
                  caches.open(CACHE_NAME + '-core')
                    .then(cache => {
                      cache.put('/index.html', response);
                      console.log('[Service Worker] Updated index.html in cache');
                    });
                }
              })
              .catch(() => {
                // Silent fail for background update
              });
              
            return cachedResponse;
          }
          
          // Try network if not in cache
          console.log('[Service Worker] index.html not in cache, using network');
          return fetch(event.request)
            .catch(error => {
              console.error('[Service Worker] Fetch failed for navigation:', error);
              // Create a basic offline response
              return new Response(
                `<!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Offline</title>
                  <style>
                    body { font-family: sans-serif; text-align: center; padding: 20px; }
                    .offline-message { max-width: 400px; margin: 0 auto; }
                  </style>
                </head>
                <body>
                  <div class="offline-message">
                    <h1>You're offline</h1>
                    <p>The app needs an internet connection.</p>
                    <button onclick="window.location.reload()">Try Again</button>
                  </div>
                </body>
                </html>`,
                {
                  headers: new Headers({
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-store'
                  })
                }
              );
            });
        })
    );
    return;
  }
  
  // Regular cache-first strategy for all other requests
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Respond with cached version
          return cachedResponse;
        }
        
        // Not in cache, try network
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Clone the response and cache it
            const responseToCache = response.clone();
            
            // Determine which cache to use
            const cacheName = FORGE_ASSETS.some(asset => 
              event.request.url.includes(asset) || 
              event.request.url.includes('cdn.forge.tylertech.com')
            ) ? 
              CACHE_NAME + '-forge' : 
              CACHE_NAME + '-core';
            
            caches.open(cacheName)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // Return nothing for images or data - let the browser handle fallbacks
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/i) ||
                event.request.headers.get('Accept').includes('application/json')) {
              return new Response(null, {
                status: 408,
                statusText: 'Request timed out'
              });
            }
            
            // For CSS/JS, provide an empty response to prevent errors
            if (event.request.url.match(/\.(css|js)$/i)) {
              const contentType = event.request.url.endsWith('.css') ? 
                'text/css' : 'application/javascript';
              
              return new Response('/* Offline fallback */', {
                headers: new Headers({
                  'Content-Type': contentType
                })
              });
            }
            
            // For other resources, return a generic error
            return new Response('Network error', {
              status: 408,
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
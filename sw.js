// Mobile-Optimized Service Worker for PWA home screen support
const CACHE_NAME = 'inmate-app-v4';
const APP_SHELL = 'app-shell-v4';

// App shell files (critical)
const appShellFiles = [
  '/',
  '/index.html',
  '/new_order.html',
  '/styles.css',
  '/scripts.js',
  '/offline.html',
  '/manifest.json',
  '/sw.js',
  '/fallback-image.svg'
];

// CDN resources (non-critical but useful)
const cdnResources = [
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/forge.css',
  'https://cdn.forge.tylertech.com/v1/css/tyler-font.css',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/index.js',
  'https://cdn.forge.tylertech.com/v1/images/branding/tyler/tyler-logo-white.svg',
  'https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-500.woff2',
  'https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-regular.woff2',
  'https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-500.woff',
  'https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-regular.woff',
  'https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-500.ttf',
  'https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-regular.ttf'
];

// Install event - cache app shell immediately
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  // We'll use two separate caches - one for APP_SHELL (immediate) and one for other resources
  event.waitUntil(
    // Cache app shell first - this is critical
    caches.open(APP_SHELL)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(appShellFiles)
          .catch(error => {
            console.error('[Service Worker] App shell caching failed:', error);
            // Continue with what we can cache
            return Promise.resolve();
          });
      })
      .then(() => {
        // Then attempt to cache CDN resources, but don't block activation
        caches.open(CACHE_NAME)
          .then(cache => {
            console.log('[Service Worker] Caching CDN resources');
            return cache.addAll(cdnResources)
              .catch(error => {
                console.error('[Service Worker] CDN caching failed:', error);
                return Promise.resolve();
              });
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Delete old versions of our caches
          return (cacheName !== CACHE_NAME && cacheName !== APP_SHELL);
        }).map(cacheName => {
          console.log('[Service Worker] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Create offline fallback responses
const createOfflineResponse = (type) => {
  if (type === 'html') {
    return caches.match('/offline.html')
      .catch(() => {
        return new Response(
          '<html><head><title>Offline</title></head><body style="font-family:sans-serif;padding:20px;text-align:center;"><h1 style="color:#2196F3">You\'re Offline</h1><p>Please check your connection.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      });
  }
  
  if (type === 'image') {
    return caches.match('/fallback-image.svg')
      .catch(() => {
        return new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f5f5f5"/><text x="100" y="75" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#888">Image Unavailable</text></svg>',
          { headers: { 'Content-Type': 'image/svg+xml' } }
        );
      });
  }
  
  // Default empty response for other types
  return new Response('', { 
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
};

// Fetch event - focus on app shell reliability
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Process same-origin requests differently from CDN
  const isSameOrigin = url.origin === self.location.origin;
  
  // Special strategy for HTML navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // If fetch fails, look in the app shell cache first
          return caches.match(request, { cacheName: APP_SHELL })
            .then(response => {
              // Return cached response or fallback to offline page
              if (response) {
                return response;
              }
              return caches.match('/offline.html', { cacheName: APP_SHELL })
                .then(offlineResponse => {
                  if (offlineResponse) {
                    return offlineResponse;
                  }
                  return createOfflineResponse('html');
                });
            });
        })
    );
    return;
  }
  
  // App shell resources - cache first for maximum reliability
  if (isSameOrigin && appShellFiles.includes(url.pathname)) {
    event.respondWith(
      caches.match(request, { cacheName: APP_SHELL })
        .then(response => {
          if (response) {
            // If it's in our app shell cache, use it
            return response;
          }
          
          // If not in cache, try network and update cache
          return fetch(request)
            .then(networkResponse => {
              // Cache the new app shell response
              const responseToCache = networkResponse.clone();
              caches.open(APP_SHELL).then(cache => {
                cache.put(request, responseToCache);
              });
              return networkResponse;
            })
            .catch(error => {
              console.error('Fetch failed for app shell:', error);
              // For CSS/JS, better to show nothing than broken content
              if (url.pathname.endsWith('.css')) {
                return new Response('/* Offline stylesheet */', { 
                  headers: { 'Content-Type': 'text/css' } 
                });
              }
              
              if (url.pathname.endsWith('.js')) {
                return new Response('// Offline script', { 
                  headers: { 'Content-Type': 'application/javascript' } 
                });
              }
              
              // For other app shell resources, return empty response
              return createOfflineResponse('');
            });
        })
    );
    return;
  }
  
  // CDN resources (like Forge, fonts, etc.)
  if (url.href.includes('cdn.forge.tylertech.com')) {
    event.respondWith(
      caches.match(request, { cacheName: CACHE_NAME })
        .then(response => {
          if (response) {
            // If in cache, use it
            return response;
          }
          
          // Try network and update cache
          return fetch(request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, responseToCache);
                });
              }
              return networkResponse;
            })
            .catch(error => {
              console.error('Failed to fetch CDN resource:', error);
              // For fonts
              if (url.pathname.includes('/fonts/')) {
                return new Response('', { 
                  status: 503,
                  headers: { 'Content-Type': 'application/font-woff2' } 
                });
              }
              // For CSS
              if (url.pathname.endsWith('.css')) {
                return new Response('/* Offline CDN stylesheet */', { 
                  headers: { 'Content-Type': 'text/css' } 
                });
              }
              // For JavaScript
              if (url.pathname.endsWith('.js')) {
                return new Response('// Offline CDN script', { 
                  headers: { 'Content-Type': 'application/javascript' } 
                });
              }
              return createOfflineResponse('');
            });
        })
    );
    return;
  }
  
  // Image resources 
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, responseToCache);
                });
              }
              return networkResponse;
            })
            .catch(() => {
              return createOfflineResponse('image');
            });
        })
    );
    return;
  }
  
  // Default fetch handler - cache then network with offline fallback
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Return from cache if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(request)
          .then(networkResponse => {
            // Only cache successful responses 
            if (networkResponse.ok && request.method === 'GET') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(error => {
            console.error('Network fetch failed:', error);
            
            // Provide appropriate fallback based on request type
            if (request.destination === 'document') {
              return createOfflineResponse('html');
            }
            if (request.destination === 'image') {
              return createOfflineResponse('image');
            }
            if (request.destination === 'style') {
              return new Response('/* Offline stylesheet */', { 
                headers: { 'Content-Type': 'text/css' } 
              });
            }
            if (request.destination === 'script') {
              return new Response('// Offline script', { 
                headers: { 'Content-Type': 'application/javascript' } 
              });
            }
            
            // Default empty response
            return createOfflineResponse('');
          });
      })
  );
});

// Add listener for client messages
self.addEventListener('message', event => {
  if (!event.data) {
    return;
  }
  
  // Handle skip waiting message
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle clear cache message
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('[Service Worker] All caches cleared');
        
        // Re-cache app shell immediately
        return caches.open(APP_SHELL).then(cache => {
          return cache.addAll(appShellFiles);
        });
      }).then(() => {
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

// Special handling for standalone mode detection
self.addEventListener('fetch', event => {
  // Check if this is the first request after being launched from home screen
  if (event.request.mode === 'navigate' && 
      event.request.headers.get('Accept').includes('text/html')) {
    
    // Check if launched in standalone mode
    event.respondWith(
      // We'll check the client to see if we're in standalone mode
      self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
      }).then(clients => {
        // If we have a client, we'll check its display mode
        if (clients.length > 0) {
          const client = clients[0];
          
          // First, fetch the page the user requested
          return fetch(event.request)
            .then(response => {
              // Clone the response so we can return one and modify the other
              const responseToCache = response.clone();
              
              // Cache important navigations immediately
              caches.open(APP_SHELL).then(cache => {
                cache.put(event.request, responseToCache);
              });
              
              return response;
            })
            .catch(() => {
              // If fetch fails, respond from cache
              return caches.match(event.request)
                .then(cachedResponse => {
                  if (cachedResponse) {
                    return cachedResponse;
                  }
                  
                  // If nothing in cache, try the offline page
                  return caches.match('/offline.html');
                });
            });
        }
        
        // Default network-first strategy with offline fallback
        return fetch(event.request)
          .catch(() => {
            return caches.match(event.request)
              .then(cachedResponse => {
                return cachedResponse || caches.match('/offline.html');
              });
          });
      })
    );
  }
});
// Service Worker with robust offline support - v3
const CACHE_NAME = 'inmate-app-v3';

// Files to cache immediately on SW installation
const precacheResources = [
  '/',
  '/index.html',
  '/new_order.html',
  '/styles.css',
  '/scripts.js',
  '/manifest.json',
  '/offline.html',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/forge.css',
  'https://cdn.forge.tylertech.com/v1/css/tyler-font.css',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/index.js',
  'https://cdn.forge.tylertech.com/v1/images/branding/tyler/tyler-logo-white.svg',
  // Font files that were failing
  'https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-500.woff2',
  'https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-regular.woff2',
  'https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-500.woff',
  'https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-regular.woff',
  'https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-500.ttf',
  'https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-regular.ttf'
];

// Install event - cache all initial resources
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell and content');
        return cache.addAll(precacheResources)
          .catch(error => {
            console.error('[Service Worker] Pre-caching failed:', error);
            // Continue even if some resources fail to cache
            return Promise.resolve();
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
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('[Service Worker] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim(); // Take control of all clients immediately
    })
  );
});

// Helper function to create a network-first response strategy
const networkFirst = async (request) => {
  try {
    // Try to get from network first
    const networkResponse = await fetch(request);
    
    // If successful, clone and cache
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache', request.url);
    
    // If network fails, try the cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // For image requests, return a fallback image
    if (request.destination === 'image') {
      return caches.match('/fallback-image.png')
        .catch(() => {
          // If no fallback image, create a simple response
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">' +
            '<rect width="100%" height="100%" fill="#f5f5f5"/>' +
            '<text x="50%" y="50%" font-family="sans-serif" font-size="16" text-anchor="middle" fill="#767676">' +
            'Image Unavailable' +
            '</text>' +
            '</svg>',
            { 
              headers: {'Content-Type': 'image/svg+xml'} 
            }
          );
        });
    }
    
    // For font requests, try to find any available font as fallback
    if (request.url.includes('/fonts/')) {
      const fontResponses = await caches.match(
        new Request('https://cdn.forge.tylertech.com/v1/fonts/roboto-v20-latin-regular.woff2')
      );
      if (fontResponses) return fontResponses;
    }
    
    // If this is a page navigation, return the offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
        .catch(() => {
          // If no offline page, return a simple response
          return new Response(
            '<html><head><title>Offline</title></head><body style="font-family: sans-serif; padding: 20px;">' +
            '<h1>You\'re Offline</h1><p>Please check your connection.</p></body></html>',
            { 
              headers: {'Content-Type': 'text/html'} 
            }
          );
        });
    }
    
    // Return an empty response for other resources
    return new Response('', { 
      status: 408,
      headers: {'Content-Type': 'text/plain'}
    });
  }
};

// Fetch event - comprehensive strategy
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      networkFirst(event.request)
    );
    return;
  }
  
  // For CSS, JS and important assets - network first then fallback to cache
  if (
    requestUrl.pathname.endsWith('.css') ||
    requestUrl.pathname.endsWith('.js') ||
    requestUrl.href.includes('cdn.forge.tylertech.com')
  ) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  
  // For image resources
  if (event.request.destination === 'image') {
    event.respondWith(networkFirst(event.request));
    return;
  }
  
  // For font resources
  if (
    requestUrl.pathname.endsWith('.woff') ||
    requestUrl.pathname.endsWith('.woff2') ||
    requestUrl.pathname.endsWith('.ttf') ||
    requestUrl.pathname.endsWith('.eot')
  ) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  
  // Default strategy for everything else - cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return the cached version
          return cachedResponse;
        }
        
        // Not in cache, try network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses or non-GET requests
            if (!response || response.status !== 200 || event.request.method !== 'GET') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Add successful responses to cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => {
                console.error('[Service Worker] Error caching new resource:', err);
              });
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // For image requests, return a fallback image
            if (event.request.destination === 'image') {
              return caches.match('/fallback-image.png');
            }
            
            // Return empty response for other resources
            return new Response('', { 
              status: 408,
              headers: {'Content-Type': 'text/plain'}
            });
          });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skip waiting message received');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('[Service Worker] All caches cleared by client request');
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
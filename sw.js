// Simple, robust service worker with reliable offline handling
const CACHE_NAME = 'inmate-app-v5';

// Files to cache immediately on installation
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/new_order.html',
  '/transaction_history.html',
  '/mailroom.html',
  '/styles.css',
  '/scripts.js',
  '/manifest.json',
  '/offline.html',
  '/pwa-helper.js',
  '/fallback.html',
  '/grievances.html',
  '/new_grievance.html',
  '/video_chat.html',
  '/video_chat_waiting_room.html',
  '/video_chat_call.html',
  '/media',
  '/media/inmate.mp4',
  '/media/visitor.mp4',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/forge.css',
  'https://cdn.forge.tylertech.com/v1/css/tyler-font.css',
  'https://cdn.forge.tylertech.com/v1/libs/@tylertech/forge@3.6.4/index.js',
  'https://cdn.forge.tylertech.com/v1/images/branding/tyler/tyler-logo-white.svg'
];

// Install event handler
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  
  // Skip waiting to take control immediately
  self.skipWaiting();
  
  // Precache critical resources
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_URLS)
          .catch(err => {
            console.error('[SW] Precaching failed:', err);
            // Even if some precaching fails, we want to continue
            return Promise.resolve();
          });
      })
  );
});

// Activate event handler
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  
  // Clean up old caches
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Generate an offline response
function generateOfflineResponse() {
  return caches.match('/offline.html')
    .then(response => {
      // If we have a cached offline page, use it
      if (response) {
        return response;
      }
      
      // Otherwise, create a basic offline response
      return new Response(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Offline - Tyler Inmate System</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f5f5f5; }
            .container { text-align: center; padding: 1.5rem; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 5px; max-width: 90%; width: 400px; }
            h1 { color: #2196F3; }
            button { background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're Offline</h1>
            <p>Unable to connect to Tyler Inmate System.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
        </html>`,
        {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-store'
          }
        }
      );
    });
}

// Create a placeholder image for offline use
function generateImageFallback() {
  const svgImage = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
    <rect width="200" height="150" fill="#f5f5f5"/>
    <text x="50%" y="50%" font-family="sans-serif" text-anchor="middle" fill="#aaa">Image Unavailable</text>
  </svg>`;
  
  return new Response(svgImage, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store'
    }
  });
}

// Fetch event handler - simple, robust approach
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Handle the fetch event with error protection
  event.respondWith(
    // Try to fetch from network first
    fetch(event.request)
      .then(response => {
        // Don't cache opaque responses or non-successful responses
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        
        // Clone the response so we can cache it
        const responseToCache = response.clone();
        
        // Cache the successful response
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          })
          .catch(err => {
            console.error('[SW] Error caching response:', err);
          });
        
        return response;
      })
      .catch(error => {
        // Network request failed, try the cache
        console.log('[SW] Network request failed, using cache for:', event.request.url);
        
        return caches.match(event.request)
          .then(cachedResponse => {
            // If we have a cached response, use it
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Special handling based on request type
            const url = new URL(event.request.url);
            
            // For HTML page requests, show the offline page
            if (event.request.mode === 'navigate' || 
                (event.request.headers.get('accept') && 
                 event.request.headers.get('accept').includes('text/html'))) {
              console.log('[SW] HTML request is offline, showing offline page');
              return generateOfflineResponse();
            }
            
            // For image requests, return a placeholder
            if (event.request.destination === 'image') {
              console.log('[SW] Image request is offline, showing placeholder');
              return generateImageFallback();
            }
            
            // For other resources, return an empty response
            console.log('[SW] Resource unavailable and no cached version:', url.pathname);
            return new Response('', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          })
          .catch(err => {
            // This should never happen, but just in case
            console.error('[SW] Critical error in offline handling:', err);
            
            // Return simple offline text as a last resort
            return new Response('Offline. Please try again later.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Message event handler
self.addEventListener('message', event => {
  if (!event.data) return;
  
  // Handle SKIP_WAITING message
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle CLEAR_CACHE message
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => caches.delete(cache))
      );
    }).then(() => {
      console.log('[SW] Caches cleared');
      if (event.source) {
        event.source.postMessage({ type: 'CACHE_CLEARED' });
      }
    });
  }
});
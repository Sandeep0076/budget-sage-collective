
// Cache name with version for easy updates
const CACHE_NAME = 'budget-sage-v2';
const APP_CACHE = 'budget-sage-app-v2';
const DATA_CACHE = 'budget-sage-data-v2';

// Static assets to cache for offline use
const staticAssets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
  // PWA Icons
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/base-icon.svg',
  // Add CSS and JS assets
  '/assets/index.css',
  '/assets/index.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(staticAssets);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (
            cacheName !== APP_CACHE &&
            cacheName !== DATA_CACHE
          ) {
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - network-first strategy for API requests, cache-first for static assets
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Skip requests for Chrome extension resources
  if (requestUrl.protocol === 'chrome-extension:') {
    return;
  }
  
  // For API requests (including Supabase), use network-first strategy
  if (
    requestUrl.pathname.startsWith('/api') ||
    requestUrl.hostname.includes('supabase')
  ) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response for caching
          const clonedResponse = response.clone();
          
          // Open the data cache and store the response
          caches.open(DATA_CACHE).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For all other requests (static assets), use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Return the response directly for non-GET requests or error responses
            if (
              event.request.method !== 'GET' ||
              !response ||
              response.status !== 200 ||
              response.type !== 'basic'
            ) {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            // Open the app cache and store the response
            caches.open(APP_CACHE).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return response;
          })
          .catch(error => {
            console.log('[ServiceWorker] Fetch failed:', error);
            
            // For navigation requests, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // Otherwise just propagate the error
            throw error;
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

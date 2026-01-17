/**
 * Service Worker for Wojak Games PWA
 *
 * Handles:
 * - Asset caching for offline support
 * - Push notifications
 * - Background sync
 */

const CACHE_NAME = 'wojak-games-v1';
const STATIC_CACHE = 'wojak-static-v1';
const DYNAMIC_CACHE = 'wojak-dynamic-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activate complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  // Skip API requests (don't cache API responses)
  if (url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/mintgarden-api/') ||
      url.pathname.startsWith('/dexie-api/') ||
      url.pathname.startsWith('/spacescan-api/') ||
      url.pathname.startsWith('/coingecko-api/')) return;

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Cache successful responses (skip partial 206 responses - they can't be cached)
            if (networkResponse.ok && networkResponse.status !== 206) {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline fallback for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  // Default notification payload
  let payload = {
    title: 'Wojak Games',
    body: 'You have a new notification!',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge.png',
  };

  // Parse the push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      payload = { ...payload, ...data };
    } catch (e) {
      // If not JSON, use as plain text body
      payload.body = event.data.text();
    }
  }

  // Notification options
  const options = {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/badge.png',
    image: payload.image,
    tag: payload.tag || 'default',
    data: payload.data || {},
    actions: payload.actions || [],
    vibrate: [100, 50, 100],
    requireInteraction: false,
    renotify: payload.tag ? true : false,
  };

  // Show the notification
  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  // Close the notification
  event.notification.close();

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/';
  const notificationType = event.notification.data?.type;

  // Handle specific actions
  let targetUrl = urlToOpen;

  if (event.action === 'play') {
    targetUrl = '/media';
  } else if (event.action === 'view') {
    if (notificationType === 'high_score_beaten') {
      targetUrl = '/leaderboard';
    } else if (notificationType === 'guild_invite') {
      targetUrl = '/guild';
    }
  } else if (event.action === 'dismiss') {
    return;
  }

  // Open or focus the app window
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');

  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
      })
      .then((subscription) => {
        return fetch('/api/notifications/resubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldEndpoint: event.oldSubscription?.endpoint,
            newSubscription: subscription.toJSON(),
          }),
        });
      })
  );
});

// Message handler for communication with the app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync (for future use)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scores') {
    event.waitUntil(syncScores());
  }
});

async function syncScores() {
  console.log('[SW] Syncing offline scores...');
  // Future: sync any offline scores
}

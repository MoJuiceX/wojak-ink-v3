# ENHANCEMENT PROMPT 03: PWA Install System

## Priority: MEDIUM
PWA installation gives your web app a native app feel - full screen, home screen icon, faster loading. Implement after sound and haptics are working.

---

## What This Does

When implemented, users can "install" your website to their phone's home screen:
- **Full screen** - No browser URL bar or navigation
- **Home screen icon** - One-tap access like a native app
- **Faster loading** - Cached assets load instantly
- **Offline capability** - Games can work without internet
- **Push notification support** - Required for notifications later

---

## Architecture

```
public/
├── manifest.json            # PWA manifest file
├── sw.js                    # Service worker
├── icons/
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
│
src/
├── systems/pwa/
│   ├── index.ts
│   ├── PWAContext.tsx       # React context for install state
│   ├── usePWA.ts            # Hook for PWA functionality
│   ├── InstallPrompt.tsx    # Install prompt UI component
│   ├── InstallBanner.tsx    # Banner UI component
│   └── pwa.css              # Styles
│
└── serviceWorkerRegistration.ts  # SW registration
```

---

## Part 1: Web App Manifest

Create/update `public/manifest.json`:

```json
{
  "name": "Wojak Games",
  "short_name": "Wojak",
  "description": "Play fun casual games and compete with your friends!",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0f0f1a",
  "theme_color": "#FF8C32",
  "categories": ["games", "entertainment"],
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/game-screenshot-1.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Orange Stack Gameplay"
    },
    {
      "src": "/screenshots/game-screenshot-2.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Game Selection"
    }
  ],
  "shortcuts": [
    {
      "name": "Orange Stack",
      "short_name": "Stack",
      "description": "Play Orange Stack",
      "url": "/games/orange-stack",
      "icons": [{ "src": "/icons/shortcut-stack.png", "sizes": "96x96" }]
    },
    {
      "name": "Leaderboard",
      "short_name": "Ranks",
      "description": "View Leaderboards",
      "url": "/leaderboard",
      "icons": [{ "src": "/icons/shortcut-leaderboard.png", "sizes": "96x96" }]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
```

---

## Part 2: Service Worker

Create `public/sw.js`:

```javascript
const CACHE_NAME = 'wojak-games-v1';
const STATIC_CACHE = 'wojak-static-v1';
const DYNAMIC_CACHE = 'wojak-dynamic-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add your main JS/CSS bundles
  // These will be auto-generated paths from your build
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
  if (url.pathname.startsWith('/api/')) return;

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
            // Cache successful responses
            if (networkResponse.ok) {
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

// Push notification event (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync (for future use - queue offline actions)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scores') {
    event.waitUntil(syncScores());
  }
});

async function syncScores() {
  // Sync any offline scores when back online
  // Implementation depends on your offline score storage
  console.log('[SW] Syncing offline scores...');
}
```

---

## Part 3: Service Worker Registration

Create `src/serviceWorkerRegistration.ts`:

```typescript
type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
};

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config?: Config): void {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);

    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      if (isLocalhost) {
        // Running on localhost - check if SW exists
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('This app is being served cache-first by a service worker.');
        });
      } else {
        // Not localhost - register SW
        registerValidSW(swUrl, config);
      }
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Back online');
      config?.onOnline?.();
    });

    window.addEventListener('offline', () => {
      console.log('Gone offline');
      config?.onOffline?.();
    });
  }
}

function registerValidSW(swUrl: string, config?: Config): void {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available
              console.log('New content is available; please refresh.');
              config?.onUpdate?.(registration);
            } else {
              // Content cached for offline use
              console.log('Content is cached for offline use.');
              config?.onSuccess?.(registration);
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config): void {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
```

---

## Part 4: PWA Context

Create `src/systems/pwa/PWAContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAContextType {
  // State
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isStandalone: boolean;

  // Actions
  promptInstall: () => Promise<boolean>;
  dismissInstallPrompt: () => void;

  // For UI
  showInstallBanner: boolean;
  installDismissedAt: number | null;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installDismissedAt, setInstallDismissedAt] = useState<number | null>(null);

  // Check if running as installed PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  // Check if installable (prompt event captured)
  const isInstallable = !!installPromptEvent && !isInstalled && !isStandalone;

  // Determine if we should show install banner
  const showInstallBanner = (() => {
    if (!isInstallable) return false;

    // Check if user dismissed recently (24 hours)
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) return false;
    }

    // Check if user has played enough games (engagement threshold)
    const gamesPlayed = parseInt(localStorage.getItem('games-played') || '0');
    if (gamesPlayed < 3) return false; // Wait until they've played 3 games

    return true;
  })();

  // Capture the install prompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      console.log('PWA install prompt captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Listen for app installed event
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
      console.log('PWA was installed');

      // Track installation
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (localStorage.getItem('pwa-installed') === 'true' || isStandalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  // Listen for online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Trigger the install prompt
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!installPromptEvent) {
      console.log('No install prompt available');
      return false;
    }

    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;

      console.log(`User ${outcome} the install prompt`);

      if (outcome === 'accepted') {
        setIsInstalled(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error prompting install:', error);
      return false;
    }
  }, [installPromptEvent]);

  // Dismiss the install prompt (for 24 hours)
  const dismissInstallPrompt = useCallback(() => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setInstallDismissedAt(Date.now());
  }, []);

  return (
    <PWAContext.Provider
      value={{
        isInstalled,
        isInstallable,
        isOnline,
        isStandalone,
        promptInstall,
        dismissInstallPrompt,
        showInstallBanner,
        installDismissedAt
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
};
```

---

## Part 5: Install Banner Component

Create `src/systems/pwa/InstallBanner.tsx`:

```typescript
import React from 'react';
import { IonButton } from '@ionic/react';
import { usePWA } from './PWAContext';
import './pwa.css';

interface InstallBannerProps {
  position?: 'top' | 'bottom';
}

export const InstallBanner: React.FC<InstallBannerProps> = ({
  position = 'bottom'
}) => {
  const { showInstallBanner, promptInstall, dismissInstallPrompt } = usePWA();

  if (!showInstallBanner) return null;

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (!installed) {
      // User declined - they might accept later
    }
  };

  return (
    <div className={`install-banner install-banner-${position}`}>
      <div className="install-banner-content">
        <div className="install-banner-icon">🍊</div>
        <div className="install-banner-text">
          <strong>Install Wojak Games</strong>
          <span>Add to home screen for the best experience!</span>
        </div>
      </div>
      <div className="install-banner-actions">
        <button
          className="install-banner-dismiss"
          onClick={dismissInstallPrompt}
        >
          Later
        </button>
        <IonButton
          className="install-banner-install"
          onClick={handleInstall}
          size="small"
        >
          Install
        </IonButton>
      </div>
    </div>
  );
};
```

---

## Part 6: Install Prompt Modal

Create `src/systems/pwa/InstallPrompt.tsx`:

```typescript
import React, { useState } from 'react';
import { IonModal, IonButton } from '@ionic/react';
import { usePWA } from './PWAContext';
import './pwa.css';

interface InstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  isOpen,
  onClose
}) => {
  const { promptInstall, isInstallable } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isInstallable) return null;

  const handleInstall = async () => {
    setIsInstalling(true);
    const installed = await promptInstall();
    setIsInstalling(false);

    if (installed) {
      onClose();
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="install-prompt-modal">
      <div className="install-prompt-content">
        {/* App Preview */}
        <div className="install-prompt-preview">
          <div className="app-icon-large">🍊</div>
          <h2>Wojak Games</h2>
          <p className="app-tagline">Play. Compete. Win.</p>
        </div>

        {/* Benefits */}
        <div className="install-benefits">
          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <div className="benefit-text">
              <strong>Instant Launch</strong>
              <span>One tap from your home screen</span>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-icon">📱</span>
            <div className="benefit-text">
              <strong>Full Screen</strong>
              <span>No browser bar - pure gaming</span>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-icon">🚀</span>
            <div className="benefit-text">
              <strong>Faster Loading</strong>
              <span>Games load instantly</span>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-icon">🔔</span>
            <div className="benefit-text">
              <strong>Get Notified</strong>
              <span>Never miss a challenge</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="install-prompt-actions">
          <IonButton
            expand="block"
            onClick={handleInstall}
            disabled={isInstalling}
            className="install-button-primary"
          >
            {isInstalling ? 'Installing...' : 'Add to Home Screen'}
          </IonButton>

          <button className="install-prompt-skip" onClick={onClose}>
            Maybe Later
          </button>
        </div>

        {/* Note */}
        <p className="install-note">
          Free • No download required • Works offline
        </p>
      </div>
    </IonModal>
  );
};
```

---

## Part 7: Offline Indicator

Create `src/systems/pwa/OfflineIndicator.tsx`:

```typescript
import React from 'react';
import { usePWA } from './PWAContext';
import './pwa.css';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      <span className="offline-icon">📡</span>
      <span className="offline-text">You're offline</span>
    </div>
  );
};
```

---

## Part 8: PWA Styles

Create `src/systems/pwa/pwa.css`:

```css
/* ===== INSTALL BANNER ===== */
.install-banner {
  position: fixed;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(20, 20, 35, 0.98), rgba(30, 30, 50, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 140, 50, 0.3);
  z-index: 9999;
  animation: slideIn 0.3s ease-out;
}

.install-banner-top {
  top: 0;
  border-top: none;
  border-radius: 0 0 16px 16px;
}

.install-banner-bottom {
  bottom: 0;
  border-bottom: none;
  border-radius: 16px 16px 0 0;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.install-banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.install-banner-icon {
  font-size: 2rem;
}

.install-banner-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.install-banner-text strong {
  color: #fff;
  font-size: 0.95rem;
}

.install-banner-text span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.install-banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.install-banner-dismiss {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 8px 12px;
}

.install-banner-install {
  --background: linear-gradient(135deg, #FF8C32, #FF6420);
  --border-radius: 8px;
  font-weight: 600;
}

/* ===== INSTALL PROMPT MODAL ===== */
.install-prompt-modal {
  --background: rgba(20, 20, 35, 0.98);
}

.install-prompt-content {
  padding: 32px 24px;
  text-align: center;
}

.install-prompt-preview {
  margin-bottom: 32px;
}

.app-icon-large {
  font-size: 4rem;
  margin-bottom: 16px;
}

.install-prompt-preview h2 {
  color: #fff;
  font-size: 1.5rem;
  margin: 0 0 8px 0;
}

.app-tagline {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin: 0;
}

/* Benefits */
.install-benefits {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
  text-align: left;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.benefit-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.benefit-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.benefit-text strong {
  color: #fff;
  font-size: 0.95rem;
}

.benefit-text span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

/* Actions */
.install-prompt-actions {
  margin-bottom: 16px;
}

.install-button-primary {
  --background: linear-gradient(135deg, #FF8C32, #FF6420);
  --border-radius: 16px;
  font-weight: 700;
  font-size: 1rem;
  height: 56px;
  margin-bottom: 12px;
}

.install-prompt-skip {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 8px 16px;
}

.install-prompt-skip:hover {
  color: rgba(255, 255, 255, 0.7);
}

.install-note {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  margin: 0;
}

/* ===== OFFLINE INDICATOR ===== */
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  z-index: 10000;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.offline-icon {
  font-size: 1rem;
}
```

---

## Part 9: Index Export

Create `src/systems/pwa/index.ts`:

```typescript
// Context and hooks
export { PWAProvider, usePWA } from './PWAContext';

// Components
export { InstallBanner } from './InstallBanner';
export { InstallPrompt } from './InstallPrompt';
export { OfflineIndicator } from './OfflineIndicator';
```

---

## Part 10: HTML Setup

Update `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="#FF8C32" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Wojak Games" />

  <!-- Manifest -->
  <link rel="manifest" href="/manifest.json" />

  <!-- Icons -->
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/icons/icon-192.png" />

  <!-- Splash Screens for iOS (optional but recommended) -->
  <link rel="apple-touch-startup-image" href="/splash/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px)" />
  <link rel="apple-touch-startup-image" href="/splash/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px)" />
  <link rel="apple-touch-startup-image" href="/splash/splash-1242x2208.png" media="(device-width: 414px) and (device-height: 736px)" />
  <link rel="apple-touch-startup-image" href="/splash/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px)" />

  <title>Wojak Games</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

---

## Part 11: App Integration

```typescript
// In App.tsx or main entry
import { PWAProvider, InstallBanner, OfflineIndicator } from './systems/pwa';
import { register as registerServiceWorker } from './serviceWorkerRegistration';

// Register service worker
registerServiceWorker({
  onSuccess: () => console.log('App ready for offline use'),
  onUpdate: () => console.log('New version available'),
});

function App() {
  return (
    <PWAProvider>
      <AudioProvider>
        <HapticProvider>
          {/* Offline indicator at top */}
          <OfflineIndicator />

          {/* Your app content */}
          <IonApp>
            {/* ... */}
          </IonApp>

          {/* Install banner at bottom */}
          <InstallBanner position="bottom" />
        </HapticProvider>
      </AudioProvider>
    </PWAProvider>
  );
}
```

---

## Part 12: Create App Icons

You'll need these icon sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

**Tools to generate:**
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Maskable.app](https://maskable.app/) - For maskable icons

**Important:** Use maskable icons so they look good on all Android launchers.

---

## Implementation Checklist

- [ ] Create `public/manifest.json` with all required fields
- [ ] Create `public/sw.js` service worker
- [ ] Generate all icon sizes (72-512px)
- [ ] Create `serviceWorkerRegistration.ts`
- [ ] Create `src/systems/pwa/` folder structure
- [ ] Implement `PWAContext.tsx`
- [ ] Build `InstallBanner.tsx` component
- [ ] Build `InstallPrompt.tsx` component
- [ ] Build `OfflineIndicator.tsx` component
- [ ] Add PWA meta tags to `index.html`
- [ ] Wrap app with `PWAProvider`
- [ ] Register service worker in app entry
- [ ] Add `InstallBanner` and `OfflineIndicator` to app
- [ ] Test install prompt on Android Chrome
- [ ] Test install on iOS Safari (Add to Home Screen)
- [ ] Test offline mode
- [ ] Verify manifest with Chrome DevTools > Application

---

## Testing Checklist

- [ ] Manifest loads correctly (check DevTools > Application > Manifest)
- [ ] Service worker registers (check DevTools > Application > Service Workers)
- [ ] Install prompt appears after 3 games played
- [ ] "Later" dismisses banner for 24 hours
- [ ] Install button triggers native install dialog
- [ ] App installs to home screen
- [ ] Installed app opens in standalone mode (no browser bar)
- [ ] Offline indicator shows when connection lost
- [ ] App works offline (at least shows cached content)
- [ ] iOS "Add to Home Screen" works

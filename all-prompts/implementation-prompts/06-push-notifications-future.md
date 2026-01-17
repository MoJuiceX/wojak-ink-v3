# IMPLEMENTATION PROMPT 05: Push Notification Infrastructure (Future)

> ⚠️ **NOTE**: This prompt is for future reference. Implement this AFTER the core systems (Auth, Leaderboard, Guilds, Currency) are working.

## Overview
Build a PWA-based push notification system using Service Workers and the Web Push API to re-engage users with timely, relevant notifications about their games, guilds, and achievements.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 PUSH NOTIFICATION SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER'S DEVICE                                                   │
│  ├── Browser requests permission                                │
│  ├── Service Worker registers                                   │
│  └── Push subscription created (endpoint + keys)                │
│                                                                  │
│  YOUR SERVER                                                     │
│  ├── Stores push subscriptions per user                         │
│  ├── VAPID keys for authentication                              │
│  └── Sends notifications via Web Push Protocol                  │
│                                                                  │
│  NOTIFICATION TYPES                                              │
│  ├── Game Challenges: "Daily challenge available!"              │
│  ├── Leaderboard: "Someone beat your high score!"               │
│  ├── Guild: "Your guild needs you!"                             │
│  ├── Rewards: "Claim your daily reward!"                        │
│  └── Social: "Friend joined Wojak Games!"                       │
│                                                                  │
│  DELIVERY                                                        │
│  ├── Goes to ALL subscribed devices                             │
│  ├── Works even when browser is closed                          │
│  └── User controls preferences                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: How Push Notifications Work

### The Flow:
```
1. User visits your PWA
2. You ask for notification permission
3. User grants permission → Browser generates push subscription
4. You send subscription to your server
5. Server stores subscription linked to user account
6. When you want to notify user:
   - Server creates notification payload
   - Server signs it with VAPID private key
   - Server sends to push endpoint (browser's push service)
   - Push service delivers to user's browser
   - Service Worker receives and displays notification
```

### Key Components:
- **VAPID Keys**: Cryptographic key pair that identifies your server
- **Push Subscription**: Unique endpoint URL + encryption keys for each device
- **Service Worker**: JavaScript that runs in the background, handles push events
- **Push Service**: Browser vendor's server (Google for Chrome, Mozilla for Firefox)

---

## Part 2: Server Setup

### 2.1 Generate VAPID Keys
```bash
# Using web-push library
npx web-push generate-vapid-keys
```

Store these in environment variables:
```env
VAPID_PUBLIC_KEY=BEl62i...
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:your@email.com
```

### 2.2 Backend Dependencies
```bash
npm install web-push
```

### 2.3 Push Service (Node.js)
Create `server/services/pushService.ts`:

```typescript
import webPush from 'web-push';

// Configure VAPID
webPush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string; // Group similar notifications
  data?: {
    url?: string; // Where to navigate on click
    type?: string;
    [key: string]: any;
  };
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

// Send notification to a single subscription
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    await webPush.sendNotification(
      subscription,
      JSON.stringify(payload),
      {
        TTL: 60 * 60 * 24, // 24 hours
        urgency: 'normal'
      }
    );
    return true;
  } catch (error: any) {
    // Subscription expired or invalid
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Remove this subscription from database
      return false;
    }
    console.error('Push notification failed:', error);
    return false;
  }
}

// Send to all of a user's subscriptions
export async function sendToUser(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  // Fetch all subscriptions for this user from database
  const subscriptions = await db.pushSubscriptions.findMany({
    where: { userId }
  });

  const results = await Promise.all(
    subscriptions.map(sub => sendPushNotification(sub.subscription, payload))
  );

  // Remove failed subscriptions
  const failedIndices = results
    .map((success, i) => !success ? i : -1)
    .filter(i => i >= 0);

  if (failedIndices.length > 0) {
    const failedIds = failedIndices.map(i => subscriptions[i].id);
    await db.pushSubscriptions.deleteMany({
      where: { id: { in: failedIds } }
    });
  }
}

// Notification Templates
export const NotificationTemplates = {
  dailyReward: (): NotificationPayload => ({
    title: '🍊 Daily Reward Available!',
    body: 'Your daily reward is waiting. Don\'t break your streak!',
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge.png',
    tag: 'daily-reward',
    data: {
      url: '/rewards',
      type: 'daily_reward'
    }
  }),

  highScoreBeaten: (gameName: string, newHolder: string): NotificationPayload => ({
    title: '😱 Your Record Was Beaten!',
    body: `${newHolder} just beat your high score in ${gameName}!`,
    icon: '/icons/notification-icon.png',
    tag: 'high-score',
    data: {
      url: `/games/${gameName.toLowerCase().replace(' ', '-')}`,
      type: 'high_score_beaten'
    },
    actions: [
      { action: 'play', title: 'Play Now' },
      { action: 'view', title: 'View Leaderboard' }
    ]
  }),

  guildChallenge: (guildName: string): NotificationPayload => ({
    title: `⚔️ [${guildName}] Needs You!`,
    body: 'Your guild is in a close competition. Every point counts!',
    icon: '/icons/notification-icon.png',
    tag: 'guild',
    data: {
      url: '/guild',
      type: 'guild_challenge'
    }
  }),

  newAchievement: (achievementName: string): NotificationPayload => ({
    title: '🏆 Achievement Unlocked!',
    body: `You earned "${achievementName}"! Claim your reward.`,
    icon: '/icons/notification-icon.png',
    tag: 'achievement',
    data: {
      url: '/achievements',
      type: 'achievement'
    }
  }),

  friendJoined: (friendName: string): NotificationPayload => ({
    title: '👋 Friend Joined!',
    body: `${friendName} just joined Wojak Games!`,
    icon: '/icons/notification-icon.png',
    tag: 'social',
    data: {
      url: '/friends',
      type: 'friend_joined'
    }
  })
};
```

---

## Part 3: Frontend Implementation

### 3.1 Service Worker
Create `public/sw.js`:

```javascript
// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push received:', event);

  let payload = {
    title: 'Wojak Games',
    body: 'You have a new notification!',
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge.png'
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/icons/notification-icon.png',
    badge: payload.badge || '/icons/badge.png',
    image: payload.image,
    tag: payload.tag || 'default',
    data: payload.data || {},
    actions: payload.actions || [],
    vibrate: [100, 50, 100],
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  // Handle action buttons
  if (event.action === 'play') {
    // Navigate to game
  } else if (event.action === 'view') {
    // Navigate to leaderboard
  }

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

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  // Track dismissed notifications for analytics
  console.log('Notification closed:', event.notification.tag);
});
```

### 3.2 Push Notification Context
Create `src/contexts/NotificationContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface NotificationPreferences {
  dailyRewards: boolean;
  highScoreBeaten: boolean;
  guildUpdates: boolean;
  achievements: boolean;
  social: boolean;
}

interface NotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  preferences: NotificationPreferences;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    dailyRewards: true,
    highScoreBeaten: true,
    guildUpdates: true,
    achievements: true,
    social: true
  });

  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

  // Check current status on mount
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, [isSupported]);

  // Load preferences when user changes
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  // Subscribe to push notifications
  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') return false;

    try {
      // Register service worker if not already
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();

      // Create new subscription if none exists
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error subscribing:', error);
      return false;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe locally
        await subscription.unsubscribe();

        // Remove from server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint
          })
        });
      }

      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  };

  // Update notification preferences
  const updatePreferences = async (prefs: Partial<NotificationPreferences>) => {
    const newPrefs = { ...preferences, ...prefs };

    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ preferences: newPrefs })
      });

      setPreferences(newPrefs);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        isSupported,
        permission,
        isSubscribed,
        preferences,
        requestPermission,
        subscribe,
        unsubscribe,
        updatePreferences
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

### 3.3 Notification Settings Component
Create `src/components/Settings/NotificationSettings.tsx`:

```typescript
import React from 'react';
import { IonList, IonItem, IonLabel, IonToggle, IonButton, IonNote } from '@ionic/react';
import { useNotifications } from '../../contexts/NotificationContext';
import './Settings.css';

export const NotificationSettings: React.FC = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    preferences,
    requestPermission,
    subscribe,
    unsubscribe,
    updatePreferences
  } = useNotifications();

  const handleEnableNotifications = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    await subscribe();
  };

  if (!isSupported) {
    return (
      <div className="notifications-unsupported">
        <p>Push notifications are not supported in this browser.</p>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="notifications-blocked">
        <p>Notifications are blocked. Please enable them in your browser settings.</p>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="settings-header">
        <h3>Push Notifications</h3>
        {!isSubscribed ? (
          <IonButton onClick={handleEnableNotifications}>
            Enable Notifications
          </IonButton>
        ) : (
          <IonButton fill="outline" color="danger" onClick={unsubscribe}>
            Disable All
          </IonButton>
        )}
      </div>

      {isSubscribed && (
        <IonList className="preferences-list">
          <IonItem>
            <IonLabel>
              <h2>Daily Rewards</h2>
              <IonNote>Remind me to claim daily rewards</IonNote>
            </IonLabel>
            <IonToggle
              checked={preferences.dailyRewards}
              onIonChange={(e) => updatePreferences({ dailyRewards: e.detail.checked })}
            />
          </IonItem>

          <IonItem>
            <IonLabel>
              <h2>High Score Alerts</h2>
              <IonNote>Notify when someone beats my score</IonNote>
            </IonLabel>
            <IonToggle
              checked={preferences.highScoreBeaten}
              onIonChange={(e) => updatePreferences({ highScoreBeaten: e.detail.checked })}
            />
          </IonItem>

          <IonItem>
            <IonLabel>
              <h2>Guild Updates</h2>
              <IonNote>Guild challenges and competitions</IonNote>
            </IonLabel>
            <IonToggle
              checked={preferences.guildUpdates}
              onIonChange={(e) => updatePreferences({ guildUpdates: e.detail.checked })}
            />
          </IonItem>

          <IonItem>
            <IonLabel>
              <h2>Achievements</h2>
              <IonNote>New achievements unlocked</IonNote>
            </IonLabel>
            <IonToggle
              checked={preferences.achievements}
              onIonChange={(e) => updatePreferences({ achievements: e.detail.checked })}
            />
          </IonItem>

          <IonItem>
            <IonLabel>
              <h2>Social</h2>
              <IonNote>Friends joining and activity</IonNote>
            </IonLabel>
            <IonToggle
              checked={preferences.social}
              onIonChange={(e) => updatePreferences({ social: e.detail.checked })}
            />
          </IonItem>
        </IonList>
      )}
    </div>
  );
};
```

---

## Part 4: Backend API Endpoints

```typescript
// POST /api/notifications/subscribe
// Save push subscription for user
{
  request: {
    subscription: PushSubscription
  },
  response: { success: boolean }
}

// POST /api/notifications/unsubscribe
// Remove push subscription
{
  request: {
    endpoint: string
  },
  response: { success: boolean }
}

// GET /api/notifications/preferences
// Get user's notification preferences
{
  response: {
    preferences: NotificationPreferences
  }
}

// PUT /api/notifications/preferences
// Update notification preferences
{
  request: {
    preferences: NotificationPreferences
  },
  response: { success: boolean }
}

// POST /api/notifications/send (internal/admin)
// Send notification to user(s)
{
  request: {
    userIds: string[],
    payload: NotificationPayload
  },
  response: { sent: number, failed: number }
}
```

---

## Part 5: Database Schema

```sql
-- Push subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  daily_rewards BOOLEAN DEFAULT TRUE,
  high_score_beaten BOOLEAN DEFAULT TRUE,
  guild_updates BOOLEAN DEFAULT TRUE,
  achievements BOOLEAN DEFAULT TRUE,
  social BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification log (for analytics)
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  payload JSONB,
  sent_at TIMESTAMP DEFAULT NOW(),
  clicked_at TIMESTAMP,
  dismissed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX idx_notification_log_user ON notification_log(user_id, sent_at);
```

---

## Part 6: Triggering Notifications

### When to Send Notifications:

```typescript
// 1. Daily Reward Reminder (scheduled job)
// Run at 10am, 3pm, 8pm local time for users who haven't claimed
async function sendDailyRewardReminders() {
  const usersWithUnclaimedRewards = await getUsersWithUnclaimedRewards();

  for (const user of usersWithUnclaimedRewards) {
    if (user.preferences.dailyRewards) {
      await sendToUser(user.id, NotificationTemplates.dailyReward());
    }
  }
}

// 2. High Score Beaten (event-driven)
// Called when a new high score is set
async function onNewHighScore(gameId: string, newHolderId: string, previousHolderId: string) {
  const previousHolder = await getUser(previousHolderId);
  const newHolder = await getUser(newHolderId);
  const game = await getGame(gameId);

  if (previousHolder.preferences.highScoreBeaten) {
    await sendToUser(
      previousHolderId,
      NotificationTemplates.highScoreBeaten(game.name, newHolder.username)
    );
  }
}

// 3. Guild Competition (scheduled during active events)
async function sendGuildReminders() {
  const activeGuildWars = await getActiveGuildWars();

  for (const war of activeGuildWars) {
    // Only notify if competition is close
    if (war.scoreDifference < 100) {
      const members = await getGuildMembers(war.guildId);

      for (const member of members) {
        if (member.preferences.guildUpdates) {
          await sendToUser(
            member.userId,
            NotificationTemplates.guildChallenge(war.guildName)
          );
        }
      }
    }
  }
}

// 4. Achievement Unlocked (event-driven)
async function onAchievementUnlocked(userId: string, achievementId: string) {
  const user = await getUser(userId);
  const achievement = await getAchievement(achievementId);

  if (user.preferences.achievements) {
    await sendToUser(userId, NotificationTemplates.newAchievement(achievement.name));
  }
}
```

---

## Part 7: PWA Manifest Requirements

Update `public/manifest.json`:

```json
{
  "name": "Wojak Games",
  "short_name": "Wojak",
  "description": "Play fun games and compete with your friends!",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f1a",
  "theme_color": "#FF8C32",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Implementation Checklist (For Future)

- [ ] Generate VAPID keys and store in environment
- [ ] Create Service Worker with push handling
- [ ] Implement NotificationContext
- [ ] Build NotificationSettings UI
- [ ] Create backend push service
- [ ] Set up database tables for subscriptions
- [ ] Implement subscription endpoints
- [ ] Create notification templates
- [ ] Set up scheduled jobs for reminders
- [ ] Integrate event-driven notifications
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Add analytics for notification engagement

---

## Important Notes

### Multi-Device Support
- One user can have multiple push subscriptions (phone + desktop + tablet)
- Each device has its own subscription endpoint
- Notifications go to ALL subscribed devices
- Users can manage which devices receive notifications

### NOT Email
- Push notifications are completely separate from email
- You can also implement email notifications as a complementary system
- Push = instant, native | Email = less urgent, more detailed

### Browser Support
- Chrome: Full support
- Firefox: Full support
- Safari: Requires additional setup (APNs)
- Edge: Full support
- iOS Safari: Limited support (requires PWA to be installed)

### Best Practices
- Don't spam users - limit to important, actionable notifications
- Respect user preferences
- Use notification tags to group similar notifications
- Always provide value - users will disable if notifications are annoying
- Test timing - don't send notifications at night

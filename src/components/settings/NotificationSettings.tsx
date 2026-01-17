/**
 * Notification Settings Component
 *
 * UI for managing push notification preferences.
 */

import React, { useState } from 'react';
import {
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonButton,
  IonNote,
  IonSpinner,
} from '@ionic/react';
import { useNotifications } from '../../contexts/NotificationContext';
import './NotificationSettings.css';

export const NotificationSettings: React.FC = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    preferences,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    updatePreferences,
    sendTestNotification,
  } = useNotifications();

  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const handleEnableNotifications = async () => {
    setIsEnabling(true);
    try {
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setIsEnabling(false);
          return;
        }
      }
      await subscribe();
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsDisabling(true);
    try {
      await unsubscribe();
    } finally {
      setIsDisabling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="notification-settings loading">
        <IonSpinner name="crescent" />
        <p>Loading notification settings...</p>
      </div>
    );
  }

  // Push notifications not supported
  if (!isSupported) {
    return (
      <div className="notification-settings unsupported">
        <div className="unsupported-icon">🔕</div>
        <h3>Not Supported</h3>
        <p>Push notifications are not supported in this browser.</p>
        <p className="hint">Try using Chrome, Firefox, or Edge for the best experience.</p>
      </div>
    );
  }

  // Permission denied by user
  if (permission === 'denied') {
    return (
      <div className="notification-settings blocked">
        <div className="blocked-icon">🚫</div>
        <h3>Notifications Blocked</h3>
        <p>You have blocked notifications for this site.</p>
        <p className="hint">
          To enable notifications, click the lock icon in your browser's address bar and change the
          notification setting to "Allow".
        </p>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="settings-header">
        <div className="header-content">
          <h3>Push Notifications</h3>
          <p className="header-description">
            Stay updated with game challenges, rewards, and guild activity.
          </p>
        </div>

        {!isSubscribed ? (
          <IonButton
            onClick={handleEnableNotifications}
            disabled={isEnabling}
            className="enable-button"
          >
            {isEnabling ? <IonSpinner name="crescent" /> : 'Enable Notifications'}
          </IonButton>
        ) : (
          <div className="header-actions">
            <IonButton
              fill="outline"
              size="small"
              onClick={sendTestNotification}
              className="test-button"
            >
              Test
            </IonButton>
            <IonButton
              fill="outline"
              color="danger"
              size="small"
              onClick={handleDisableNotifications}
              disabled={isDisabling}
              className="disable-button"
            >
              {isDisabling ? <IonSpinner name="crescent" /> : 'Disable All'}
            </IonButton>
          </div>
        )}
      </div>

      {isSubscribed && (
        <>
          <div className="preferences-section">
            <h4>Notification Types</h4>
            <p className="section-description">Choose which notifications you want to receive.</p>
          </div>

          <IonList className="preferences-list">
            <IonItem lines="full">
              <IonLabel>
                <h2>Daily Rewards</h2>
                <IonNote>Remind me to claim daily rewards</IonNote>
              </IonLabel>
              <IonToggle
                checked={preferences.dailyRewards}
                onIonChange={(e) => updatePreferences({ dailyRewards: e.detail.checked })}
              />
            </IonItem>

            <IonItem lines="full">
              <IonLabel>
                <h2>High Score Alerts</h2>
                <IonNote>Notify when someone beats my score</IonNote>
              </IonLabel>
              <IonToggle
                checked={preferences.highScoreBeaten}
                onIonChange={(e) => updatePreferences({ highScoreBeaten: e.detail.checked })}
              />
            </IonItem>

            <IonItem lines="full">
              <IonLabel>
                <h2>Guild Updates</h2>
                <IonNote>Guild challenges, invites, and competitions</IonNote>
              </IonLabel>
              <IonToggle
                checked={preferences.guildUpdates}
                onIonChange={(e) => updatePreferences({ guildUpdates: e.detail.checked })}
              />
            </IonItem>

            <IonItem lines="full">
              <IonLabel>
                <h2>Achievements</h2>
                <IonNote>New achievements unlocked</IonNote>
              </IonLabel>
              <IonToggle
                checked={preferences.achievements}
                onIonChange={(e) => updatePreferences({ achievements: e.detail.checked })}
              />
            </IonItem>

            <IonItem lines="none">
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

          <div className="notification-info">
            <p>
              Notifications are sent to all your subscribed devices. You can manage this separately
              on each device.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationSettings;

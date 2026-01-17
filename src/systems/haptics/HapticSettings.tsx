import React from 'react';
import { IonToggle, IonRange, IonIcon } from '@ionic/react';
import { phonePortrait, phoneLandscape } from 'ionicons/icons';
import { useHaptics } from './HapticContext';
import './haptics.css';

export const HapticSettings: React.FC = () => {
  const {
    isSupported,
    isEnabled,
    intensity,
    setEnabled,
    setIntensity,
    trigger
  } = useHaptics();

  // Test vibration on intensity change
  const handleIntensityChange = (value: number) => {
    setIntensity(value);
    trigger('medium'); // Test vibration
  };

  if (!isSupported) {
    return (
      <div className="haptic-settings not-supported">
        <p>Haptic feedback is not supported on this device.</p>
      </div>
    );
  }

  return (
    <div className="haptic-settings">
      <div className="setting-row">
        <div className="setting-label">
          <IonIcon icon={phonePortrait} />
          <span>Vibration</span>
        </div>
        <IonToggle
          checked={isEnabled}
          onIonChange={(e) => setEnabled(e.detail.checked)}
        />
      </div>

      {isEnabled && (
        <div className="setting-row">
          <div className="setting-label">
            <IonIcon icon={phoneLandscape} />
            <span>Intensity</span>
          </div>
          <IonRange
            min={0}
            max={100}
            value={intensity * 100}
            onIonChange={(e) => handleIntensityChange((e.detail.value as number) / 100)}
          />
        </div>
      )}

      {isEnabled && (
        <div className="haptic-test">
          <button
            className="test-button"
            onClick={() => trigger('high-score')}
          >
            Test Vibration
          </button>
        </div>
      )}
    </div>
  );
};

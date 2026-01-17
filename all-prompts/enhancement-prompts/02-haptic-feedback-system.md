# ENHANCEMENT PROMPT 02: Haptic Feedback System

## Priority: HIGH 🔥
Haptic feedback (vibration) makes mobile games feel tactile and responsive. It creates a physical connection between the player and the game.

---

## Overview

Create a haptic feedback system that:
1. Provides vibration feedback for game events
2. Supports different vibration patterns for different events
3. Gracefully degrades on devices without haptic support
4. Integrates with the sound system for synchronized feedback
5. Respects user preferences (can be disabled)

---

## Architecture

```
src/systems/haptics/
├── index.ts                 # Export everything
├── HapticManager.ts         # Core haptic manager
├── HapticContext.tsx        # React context
├── useGameHaptics.ts        # Hook for game integration
├── patterns.ts              # Vibration pattern definitions
└── HapticSettings.tsx       # Settings UI component
```

---

## Part 1: Haptic Patterns

Create `src/systems/haptics/patterns.ts`:

```typescript
/**
 * Vibration patterns for different game events
 *
 * Pattern format: number | number[]
 * - Single number: vibrate for that many milliseconds
 * - Array: [vibrate, pause, vibrate, pause, ...]
 *
 * Example: [100, 50, 100] = vibrate 100ms, pause 50ms, vibrate 100ms
 */

export type HapticPattern =
  | 'light'           // Light tap
  | 'medium'          // Medium tap
  | 'heavy'           // Heavy tap
  | 'score'           // Points earned
  | 'combo-1'         // Low combo
  | 'combo-2'         // Medium combo
  | 'combo-3'         // High combo
  | 'combo-max'       // Maximum combo
  | 'high-score'      // New high score
  | 'game-over'       // Game ended
  | 'success'         // Generic success
  | 'error'           // Generic error/fail
  | 'warning'         // Warning alert
  | 'button'          // Button press
  | 'achievement'     // Achievement unlocked
  | 'countdown'       // Countdown tick
  | 'countdown-go'    // Countdown GO!
  | 'collision'       // Hit/collision
  | 'level-up';       // Level up

export interface HapticDefinition {
  name: HapticPattern;
  pattern: number | number[];
  description: string;
}

export const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  // Basic taps
  'light': 10,
  'medium': 25,
  'heavy': 50,

  // Gameplay
  'score': 15,                          // Quick tap on score
  'combo-1': [20, 10, 20],              // Double tap for low combo
  'combo-2': [25, 15, 25, 15, 25],      // Triple tap for medium combo
  'combo-3': [30, 10, 30, 10, 30, 10, 30], // Quad tap for high combo
  'combo-max': [50, 20, 50, 20, 50, 20, 100], // Epic combo
  'collision': [40, 20, 30],            // Impact feeling

  // Game state
  'high-score': [100, 50, 100, 50, 200], // Celebration
  'game-over': [100, 100, 200],         // Finality
  'level-up': [50, 30, 50, 30, 100],    // Achievement feeling

  // UI
  'button': 10,                          // Subtle button feedback
  'success': [30, 20, 50],              // Positive feedback
  'error': [50, 30, 50, 30, 50],        // Negative feedback
  'warning': [40, 40, 40],              // Alert

  // Other
  'achievement': [50, 50, 50, 50, 150], // Special unlock
  'countdown': 30,                       // Countdown tick
  'countdown-go': [50, 30, 100],        // GO! moment
};

/**
 * Get haptic pattern based on combo level
 */
export const getComboHaptic = (comboLevel: number): HapticPattern => {
  if (comboLevel >= 10) return 'combo-max';
  if (comboLevel >= 7) return 'combo-3';
  if (comboLevel >= 4) return 'combo-2';
  if (comboLevel >= 2) return 'combo-1';
  return 'score'; // Level 1 is just a score tap
};

/**
 * Scale a pattern's intensity (multiply all values)
 */
export const scalePattern = (
  pattern: number | number[],
  scale: number
): number | number[] => {
  if (typeof pattern === 'number') {
    return Math.round(pattern * scale);
  }
  return pattern.map(v => Math.round(v * scale));
};
```

---

## Part 2: Haptic Manager

Create `src/systems/haptics/HapticManager.ts`:

```typescript
import { HapticPattern, HAPTIC_PATTERNS, scalePattern } from './patterns';

class HapticManagerClass {
  private isSupported: boolean = false;
  private isEnabled: boolean = true;
  private intensity: number = 1; // 0-1 scale

  constructor() {
    // Check for vibration support
    this.isSupported = 'vibrate' in navigator;
    this.loadPreferences();
  }

  /**
   * Check if haptics are supported on this device
   */
  getIsSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if haptics are currently enabled
   */
  getIsEnabled(): boolean {
    return this.isEnabled && this.isSupported;
  }

  /**
   * Get current intensity setting
   */
  getIntensity(): number {
    return this.intensity;
  }

  /**
   * Trigger a haptic pattern
   */
  trigger(pattern: HapticPattern): void {
    if (!this.isSupported || !this.isEnabled) return;

    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    if (!vibrationPattern) {
      console.warn(`Haptic pattern not found: ${pattern}`);
      return;
    }

    // Scale pattern by intensity
    const scaledPattern = scalePattern(vibrationPattern, this.intensity);

    try {
      navigator.vibrate(scaledPattern);
    } catch (error) {
      console.debug('Vibration failed:', error);
    }
  }

  /**
   * Trigger a custom vibration pattern
   */
  triggerCustom(pattern: number | number[]): void {
    if (!this.isSupported || !this.isEnabled) return;

    const scaledPattern = scalePattern(pattern, this.intensity);

    try {
      navigator.vibrate(scaledPattern);
    } catch (error) {
      console.debug('Vibration failed:', error);
    }
  }

  /**
   * Stop any ongoing vibration
   */
  stop(): void {
    if (!this.isSupported) return;

    try {
      navigator.vibrate(0);
    } catch (error) {
      // Ignore
    }
  }

  /**
   * Enable or disable haptics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.savePreferences();

    // Stop any current vibration when disabling
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Toggle enabled state
   */
  toggleEnabled(): boolean {
    this.setEnabled(!this.isEnabled);
    return this.isEnabled;
  }

  /**
   * Set intensity (0-1)
   */
  setIntensity(intensity: number): void {
    this.intensity = Math.max(0, Math.min(1, intensity));
    this.savePreferences();
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    const prefs = {
      isEnabled: this.isEnabled,
      intensity: this.intensity
    };
    localStorage.setItem('wojak-haptic-prefs', JSON.stringify(prefs));
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('wojak-haptic-prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        this.isEnabled = prefs.isEnabled ?? true;
        this.intensity = prefs.intensity ?? 1;
      }
    } catch (e) {
      // Use defaults
    }
  }
}

// Singleton instance
export const HapticManager = new HapticManagerClass();
```

---

## Part 3: React Haptic Context

Create `src/systems/haptics/HapticContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { HapticManager } from './HapticManager';
import { HapticPattern, getComboHaptic } from './patterns';

interface HapticContextType {
  // State
  isSupported: boolean;
  isEnabled: boolean;
  intensity: number;

  // Actions
  trigger: (pattern: HapticPattern) => void;
  triggerCombo: (level: number) => void;
  stop: () => void;
  setEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
  setIntensity: (intensity: number) => void;
}

const HapticContext = createContext<HapticContextType | undefined>(undefined);

export const HapticProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabledState] = useState(HapticManager.getIsEnabled());
  const [intensity, setIntensityState] = useState(HapticManager.getIntensity());

  const isSupported = HapticManager.getIsSupported();

  // Trigger a haptic pattern
  const trigger = useCallback((pattern: HapticPattern) => {
    HapticManager.trigger(pattern);
  }, []);

  // Trigger combo haptic based on level
  const triggerCombo = useCallback((level: number) => {
    const pattern = getComboHaptic(level);
    HapticManager.trigger(pattern);
  }, []);

  // Stop vibration
  const stop = useCallback(() => {
    HapticManager.stop();
  }, []);

  // Set enabled state
  const setEnabled = useCallback((enabled: boolean) => {
    HapticManager.setEnabled(enabled);
    setIsEnabledState(enabled);
  }, []);

  // Toggle enabled
  const toggleEnabled = useCallback(() => {
    const newEnabled = HapticManager.toggleEnabled();
    setIsEnabledState(newEnabled);
  }, []);

  // Set intensity
  const setIntensity = useCallback((newIntensity: number) => {
    HapticManager.setIntensity(newIntensity);
    setIntensityState(newIntensity);
  }, []);

  return (
    <HapticContext.Provider
      value={{
        isSupported,
        isEnabled,
        intensity,
        trigger,
        triggerCombo,
        stop,
        setEnabled,
        toggleEnabled,
        setIntensity
      }}
    >
      {children}
    </HapticContext.Provider>
  );
};

export const useHaptics = () => {
  const context = useContext(HapticContext);
  if (!context) {
    throw new Error('useHaptics must be used within HapticProvider');
  }
  return context;
};
```

---

## Part 4: Game Haptics Hook

Create `src/systems/haptics/useGameHaptics.ts`:

```typescript
import { useCallback } from 'react';
import { useHaptics } from './HapticContext';
import { HapticPattern } from './patterns';

/**
 * Hook for game-specific haptic triggers
 * Use this in games instead of useHaptics directly
 */
export const useGameHaptics = () => {
  const { trigger, triggerCombo, isSupported, isEnabled } = useHaptics();

  // Score earned
  const hapticScore = useCallback(() => {
    trigger('score');
  }, [trigger]);

  // Combo achieved
  const hapticCombo = useCallback((level: number) => {
    triggerCombo(level);
  }, [triggerCombo]);

  // New high score
  const hapticHighScore = useCallback(() => {
    trigger('high-score');
  }, [trigger]);

  // Game over
  const hapticGameOver = useCallback(() => {
    trigger('game-over');
  }, [trigger]);

  // Collision/hit
  const hapticCollision = useCallback(() => {
    trigger('collision');
  }, [trigger]);

  // Level up
  const hapticLevelUp = useCallback(() => {
    trigger('level-up');
  }, [trigger]);

  // Achievement
  const hapticAchievement = useCallback(() => {
    trigger('achievement');
  }, [trigger]);

  // Countdown tick
  const hapticCountdown = useCallback(() => {
    trigger('countdown');
  }, [trigger]);

  // Countdown GO!
  const hapticCountdownGo = useCallback(() => {
    trigger('countdown-go');
  }, [trigger]);

  // Button press
  const hapticButton = useCallback(() => {
    trigger('button');
  }, [trigger]);

  // Success feedback
  const hapticSuccess = useCallback(() => {
    trigger('success');
  }, [trigger]);

  // Error feedback
  const hapticError = useCallback(() => {
    trigger('error');
  }, [trigger]);

  // Warning
  const hapticWarning = useCallback(() => {
    trigger('warning');
  }, [trigger]);

  return {
    // Game events
    hapticScore,
    hapticCombo,
    hapticHighScore,
    hapticGameOver,
    hapticCollision,
    hapticLevelUp,
    hapticAchievement,
    hapticCountdown,
    hapticCountdownGo,

    // UI events
    hapticButton,
    hapticSuccess,
    hapticError,
    hapticWarning,

    // State
    isSupported,
    isEnabled,

    // Raw trigger for custom patterns
    trigger
  };
};
```

---

## Part 5: Haptic Settings Component

Create `src/systems/haptics/HapticSettings.tsx`:

```typescript
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
```

---

## Part 6: CSS Styles

Create `src/systems/haptics/haptics.css`:

```css
/* Haptic Settings */
.haptic-settings {
  padding: 16px;
}

.haptic-settings.not-supported {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.haptic-settings .setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.haptic-settings .setting-row:last-child {
  border-bottom: none;
}

.haptic-settings .setting-label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
}

.haptic-settings .setting-label ion-icon {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
}

.haptic-test {
  margin-top: 16px;
  text-align: center;
}

.test-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(255, 140, 50, 0.3), rgba(255, 100, 50, 0.2));
  border: 1px solid rgba(255, 140, 50, 0.4);
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-button:hover {
  background: linear-gradient(135deg, rgba(255, 140, 50, 0.4), rgba(255, 100, 50, 0.3));
}

.test-button:active {
  transform: scale(0.98);
}
```

---

## Part 7: Index Export

Create `src/systems/haptics/index.ts`:

```typescript
// Context and hooks
export { HapticProvider, useHaptics } from './HapticContext';
export { useGameHaptics } from './useGameHaptics';

// Components
export { HapticSettings } from './HapticSettings';

// Manager (for direct access if needed)
export { HapticManager } from './HapticManager';

// Patterns
export { HAPTIC_PATTERNS, getComboHaptic, scalePattern } from './patterns';
export type { HapticPattern } from './patterns';
```

---

## Part 8: Integration with useGameSession

Update `src/systems/engagement/useGameSession.ts` to auto-trigger haptics:

```typescript
// Add to imports
import { useGameHaptics } from '../haptics/useGameHaptics';

// Inside useGameSession hook:
const {
  hapticScore,
  hapticCombo,
  hapticHighScore,
  hapticGameOver,
  hapticLevelUp
} = useGameHaptics();

// In addScore function:
const addScore = useCallback((points: number, position?: { x: number; y: number }) => {
  hapticScore(); // Add this
  playScore(points);
  setState(prev => { /* ... */ });
}, [hapticScore, playScore, triggerEffect]);

// In incrementCombo function:
const incrementCombo = useCallback((position?: { x: number; y: number }) => {
  setState(prev => {
    const newCombo = prev.combo + 1;
    hapticCombo(newCombo); // Add this
    playComboSound(newCombo);
    // ... rest of combo logic
    return { /* ... */ };
  });
}, [hapticCombo, playComboSound, triggerPreset]);

// In endGame function:
const endGame = useCallback(async () => {
  if (isNewHighScore) {
    hapticHighScore(); // Add this
    playHighScore();
  } else {
    hapticGameOver(); // Add this
    playGameOver();
  }
  // ... rest of end game logic
}, [hapticHighScore, hapticGameOver, playHighScore, playGameOver, /* ... */]);
```

---

## Part 9: Combined Feedback Hook

Create a hook that triggers both sound and haptics together:

Create `src/systems/feedback/useFeedback.ts`:

```typescript
import { useCallback } from 'react';
import { useGameSounds } from '../audio/useGameSounds';
import { useGameHaptics } from '../haptics/useGameHaptics';

/**
 * Combined feedback hook - triggers both sound and haptics
 * Use this for synchronized audio-haptic feedback
 */
export const useFeedback = () => {
  const sounds = useGameSounds();
  const haptics = useGameHaptics();

  // Score feedback (sound + haptic)
  const feedbackScore = useCallback(() => {
    sounds.playScore();
    haptics.hapticScore();
  }, [sounds, haptics]);

  // Combo feedback
  const feedbackCombo = useCallback((level: number) => {
    sounds.playComboSound(level);
    haptics.hapticCombo(level);
  }, [sounds, haptics]);

  // High score feedback
  const feedbackHighScore = useCallback(() => {
    sounds.playHighScore();
    haptics.hapticHighScore();
  }, [sounds, haptics]);

  // Game over feedback
  const feedbackGameOver = useCallback(() => {
    sounds.playGameOver();
    haptics.hapticGameOver();
  }, [sounds, haptics]);

  // Button press feedback
  const feedbackButton = useCallback(() => {
    sounds.playButtonClick();
    haptics.hapticButton();
  }, [sounds, haptics]);

  // Achievement feedback
  const feedbackAchievement = useCallback(() => {
    sounds.playAchievement();
    haptics.hapticAchievement();
  }, [sounds, haptics]);

  // Success feedback
  const feedbackSuccess = useCallback(() => {
    sounds.playSuccess();
    haptics.hapticSuccess();
  }, [sounds, haptics]);

  // Error feedback
  const feedbackError = useCallback(() => {
    sounds.playError();
    haptics.hapticError();
  }, [sounds, haptics]);

  return {
    feedbackScore,
    feedbackCombo,
    feedbackHighScore,
    feedbackGameOver,
    feedbackButton,
    feedbackAchievement,
    feedbackSuccess,
    feedbackError,

    // Also expose individual systems
    sounds,
    haptics
  };
};
```

---

## Part 10: App Integration

Wrap your app with HapticProvider (alongside AudioProvider):

```typescript
// In App.tsx or main entry
import { AudioProvider } from './systems/audio';
import { HapticProvider } from './systems/haptics';

function App() {
  return (
    <AudioProvider>
      <HapticProvider>
        {/* ... rest of app */}
      </HapticProvider>
    </AudioProvider>
  );
}
```

---

## Device Compatibility

### Supported Devices:
- ✅ Android Chrome (best support)
- ✅ Android Firefox
- ✅ Android Edge
- ⚠️ iOS Safari (limited - only works in some contexts)
- ❌ Desktop browsers (no vibration motor)

### Graceful Degradation:
The system checks `'vibrate' in navigator` and silently skips vibration on unsupported devices. No errors, no warnings to users.

---

## Implementation Checklist

- [ ] Create `src/systems/haptics/` folder structure
- [ ] Implement `patterns.ts` with haptic definitions
- [ ] Implement `HapticManager.ts` class
- [ ] Create `HapticContext.tsx` provider
- [ ] Create `useGameHaptics.ts` hook
- [ ] Build `HapticSettings.tsx` component
- [ ] Add CSS styles
- [ ] Create index exports
- [ ] Create combined `useFeedback.ts` hook
- [ ] Wrap app with `HapticProvider`
- [ ] Integrate with `useGameSession`
- [ ] Test on Android device
- [ ] Test on iOS device
- [ ] Verify settings persist
- [ ] Verify graceful degradation on desktop

---

## Testing Checklist

- [ ] Vibration triggers on score
- [ ] Vibration intensity increases with combo level
- [ ] High score vibration is distinct
- [ ] Game over vibration is appropriate (not punishing)
- [ ] Button presses have subtle feedback
- [ ] Toggle works correctly
- [ ] Intensity slider affects vibration strength
- [ ] Settings persist after app restart
- [ ] No errors on desktop (graceful fallback)
- [ ] No excessive battery drain

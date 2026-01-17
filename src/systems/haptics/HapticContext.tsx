import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { HapticManager } from './HapticManager';
import { type HapticPattern, getComboHaptic } from './patterns';

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

/**
 * Haptic Feedback System
 *
 * Provides vibration feedback for game events on supported devices.
 *
 * Usage:
 *   import { HapticProvider, useHaptics, useGameHaptics } from '@/systems/haptics';
 *
 *   // Wrap app with provider
 *   <HapticProvider>
 *     <App />
 *   </HapticProvider>
 *
 *   // In game components
 *   const { hapticScore, hapticCombo, hapticGameOver } = useGameHaptics();
 *   hapticScore(); // On score
 *   hapticCombo(5); // On combo level 5
 */

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

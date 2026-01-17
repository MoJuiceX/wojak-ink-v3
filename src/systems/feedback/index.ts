/**
 * Feedback System
 *
 * Combined audio + haptic feedback for games.
 *
 * Usage:
 *   import { useFeedback } from '@/systems/feedback';
 *
 *   const { feedbackScore, feedbackCombo } = useFeedback();
 *   feedbackScore(); // Sound + vibration
 */

export { useFeedback } from './useFeedback';

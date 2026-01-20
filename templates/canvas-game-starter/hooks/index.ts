/**
 * Game Hooks
 * Re-export all hooks for easy importing
 */

export { useGameLoop, type UseGameLoopReturn } from './useGameLoop';
export { useAudio, type UseAudioReturn, type SoundType, type SoundOptions } from './useAudio';
export {
  useInput,
  type UseInputReturn,
  type InputAction,
  type Point,
  type Pointer,
  type TouchInfo,
} from './useInput';

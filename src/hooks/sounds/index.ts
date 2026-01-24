/**
 * Game Sound Modules
 *
 * Modular sound effect exports organized by game.
 */

// Shared audio utilities
export {
  getAudioContext,
  volumeMultiplier,
  setVolumeMultiplier,
  createSparkleCascade,
} from './audio-context';

// Memory Match sounds
export {
  createCardHoverSound,
  createCardFlipSound,
  createMatchFoundSound,
  createFastMatchBonus,
  createAnticipationSound,
  createMismatchSound,
} from './memory-match';

// Generic game sounds (win sounds, block land, combo, etc.)
export {
  WIN_SOUNDS,
  createWinSparkle,
  createWinArpeggio,
  createWinBubbles,
  createWinBell,
  createWinShimmer,
  createBlockLandSound,
  createPerfectBonusSound,
  createComboSound,
  createSoftPop,
  createChimeTail,
} from './generic';

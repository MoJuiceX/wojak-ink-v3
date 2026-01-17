// Provider and hooks
export { EffectsProvider, useEffects } from './EffectsProvider';
export type { Effect, EffectType, EffectPreset } from './EffectsProvider';

// Layer component
export { EffectsLayer } from './EffectsLayer';

// Individual components (for direct use if needed)
export { Shockwave } from './components/Shockwave';
export { Sparks } from './components/Sparks';
export { Confetti } from './components/Confetti';
export { ComboText } from './components/ComboText';
export { FloatingEmoji } from './components/FloatingEmoji';
export { ScorePopup } from './components/ScorePopup';
export { ScreenShake } from './components/ScreenShake';
export { Lightning } from './components/Lightning';
export { SpeedLines } from './components/SpeedLines';
export { VignettePulse } from './components/VignettePulse';

// Presets
export { getComboPreset, getScoreMilestonePreset } from './presets/combo';
export { getGameOverPreset, getAchievementUnlockPreset, getVictoryPreset, getDefeatPreset } from './presets/gameOver';
export { getAchievementPreset, getMilestonePreset } from './presets/achievement';
export type { Achievement } from './presets/achievement';

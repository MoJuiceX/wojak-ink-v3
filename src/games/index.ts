/**
 * Wojak Games - Main Export
 *
 * All games are migrated to use the shared systems architecture.
 * Import games from this index for consistent behavior.
 */

// Game Components
// Note: OrangeStack removed - use BrickByBrick from /src/pages/ instead
export { default as MemoryMatch } from './MemoryMatch';
export { default as OrangePong } from './OrangePong';
export { default as WojakRunner } from './WojakRunner';
export { default as OrangeJuggle } from './OrangeJuggle';
export { default as KnifeGame } from './KnifeGame';
export { default as ColorReaction } from './ColorReaction';
export { default as Orange2048 } from './Orange2048';

// Game Configs
export { MEMORY_MATCH_CONFIG } from './MemoryMatch/config';
export { ORANGE_PONG_CONFIG } from './OrangePong/config';
export { WOJAK_RUNNER_CONFIG } from './WojakRunner/config';
export { ORANGE_JUGGLE_CONFIG } from './OrangeJuggle/config';
export { KNIFE_GAME_CONFIG } from './KnifeGame/config';
export { COLOR_REACTION_CONFIG } from './ColorReaction/config';
export { ORANGE_2048_CONFIG } from './Orange2048/config';

// Game types
export type { GameConfig, GameState } from '@/systems/game-ui/types';

// All game configs for dynamic loading
export const ALL_GAME_CONFIGS = [
  { id: 'brick-by-brick', name: 'Brick by Brick', emoji: '🧱', component: 'BrickByBrick' },
  { id: 'memory-match', name: 'Memory Match', emoji: '🧠', component: 'MemoryMatch' },
  { id: 'orange-pong', name: 'Orange Pong', emoji: '🏓', component: 'OrangePong' },
  { id: 'wojak-runner', name: 'Wojak Runner', emoji: '🏃', component: 'WojakRunner' },
  { id: 'orange-juggle', name: 'Orange Juggle', emoji: '🦧', component: 'OrangeJuggle' },
  { id: 'knife-game', name: 'Knife Game', emoji: '🔪', component: 'KnifeGame', comingSoon: true },
  { id: 'color-reaction', name: 'Color Reaction', emoji: '🎨', component: 'ColorReaction' },
  { id: 'orange-2048', name: 'Orange 2048', emoji: '🍊', component: 'Orange2048' },
] as const;

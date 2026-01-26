/**
 * Game Mute Context
 *
 * Provides mute state to game components from the arcade frame.
 * This allows the arcade frame's mute button to control game audio.
 * Also indicates if music is managed externally (by GameModal).
 */

import { createContext, useContext } from 'react';

interface GameMuteContextType {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
  musicManagedExternally: boolean; // True if GameModal handles music
  gameStarted: boolean; // True when user clicks Play in arcade intro
  isPaused: boolean; // True when game should be paused (e.g., quit dialog shown)
}

export const GameMuteContext = createContext<GameMuteContextType | null>(null);

export const useGameMute = (): GameMuteContextType => {
  const context = useContext(GameMuteContext);
  // Return default values if not in a GameMuteProvider (for standalone game pages)
  if (!context) {
    return {
      isMuted: false,
      setIsMuted: () => {},
      toggleMute: () => {},
      musicManagedExternally: false,
      gameStarted: false,
      isPaused: false,
    };
  }
  return context;
};

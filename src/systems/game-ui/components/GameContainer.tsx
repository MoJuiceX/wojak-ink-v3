/**
 * GameContainer Component
 *
 * Universal wrapper for game components that handles:
 * - Mobile/desktop responsive layout
 * - Stats HUD display
 * - Fullscreen mode (hide navigation)
 * - Safe area handling
 */

import { useEffect } from 'react';
import { useGameViewport } from '../hooks/useGameViewport';
import { MobileHUD } from './MobileHUD';
import type { HUDStat } from './MobileHUD';
import './GameContainer.css';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

interface GameContainerProps {
  children: React.ReactNode;
  stats?: HUDStat[];
  gameState: GameState;
  accentColor?: string;
  hideNavOnPlay?: boolean;
  hudPosition?: 'top' | 'bottom';
  className?: string;
}

export function GameContainer({
  children,
  stats = [],
  gameState,
  accentColor = '#ff6b00',
  hideNavOnPlay = true,
  hudPosition = 'top',
  className = '',
}: GameContainerProps) {
  const { isMobile } = useGameViewport();

  // Hide bottom navigation during gameplay
  useEffect(() => {
    if (hideNavOnPlay && gameState === 'playing') {
      document.body.classList.add('game-fullscreen-mode');
    } else {
      document.body.classList.remove('game-fullscreen-mode');
    }

    return () => {
      document.body.classList.remove('game-fullscreen-mode');
    };
  }, [gameState, hideNavOnPlay]);

  return (
    <div
      className={`game-container ${className} ${isMobile ? 'game-container--mobile' : 'game-container--desktop'}`}
      style={{ '--game-accent': accentColor } as React.CSSProperties}
    >
      {/* Mobile HUD - only show during gameplay on mobile */}
      {isMobile && gameState === 'playing' && stats.length > 0 && (
        <MobileHUD stats={stats} position={hudPosition} accentColor={accentColor} />
      )}

      {/* Game content */}
      <div className="game-container__content">
        {children}
      </div>
    </div>
  );
}

export default GameContainer;

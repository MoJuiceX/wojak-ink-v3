/**
 * Shared Arcade Game Over Screen
 *
 * Used by all arcade games for consistent game over experience.
 * Based on FlappyOrange's polished implementation.
 */

import { useState, useEffect } from 'react';
import { GameButton } from '@/components/ui/GameButton';
import { Avatar } from '@/components/Avatar/Avatar';
import type { LeaderboardEntry } from '@/hooks/data/useLeaderboard';
import './ArcadeGameOverScreen.css';

interface ArcadeGameOverScreenProps {
  // Score data
  score: number;
  highScore: number;
  scoreLabel?: string; // e.g., "pipes passed", "points", "blocks stacked"
  isNewPersonalBest?: boolean;

  // User/submission state
  isSignedIn?: boolean;
  isSubmitting?: boolean;
  scoreSubmitted?: boolean;
  userDisplayName?: string;

  // Leaderboard data
  leaderboard?: LeaderboardEntry[];

  // Callbacks
  onPlayAgain: () => void;
  onShare?: () => void;

  // Styling
  accentColor?: string;
  isExiting?: boolean;

  // Custom title (default: "Game Over!")
  title?: string;
  // Optional subtitle for context (e.g., "Needed 5000 points")
  subtitle?: string;
  
  // Minimum actions for leaderboard eligibility
  meetsMinimumActions?: boolean; // Whether player met the minimum action threshold
  minimumActionsMessage?: string; // Message to show when below threshold
}

// No mock data - only show real leaderboard entries

export function ArcadeGameOverScreen({
  score,
  highScore,
  scoreLabel = 'points',
  isNewPersonalBest = false,
  isSignedIn = false,
  isSubmitting = false,
  scoreSubmitted = false,
  userDisplayName = '',
  leaderboard = [],
  onPlayAgain,
  onShare,
  accentColor,
  isExiting = false,
  title = 'Game Over!',
  subtitle,
  meetsMinimumActions = true, // Default true for backwards compatibility
  minimumActionsMessage = 'Earn more points to be on the leaderboard',
}: ArcadeGameOverScreenProps) {
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);
  // Prevent accidental button presses from lingering touch events on game over
  const [interactable, setInteractable] = useState(false);

  useEffect(() => {
    // Small delay before buttons become interactive to prevent
    // lingering touch events from the game from triggering buttons
    const timer = setTimeout(() => setInteractable(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`arcade-gameover-overlay ${isExiting ? 'exiting' : ''}`}
      onClick={(e) => e.stopPropagation()}
      style={accentColor ? { '--arcade-accent': accentColor } as React.CSSProperties : undefined}
    >
      {/* Leaderboard Panel - slides in from left */}
      {/* Backdrop for mobile - click to close */}
      {showLeaderboardPanel && (
        <div
          className="arcade-gameover-leaderboard-backdrop"
          onClick={(e) => { e.stopPropagation(); setShowLeaderboardPanel(false); }}
          onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setShowLeaderboardPanel(false); }}
        />
      )}
      <div className={`arcade-gameover-leaderboard-overlay ${showLeaderboardPanel ? 'visible' : ''}`}>
        <div className="arcade-gameover-leaderboard-panel" onClick={(e) => e.stopPropagation()}>
          <div className="arcade-gameover-leaderboard-list">
            {Array.from({ length: 10 }, (_, index) => {
              const entry = leaderboard[index];
              const isCurrentUser = entry && score === entry.score;
              const hasEntry = !!entry;
              return (
                <div key={index} className={`arcade-gameover-leaderboard-entry ${isCurrentUser ? 'current-user' : ''} ${!hasEntry ? 'empty' : ''}`}>
                  <span className="arcade-gameover-leaderboard-rank">#{index + 1}</span>
                  {hasEntry ? (
                    <Avatar
                      avatar={entry.avatar || { type: 'emoji', value: '🎮', source: 'default' }}
                      size="small"
                      showBadge={false}
                    />
                  ) : (
                    <div className="arcade-gameover-leaderboard-avatar-placeholder" />
                  )}
                  <span className={`arcade-gameover-leaderboard-name ${entry?.equipped?.nameEffect?.css_class || ''}`}>
                    {entry?.displayName || '---'}
                  </span>
                  <span className="arcade-gameover-leaderboard-score">{entry?.score ?? '-'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content - centered, pushes right when leaderboard opens */}
      <div className={`arcade-gameover-content ${showLeaderboardPanel ? 'pushed' : ''}`}>
        <h2 className="arcade-gameover-title">{title}</h2>
        {subtitle && <p className="arcade-gameover-subtitle">{subtitle}</p>}

        <div className="arcade-gameover-score">
          <span className="arcade-gameover-score-value">{score}</span>
          <span className="arcade-gameover-score-label">{scoreLabel}</span>
        </div>

        <div className="arcade-gameover-stats">
          <div className="arcade-gameover-stat">
            <span className="arcade-gameover-stat-value">{highScore}</span>
            <span className="arcade-gameover-stat-label">best</span>
          </div>
        </div>

        {(isNewPersonalBest || score > highScore) && score > 0 && meetsMinimumActions && (
          <div className="arcade-gameover-new-record">New Personal Best!</div>
        )}

        {isSignedIn && meetsMinimumActions && (
          <div className="arcade-gameover-submitted">
            {isSubmitting ? 'Saving...' : scoreSubmitted ? `Saved as ${userDisplayName}!` : ''}
          </div>
        )}
        
        {/* Show minimum actions message when player doesn't meet threshold */}
        {!meetsMinimumActions && (
          <div className="arcade-gameover-minimum-actions">
            {minimumActionsMessage}
          </div>
        )}

        {/* Buttons - disabled briefly to prevent accidental presses from game touches */}
        <div className="arcade-gameover-buttons">
          <GameButton
            variant="primary"
            size="lg"
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); if (interactable) onPlayAgain(); }}
            onClick={(e) => { e.stopPropagation(); if (interactable) onPlayAgain(); }}
            className="arcade-gameover-play-btn"
            style={{ opacity: interactable ? 1 : 0.7 }}
          >
            Play Again
          </GameButton>
          {onShare && (
            <GameButton
              variant="secondary"
              size="md"
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); if (interactable) onShare(); }}
              onClick={(e) => { e.stopPropagation(); if (interactable) onShare(); }}
              className="arcade-gameover-share-btn"
              style={{ opacity: interactable ? 1 : 0.7 }}
            >
              Share
            </GameButton>
          )}
          <GameButton
            variant="ghost"
            size="md"
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); if (interactable) setShowLeaderboardPanel(!showLeaderboardPanel); }}
            onClick={(e) => { e.stopPropagation(); if (interactable) setShowLeaderboardPanel(!showLeaderboardPanel); }}
            className={`arcade-gameover-leaderboard-btn ${showLeaderboardPanel ? 'active' : ''}`}
            style={{ opacity: interactable ? 1 : 0.7 }}
          >
            Leaderboard
          </GameButton>
        </div>
      </div>
    </div>
  );
}

export default ArcadeGameOverScreen;

/**
 * Shared Arcade Game Over Screen
 *
 * Used by all arcade games for consistent game over experience.
 * Based on FlappyOrange's polished implementation.
 */

import { useState, useEffect } from 'react';
import { GameButton } from '@/components/ui/GameButton';
import './ArcadeGameOverScreen.css';

interface LeaderboardEntry {
  displayName: string;
  score: number;
  rank?: number;
}

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
}

// Mock data for empty leaderboard slots
const MOCK_NAMES = ['OrangeKing', 'FlappyMaster', 'PipeDreamer', 'SkyHopper', 'CitrusNinja', 'WojakPro', 'JuicyPlayer', 'AirBender', 'PipeWizard', 'CloudSurfer'];
const MOCK_SCORES = [156, 142, 128, 115, 98, 87, 72, 65, 54, 41];

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
      <div className={`arcade-gameover-leaderboard-overlay ${showLeaderboardPanel ? 'visible' : ''}`}>
        <div className="arcade-gameover-leaderboard-panel" onClick={(e) => e.stopPropagation()}>
          <div className="arcade-gameover-leaderboard-list">
            {Array.from({ length: 10 }, (_, index) => {
              const entry = leaderboard[index];
              const isCurrentUser = entry && score === entry.score;
              const displayName = entry?.displayName || MOCK_NAMES[index];
              const displayScore = entry?.score ?? MOCK_SCORES[index];
              return (
                <div key={index} className={`arcade-gameover-leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
                  <span className="arcade-gameover-leaderboard-rank">#{index + 1}</span>
                  <div className="arcade-gameover-leaderboard-avatar">
                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayName}`} alt="" />
                  </div>
                  <span className="arcade-gameover-leaderboard-name">{displayName}</span>
                  <span className="arcade-gameover-leaderboard-score">{displayScore}</span>
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

        {(isNewPersonalBest || score > highScore) && score > 0 && (
          <div className="arcade-gameover-new-record">New Personal Best!</div>
        )}

        {isSignedIn && (
          <div className="arcade-gameover-submitted">
            {isSubmitting ? 'Saving...' : scoreSubmitted ? `Saved as ${userDisplayName}!` : ''}
          </div>
        )}

        {/* Buttons - disabled briefly to prevent accidental presses from game touches */}
        <div className="arcade-gameover-buttons">
          <GameButton
            variant="primary"
            size="lg"
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

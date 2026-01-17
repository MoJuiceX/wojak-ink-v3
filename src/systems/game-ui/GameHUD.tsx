import React from 'react';
import './game-ui.css';

interface GameHUDProps {
  score: number;
  highScore?: number;
  combo?: number;
  comboTimer?: number; // 0-100 percentage
  timer?: number; // Seconds remaining (for timed games)
  lives?: number;
  level?: number;
  showCombo?: boolean;
  position?: 'top' | 'bottom';
  children?: React.ReactNode; // For game-specific HUD elements
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  combo,
  comboTimer,
  timer,
  lives,
  level,
  showCombo = true,
  position = 'top',
  children
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`game-hud game-hud-${position}`}>
      {/* Left Section: Score */}
      <div className="hud-section hud-left">
        <div className="hud-score">
          <span className="hud-label">Score</span>
          <span className="hud-value">{score.toLocaleString()}</span>
        </div>
        {highScore !== undefined && (
          <div className="hud-best">
            <span className="hud-label">Best</span>
            <span className="hud-value">{highScore.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Center Section: Combo / Timer */}
      <div className="hud-section hud-center">
        {showCombo && combo !== undefined && combo > 1 && (
          <div className={`hud-combo combo-level-${Math.min(combo, 10)}`}>
            <span className="combo-value">{combo}x</span>
            <span className="combo-label">COMBO</span>
            {comboTimer !== undefined && (
              <div className="combo-timer">
                <div
                  className="combo-timer-fill"
                  style={{ width: `${comboTimer}%` }}
                />
              </div>
            )}
          </div>
        )}

        {timer !== undefined && (
          <div className="hud-timer">
            <span className="timer-icon">⏱️</span>
            <span className="timer-value">{formatTime(timer)}</span>
          </div>
        )}
      </div>

      {/* Right Section: Lives / Level */}
      <div className="hud-section hud-right">
        {lives !== undefined && (
          <div className="hud-lives">
            {Array.from({ length: lives }).map((_, i) => (
              <span key={i} className="life-icon">❤️</span>
            ))}
          </div>
        )}

        {level !== undefined && (
          <div className="hud-level">
            <span className="hud-label">Level</span>
            <span className="hud-value">{level}</span>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

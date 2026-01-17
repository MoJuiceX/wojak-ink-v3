import React from 'react';
import './game-ui.css';

interface PauseMenuProps {
  isVisible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onSettings?: () => void;
  gameName?: string;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isVisible,
  onResume,
  onRestart,
  onMainMenu,
  onSettings,
  gameName
}) => {
  if (!isVisible) return null;

  return (
    <div className="pause-overlay">
      <div className="pause-modal">
        <h2 className="pause-title">Paused</h2>
        {gameName && <p className="pause-game-name">{gameName}</p>}

        <div className="pause-actions">
          <button className="pause-button resume" onClick={onResume}>
            Resume
          </button>
          <button className="pause-button restart" onClick={onRestart}>
            Restart
          </button>
          {onSettings && (
            <button className="pause-button settings" onClick={onSettings}>
              Settings
            </button>
          )}
          <button className="pause-button menu" onClick={onMainMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

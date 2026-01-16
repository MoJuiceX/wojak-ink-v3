/**
 * Wordle Statistics Modal
 *
 * Displays game statistics including:
 * - Games played, win percentage, streaks
 * - Guess distribution bar chart
 */

import type { WordleStats } from './stats';
import { getWinPercentage, getMaxDistribution } from './stats';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: WordleStats;
  gameWon: boolean | null; // null if game in progress
  numGuesses?: number; // Which row they won on (1-6)
}

const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  gameWon,
  numGuesses,
}) => {
  if (!isOpen) return null;

  const winPercentage = getWinPercentage(stats);
  const maxDistribution = getMaxDistribution(stats);

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <h2 className="stats-title">Statistics</h2>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-value">{stats.gamesPlayed}</div>
            <div className="stat-label">Played</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{winPercentage}</div>
            <div className="stat-label">Win %</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.maxStreak}</div>
            <div className="stat-label">Max Streak</div>
          </div>
        </div>

        {/* Guess Distribution */}
        <h3 className="distribution-title">Guess Distribution</h3>
        <div className="distribution-chart">
          {stats.guessDistribution.map((count, index) => {
            const percentage = maxDistribution > 0 ? (count / maxDistribution) * 100 : 0;
            const isCurrentGuess = gameWon === true && numGuesses === index + 1;

            return (
              <div key={index} className="distribution-row">
                <div className="distribution-guess">{index + 1}</div>
                <div className="distribution-bar-container">
                  <div
                    className={`distribution-bar ${isCurrentGuess ? 'highlight' : ''} ${count > 0 ? 'has-value' : ''}`}
                    style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
                  >
                    <span className="distribution-count">{count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Game Result Message */}
        {gameWon !== null && (
          <div className="stats-result">
            {gameWon ? (
              <p className="result-win">
                You got it in {numGuesses} {numGuesses === 1 ? 'guess' : 'guesses'}!
              </p>
            ) : (
              <p className="result-lose">Better luck next time!</p>
            )}
          </div>
        )}

        {/* Close Button */}
        <button className="stats-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default StatsModal;

/**
 * Leaderboard Component
 *
 * Cyberpunk Arena Rankings with premium animations.
 * Features gradient shimmer title, animated game selector,
 * sliding time filters, and dramatic empty state.
 */

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Trophy, Gamepad2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFriends } from '../../contexts/FriendsContext';
import { LeaderboardEntry } from './LeaderboardEntry';
import { NFTGatePrompt } from './NFTGatePrompt';
import type { GameId } from '../../types/leaderboard';
import { GAME_NAMES } from '../../types/leaderboard';
import './Leaderboard.css';

// Type for leaderboard entry from API
interface LeaderboardEntryData {
  rank: number;
  userId: string;
  displayName: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
    source: 'default' | 'user' | 'wallet';
  };
  score: number;
  level?: number;
  createdAt: string;
  isCurrentUser?: boolean;
}

// Game emojis for selector
const GAME_EMOJIS: Record<GameId, string> = {
  'orange-stack': '🧱',
  'memory-match': '🎴',
  'orange-pong': '🏓',
  'wojak-runner': '🏃',
  'orange-juggle': '🤹',
  'knife-game': '🔪',
  'color-reaction': '🎨',
  'orange-2048': '🔢',
  'block-puzzle': '🧩',
  'flappy-orange': '🐦',
  'citrus-drop': '🍊',
  'orange-snake': '🐍',
  'brick-breaker': '🎯',
};

interface LeaderboardProps {
  gameId: GameId;
  showGameSelector?: boolean;
}

type TimeframeType = 'all-time' | 'weekly' | 'daily';

const TIME_FILTERS: { value: TimeframeType; label: string }[] = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'all-time', label: 'All Time' },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({
  gameId: initialGameId,
  showGameSelector = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { user } = useAuth();
  const { friends, isFriend } = useFriends();
  const [selectedGame, setSelectedGame] = useState<GameId>(initialGameId);
  const [timeframe, setTimeframe] = useState<TimeframeType>('all-time');
  const [filter, setFilter] = useState<'all' | 'friends'>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Server-side leaderboard state
  const [entries, setEntries] = useState<LeaderboardEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard from server API
  const fetchLeaderboard = useCallback(async (gameId: GameId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/leaderboard/${gameId}?limit=100`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();

      // Mark current user's entries
      const entriesWithUser = (data.entries || []).map((entry: LeaderboardEntryData) => ({
        ...entry,
        isCurrentUser: user?.id === entry.userId,
      }));

      setEntries(entriesWithUser);
    } catch (err) {
      console.error('[Leaderboard] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Filter entries based on selected tab
  const filteredEntries = useMemo(() => {
    if (!entries) return [];

    if (filter === 'friends') {
      return entries.filter(entry => isFriend(entry.userId));
    }

    return entries;
  }, [entries, filter, isFriend]);

  useEffect(() => {
    fetchLeaderboard(selectedGame);
  }, [selectedGame, fetchLeaderboard]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isNftHolder = !!user;
  const activeFilterIndex = TIME_FILTERS.findIndex(f => f.value === timeframe);

  const handleGameSelect = (gameId: GameId) => {
    setSelectedGame(gameId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="leaderboard-container">
      {/* Epic Title with Shimmer */}
      <motion.div
        className="leaderboard-header-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="leaderboard-epic-title">
          <span className="title-diamond">◆</span>
          Leaderboard
          <span className="title-diamond">◆</span>
        </h1>
        {!showGameSelector && (
          <p className="leaderboard-subtitle">{GAME_NAMES[selectedGame]}</p>
        )}

        {/* NFT Status Badge */}
        {user && (
          <motion.div
            className={`nft-status-badge ${isNftHolder ? 'holder' : 'non-holder'}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            {isNftHolder ? (
              <>
                <span className="status-check">✓</span>
                <span>Competing</span>
              </>
            ) : (
              <>
                <span className="status-lock">🔒</span>
                <span>View Only</span>
              </>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Premium Game Selector Dropdown */}
      {showGameSelector && (
        <motion.div
          ref={dropdownRef}
          className={`game-selector-premium ${isDropdownOpen ? 'open' : ''}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            className="game-selector-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="selected-game">
              <span className="game-emoji">{GAME_EMOJIS[selectedGame]}</span>
              <span className="game-name-text">{GAME_NAMES[selectedGame]}</span>
            </div>
            <motion.div
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="dropdown-arrow" size={20} />
            </motion.div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                className="game-dropdown-menu"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {(Object.entries(GAME_NAMES) as [GameId, string][]).map(([id, name], index) => (
                  <motion.button
                    key={id}
                    className={`game-option ${selectedGame === id ? 'selected' : ''}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleGameSelect(id)}
                  >
                    <span className="game-emoji">{GAME_EMOJIS[id]}</span>
                    <span className="game-option-name">{name}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Glowing Time Filter Tabs */}
      <motion.div
        className="time-filters-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="time-filters">
          {/* Animated sliding indicator */}
          <motion.div
            className="filter-indicator"
            layoutId="timeFilterIndicator"
            style={{
              width: `${100 / TIME_FILTERS.length}%`,
            }}
            animate={{
              left: `${activeFilterIndex * (100 / TIME_FILTERS.length)}%`,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />

          {TIME_FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={`time-filter ${timeframe === filter.value ? 'active' : ''}`}
              onClick={() => setTimeframe(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Friends Filter Tabs */}
      <motion.div
        className="leaderboard-filters"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Players
        </button>

        <button
          className={`filter-tab ${filter === 'friends' ? 'active' : ''}`}
          onClick={() => setFilter('friends')}
        >
          Friends
          {friends.length > 0 && (
            <span className="filter-badge">{friends.length}</span>
          )}
        </button>
      </motion.div>

      {/* NFT Gate Prompt (for non-holders) */}
      {user && !isNftHolder && <NFTGatePrompt />}

      {/* Content Area with smooth transitions */}
      <div className="leaderboard-content-area">
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              className="leaderboard-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="loading-trophy"
                animate={prefersReducedMotion ? {} : {
                  rotate: [0, 10, -10, 0],
                  y: [0, -5, 0],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Trophy size={40} />
              </motion.div>
              <p>Loading rankings...</p>
            </motion.div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <motion.div
              key="error"
              className="leaderboard-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p>Failed to load leaderboard</p>
              <button onClick={() => fetchLeaderboard(selectedGame)}>
                Retry
              </button>
            </motion.div>
          )}

          {/* Leaderboard Entries */}
          {!isLoading && !error && (
            <motion.div
              key={`entries-${timeframe}`}
              className="leaderboard-entries"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
          {/* Top 3 Podium */}
          {filteredEntries.length >= 3 && (
            <motion.div
              className="podium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="podium-entry second"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <LeaderboardEntry
                  entry={filteredEntries[1]}
                  isPodium
                  podiumPosition={2}
                  index={1}
                  isFriend={isFriend(filteredEntries[1].userId)}
                />
              </motion.div>
              <motion.div
                className="podium-entry first"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <LeaderboardEntry
                  entry={filteredEntries[0]}
                  isPodium
                  podiumPosition={1}
                  index={0}
                  isFriend={isFriend(filteredEntries[0].userId)}
                />
              </motion.div>
              <motion.div
                className="podium-entry third"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <LeaderboardEntry
                  entry={filteredEntries[2]}
                  isPodium
                  podiumPosition={3}
                  index={2}
                  isFriend={isFriend(filteredEntries[2].userId)}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Handle less than 3 entries */}
          {filteredEntries.length > 0 && filteredEntries.length < 3 && (
            <div className="leaderboard-list top-entries">
              {filteredEntries.map((entry, index) => (
                <LeaderboardEntry
                  key={`${entry.userId}-${entry.rank}`}
                  entry={entry}
                  index={index}
                  isFriend={isFriend(entry.userId)}
                />
              ))}
            </div>
          )}

          {/* Rest of the list */}
          {filteredEntries.length > 3 && (
            <div className="leaderboard-list">
              {filteredEntries.slice(3).map((entry, index) => (
                <LeaderboardEntry
                  key={`${entry.userId}-${entry.rank}`}
                  entry={entry}
                  index={index + 3}
                  isFriend={isFriend(entry.userId)}
                />
              ))}
            </div>
          )}

          {/* User's Position - highlighted if in list */}

          {/* Epic Empty State - fade only, no slide */}
          {filteredEntries.length === 0 && (
            <div className="leaderboard-empty-epic">
              {/* Animated trophy */}
              <motion.div
                className="trophy-container"
                animate={prefersReducedMotion ? {} : {
                  y: [0, -15, 0],
                  rotateY: [0, 10, 0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <span className="trophy-icon">{filter === 'friends' ? '👥' : '🏆'}</span>

                {/* Sparkle effects */}
                {!prefersReducedMotion && (
                  <>
                    <motion.span
                      className="sparkle sparkle-1"
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    >
                      ✨
                    </motion.span>
                    <motion.span
                      className="sparkle sparkle-2"
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                    >
                      ✨
                    </motion.span>
                    <motion.span
                      className="sparkle sparkle-3"
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
                    >
                      ✨
                    </motion.span>
                  </>
                )}
              </motion.div>

              <h2 className="empty-title">
                {filter === 'friends' ? 'No Friends Playing Yet' : 'The Arena Awaits'}
              </h2>
              <p className="empty-subtitle">
                {filter === 'friends'
                  ? friends.length === 0
                    ? 'Add friends to see their scores here!'
                    : 'None of your friends have played this game yet.'
                  : timeframe === 'daily'
                  ? 'No scores yet today. Be the first!'
                  : timeframe === 'weekly'
                  ? 'No scores this week. Claim your glory!'
                  : 'Be the first to set a record!'}
              </p>

              <motion.button
                className="play-now-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Navigate to appropriate page
                  window.location.href = filter === 'friends' && friends.length === 0 ? '/friends' : '/games';
                }}
              >
                <Gamepad2 size={18} />
                {filter === 'friends' && friends.length === 0 ? 'Find Friends' : 'Start Playing'}
              </motion.button>
            </div>
          )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Leaderboard;

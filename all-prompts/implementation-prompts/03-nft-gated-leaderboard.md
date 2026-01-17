# IMPLEMENTATION PROMPT 02: NFT-Gated Leaderboard System

## Overview
Build a comprehensive leaderboard system where ONLY users with Wojak NFT avatars can compete on public leaderboards. This creates real utility for Wojak NFTs and incentivizes community members to hold the NFTs.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEADERBOARD SYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ACCESS TIERS                                                    │
│  ├── EVERYONE (No NFT Required)                                 │
│  │   ├── Play all games                                         │
│  │   ├── See personal stats & history                           │
│  │   ├── View leaderboards (read-only)                          │
│  │   └── Earn oranges (soft currency)                           │
│  │                                                               │
│  └── NFT HOLDERS ONLY (Wojak NFT Avatar)                        │
│      ├── Appear on public leaderboards                          │
│      ├── Compete for rankings                                   │
│      ├── Earn leaderboard rewards                               │
│      ├── Access seasonal competitions                           │
│      └── Unlock exclusive badges                                │
│                                                                  │
│  LEADERBOARD TYPES                                               │
│  ├── Global (All-time high scores)                              │
│  ├── Weekly (Resets every Monday)                               │
│  ├── Daily (Resets at midnight UTC)                             │
│  ├── Per-Game (Separate for each game)                          │
│  └── Guild (Combined guild scores)                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Leaderboard Context & State Management

### 1.1 Types Definition
Create `src/types/leaderboard.ts`:

```typescript
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
  };
  score: number;
  gameId: string;
  achievedAt: Date;
  isCurrentUser?: boolean;
}

export interface PersonalStats {
  gameId: string;
  highScore: number;
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestRank?: number; // Only if NFT holder
  lastPlayedAt: Date;
}

export interface LeaderboardFilter {
  gameId: string;
  timeframe: 'all-time' | 'weekly' | 'daily';
  limit?: number;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
  userRank: number | null; // User's current rank (null if not on leaderboard)
  userEntry: LeaderboardEntry | null;
  isLoading: boolean;
  error: string | null;
  canCompete: boolean; // True only if user has NFT avatar
}

export type GameId =
  | 'orange-stack'
  | 'memory-match'
  | 'orange-pong'
  | 'wojak-runner'
  | 'juggle-orange'
  | 'knife-game'
  | 'color-reaction'
  | '2048-merge'
  | 'orange-wordle';

export const GAME_NAMES: Record<GameId, string> = {
  'orange-stack': 'Orange Stack',
  'memory-match': 'Memory Match',
  'orange-pong': 'Orange Pong',
  'wojak-runner': 'Wojak Runner',
  'juggle-orange': 'Juggle the Orange',
  'knife-game': 'The Knife Game',
  'color-reaction': 'Color Reaction',
  '2048-merge': '2048 Merge',
  'orange-wordle': 'Orange Wordle',
};
```

### 1.2 Leaderboard Context
Create `src/contexts/LeaderboardContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  LeaderboardEntry,
  LeaderboardFilter,
  LeaderboardState,
  PersonalStats,
  GameId
} from '../types/leaderboard';

interface LeaderboardContextType {
  // State
  leaderboard: LeaderboardState;
  personalStats: Map<GameId, PersonalStats>;

  // Actions
  fetchLeaderboard: (filter: LeaderboardFilter) => Promise<void>;
  fetchPersonalStats: (gameId: GameId) => Promise<PersonalStats | null>;
  submitScore: (gameId: GameId, score: number) => Promise<SubmitScoreResult>;

  // Helpers
  canUserCompete: () => boolean;
  getUserRankForGame: (gameId: GameId) => number | null;
}

interface SubmitScoreResult {
  success: boolean;
  isNewHighScore: boolean;
  newRank?: number;
  previousRank?: number;
  addedToLeaderboard: boolean; // False if user doesn't have NFT avatar
  orangesEarned: number;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export const LeaderboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardState>({
    entries: [],
    userRank: null,
    userEntry: null,
    isLoading: false,
    error: null,
    canCompete: false
  });
  const [personalStats, setPersonalStats] = useState<Map<GameId, PersonalStats>>(new Map());

  // Check if user can compete (has NFT avatar)
  const canUserCompete = useCallback((): boolean => {
    return user?.avatar?.type === 'nft' && !!user?.avatar?.nftId;
  }, [user]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (filter: LeaderboardFilter) => {
    setLeaderboard(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        gameId: filter.gameId,
        timeframe: filter.timeframe,
        limit: String(filter.limit || 100)
      });

      const response = await fetch(`/api/leaderboard?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const data = await response.json();

      setLeaderboard({
        entries: data.entries,
        userRank: data.userRank,
        userEntry: data.userEntry,
        isLoading: false,
        error: null,
        canCompete: canUserCompete()
      });
    } catch (error) {
      setLeaderboard(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [canUserCompete]);

  // Fetch personal stats for a game
  const fetchPersonalStats = useCallback(async (gameId: GameId): Promise<PersonalStats | null> => {
    try {
      const response = await fetch(`/api/stats/personal/${gameId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) return null;

      const stats: PersonalStats = await response.json();

      setPersonalStats(prev => {
        const updated = new Map(prev);
        updated.set(gameId, stats);
        return updated;
      });

      return stats;
    } catch (error) {
      console.error('Failed to fetch personal stats:', error);
      return null;
    }
  }, []);

  // Submit a new score
  const submitScore = useCallback(async (
    gameId: GameId,
    score: number
  ): Promise<SubmitScoreResult> => {
    try {
      const response = await fetch('/api/scores/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ gameId, score })
      });

      if (!response.ok) throw new Error('Failed to submit score');

      const result: SubmitScoreResult = await response.json();

      // Update personal stats if it's a new high score
      if (result.isNewHighScore) {
        fetchPersonalStats(gameId);
      }

      return result;
    } catch (error) {
      console.error('Score submission failed:', error);
      return {
        success: false,
        isNewHighScore: false,
        addedToLeaderboard: false,
        orangesEarned: 0
      };
    }
  }, [fetchPersonalStats]);

  // Get user's rank for a specific game
  const getUserRankForGame = useCallback((gameId: GameId): number | null => {
    const stats = personalStats.get(gameId);
    return stats?.bestRank || null;
  }, [personalStats]);

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboard,
        personalStats,
        fetchLeaderboard,
        fetchPersonalStats,
        submitScore,
        canUserCompete,
        getUserRankForGame
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within LeaderboardProvider');
  }
  return context;
};
```

---

## Part 2: Leaderboard UI Components

### 2.1 Main Leaderboard Component
Create `src/components/Leaderboard/Leaderboard.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonSpinner } from '@ionic/react';
import { useAuth } from '../../contexts/AuthContext';
import { useLeaderboard } from '../../contexts/LeaderboardContext';
import { LeaderboardEntry } from './LeaderboardEntry';
import { NFTGatePrompt } from './NFTGatePrompt';
import { GameId, GAME_NAMES } from '../../types/leaderboard';
import './Leaderboard.css';

interface LeaderboardProps {
  gameId: GameId;
  showGameSelector?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  gameId: initialGameId,
  showGameSelector = false
}) => {
  const { user } = useAuth();
  const { leaderboard, fetchLeaderboard, canUserCompete } = useLeaderboard();
  const [selectedGame, setSelectedGame] = useState<GameId>(initialGameId);
  const [timeframe, setTimeframe] = useState<'all-time' | 'weekly' | 'daily'>('all-time');

  useEffect(() => {
    fetchLeaderboard({
      gameId: selectedGame,
      timeframe,
      limit: 100
    });
  }, [selectedGame, timeframe, fetchLeaderboard]);

  const isNftHolder = canUserCompete();

  return (
    <div className="leaderboard-container">
      {/* Header */}
      <div className="leaderboard-header">
        <h2 className="leaderboard-title">
          🏆 Leaderboard
          {!showGameSelector && <span className="game-name">{GAME_NAMES[selectedGame]}</span>}
        </h2>

        {/* NFT Status Indicator */}
        {user && (
          <div className={`nft-status ${isNftHolder ? 'holder' : 'non-holder'}`}>
            {isNftHolder ? (
              <>
                <span className="status-icon">✓</span>
                <span>Competing</span>
              </>
            ) : (
              <>
                <span className="status-icon">🔒</span>
                <span>View Only</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Game Selector (optional) */}
      {showGameSelector && (
        <div className="game-selector">
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value as GameId)}
            className="game-dropdown"
          >
            {Object.entries(GAME_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Timeframe Selector */}
      <IonSegment
        value={timeframe}
        onIonChange={(e) => setTimeframe(e.detail.value as any)}
        className="timeframe-selector"
      >
        <IonSegmentButton value="daily">
          <IonLabel>Today</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="weekly">
          <IonLabel>This Week</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="all-time">
          <IonLabel>All Time</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      {/* NFT Gate Prompt (for non-holders) */}
      {user && !isNftHolder && (
        <NFTGatePrompt />
      )}

      {/* Loading State */}
      {leaderboard.isLoading && (
        <div className="leaderboard-loading">
          <IonSpinner name="crescent" />
          <p>Loading rankings...</p>
        </div>
      )}

      {/* Error State */}
      {leaderboard.error && (
        <div className="leaderboard-error">
          <p>Failed to load leaderboard</p>
          <button onClick={() => fetchLeaderboard({ gameId: selectedGame, timeframe })}>
            Retry
          </button>
        </div>
      )}

      {/* Leaderboard Entries */}
      {!leaderboard.isLoading && !leaderboard.error && (
        <div className="leaderboard-entries">
          {/* Top 3 Podium */}
          {leaderboard.entries.length >= 3 && (
            <div className="podium">
              <div className="podium-entry second">
                <LeaderboardEntry
                  entry={leaderboard.entries[1]}
                  isPodium
                  podiumPosition={2}
                />
              </div>
              <div className="podium-entry first">
                <LeaderboardEntry
                  entry={leaderboard.entries[0]}
                  isPodium
                  podiumPosition={1}
                />
              </div>
              <div className="podium-entry third">
                <LeaderboardEntry
                  entry={leaderboard.entries[2]}
                  isPodium
                  podiumPosition={3}
                />
              </div>
            </div>
          )}

          {/* Rest of the list */}
          <div className="leaderboard-list">
            {leaderboard.entries.slice(3).map((entry) => (
              <LeaderboardEntry
                key={`${entry.userId}-${entry.rank}`}
                entry={entry}
              />
            ))}
          </div>

          {/* User's Position (if not in visible list) */}
          {leaderboard.userEntry && leaderboard.userRank && leaderboard.userRank > 100 && (
            <div className="user-position-footer">
              <div className="separator">• • •</div>
              <LeaderboardEntry
                entry={leaderboard.userEntry}
                isHighlighted
              />
            </div>
          )}

          {/* Empty State */}
          {leaderboard.entries.length === 0 && (
            <div className="leaderboard-empty">
              <span className="empty-icon">🏆</span>
              <p>No scores yet for this {timeframe === 'daily' ? 'day' : timeframe === 'weekly' ? 'week' : 'game'}.</p>
              <p>Be the first to set a record!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### 2.2 Leaderboard Entry Component
Create `src/components/Leaderboard/LeaderboardEntry.tsx`:

```typescript
import React from 'react';
import { Avatar } from '../Avatar/Avatar';
import { LeaderboardEntry as LeaderboardEntryType } from '../../types/leaderboard';
import './Leaderboard.css';

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  isPodium?: boolean;
  podiumPosition?: 1 | 2 | 3;
  isHighlighted?: boolean;
}

export const LeaderboardEntry: React.FC<LeaderboardEntryProps> = ({
  entry,
  isPodium = false,
  podiumPosition,
  isHighlighted = false
}) => {
  const getRankDisplay = () => {
    if (podiumPosition === 1) return '🥇';
    if (podiumPosition === 2) return '🥈';
    if (podiumPosition === 3) return '🥉';
    return `#${entry.rank}`;
  };

  const formatScore = (score: number): string => {
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toLocaleString();
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (isPodium) {
    return (
      <div className={`podium-card position-${podiumPosition} ${entry.isCurrentUser ? 'is-current-user' : ''}`}>
        <div className="podium-rank">{getRankDisplay()}</div>
        <Avatar
          type={entry.avatar.type}
          value={entry.avatar.value}
          size="large"
          isNftHolder={entry.avatar.type === 'nft'}
        />
        <div className="podium-info">
          <span className="podium-username">{entry.username}</span>
          <span className="podium-score">{formatScore(entry.score)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`leaderboard-row ${entry.isCurrentUser ? 'is-current-user' : ''} ${isHighlighted ? 'highlighted' : ''}`}>
      <div className="row-rank">
        {getRankDisplay()}
      </div>

      <Avatar
        type={entry.avatar.type}
        value={entry.avatar.value}
        size="small"
        isNftHolder={entry.avatar.type === 'nft'}
      />

      <div className="row-info">
        <span className="row-username">{entry.username}</span>
        <span className="row-time">{getTimeAgo(entry.achievedAt)}</span>
      </div>

      <div className="row-score">
        {formatScore(entry.score)}
      </div>
    </div>
  );
};
```

### 2.3 NFT Gate Prompt Component
Create `src/components/Leaderboard/NFTGatePrompt.tsx`:

```typescript
import React from 'react';
import { IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Leaderboard.css';

export const NFTGatePrompt: React.FC = () => {
  const history = useHistory();

  return (
    <div className="nft-gate-prompt">
      <div className="gate-content">
        <div className="gate-icon">🔒</div>
        <h3>Unlock Leaderboard Competition</h3>
        <p>
          Connect your wallet and set a <strong>Wojak NFT</strong> as your avatar
          to compete on the global leaderboard and earn exclusive rewards!
        </p>

        <div className="gate-benefits">
          <div className="benefit">
            <span className="benefit-icon">🏆</span>
            <span>Compete for rankings</span>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🎁</span>
            <span>Win seasonal rewards</span>
          </div>
          <div className="benefit">
            <span className="benefit-icon">⭐</span>
            <span>Unlock exclusive badges</span>
          </div>
        </div>

        <div className="gate-actions">
          <IonButton
            onClick={() => history.push('/profile?tab=avatar')}
            className="connect-button"
          >
            Connect Wallet & Set NFT Avatar
          </IonButton>

          <a
            href="https://mintgarden.io/collections/wojak"
            target="_blank"
            rel="noopener noreferrer"
            className="get-nft-link"
          >
            Don't have a Wojak NFT? Get one here →
          </a>
        </div>
      </div>
    </div>
  );
};
```

### 2.4 Leaderboard Styles
Create `src/components/Leaderboard/Leaderboard.css`:

```css
/* Container */
.leaderboard-container {
  background: linear-gradient(135deg, rgba(20, 20, 35, 0.95), rgba(30, 30, 50, 0.9));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 140, 50, 0.2);
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

/* Header */
.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.leaderboard-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.leaderboard-title .game-name {
  display: block;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
  margin-top: 4px;
}

/* NFT Status */
.nft-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.nft-status.holder {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 50, 0.2));
  color: #FFD700;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.nft-status.non-holder {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Game Selector */
.game-selector {
  margin-bottom: 16px;
}

.game-dropdown {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}

/* Timeframe Selector */
.timeframe-selector {
  --background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 20px;
}

.timeframe-selector ion-segment-button {
  --color: rgba(255, 255, 255, 0.7);
  --color-checked: #fff;
  --indicator-color: rgba(255, 140, 50, 0.8);
}

/* NFT Gate Prompt */
.nft-gate-prompt {
  background: linear-gradient(135deg, rgba(255, 140, 50, 0.15), rgba(255, 100, 50, 0.1));
  border: 1px solid rgba(255, 140, 50, 0.3);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.gate-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.nft-gate-prompt h3 {
  color: #fff;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.nft-gate-prompt p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.gate-benefits {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.benefit {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
}

.benefit-icon {
  font-size: 1.1rem;
}

.connect-button {
  --background: linear-gradient(135deg, #FF8C32, #FF6420);
  --border-radius: 12px;
  font-weight: 600;
}

.get-nft-link {
  display: block;
  margin-top: 12px;
  color: rgba(255, 140, 50, 0.8);
  text-decoration: none;
  font-size: 0.85rem;
}

.get-nft-link:hover {
  color: #FF8C32;
  text-decoration: underline;
}

/* Podium */
.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 12px;
  padding: 20px 0 30px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.podium-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.podium-entry.first {
  order: 2;
}

.podium-entry.second {
  order: 1;
}

.podium-entry.third {
  order: 3;
}

.podium-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 100px;
}

.podium-card.position-1 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
  border-color: rgba(255, 215, 0, 0.3);
  transform: scale(1.1);
}

.podium-card.position-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(192, 192, 192, 0.1));
  border-color: rgba(192, 192, 192, 0.3);
}

.podium-card.position-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(205, 127, 50, 0.1));
  border-color: rgba(205, 127, 50, 0.3);
}

.podium-card.is-current-user {
  box-shadow: 0 0 20px rgba(255, 140, 50, 0.4);
}

.podium-rank {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.podium-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
}

.podium-username {
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
}

.podium-score {
  color: #FF8C32;
  font-weight: 700;
  font-size: 1.1rem;
  margin-top: 4px;
}

/* Leaderboard List */
.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.leaderboard-row:hover {
  background: rgba(255, 255, 255, 0.08);
}

.leaderboard-row.is-current-user {
  background: linear-gradient(135deg, rgba(255, 140, 50, 0.15), rgba(255, 100, 50, 0.1));
  border-color: rgba(255, 140, 50, 0.3);
}

.leaderboard-row.highlighted {
  animation: highlightPulse 2s ease-in-out infinite;
}

@keyframes highlightPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 140, 50, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 140, 50, 0.5);
  }
}

.row-rank {
  min-width: 40px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.row-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-username {
  color: #fff;
  font-weight: 500;
  font-size: 0.95rem;
}

.row-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
}

.row-score {
  font-weight: 700;
  color: #FF8C32;
  font-size: 1rem;
}

/* User Position Footer */
.user-position-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed rgba(255, 255, 255, 0.2);
}

.separator {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 12px;
  letter-spacing: 4px;
}

/* Empty State */
.leaderboard-empty {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

.leaderboard-empty p {
  color: rgba(255, 255, 255, 0.6);
  margin: 4px 0;
}

/* Loading State */
.leaderboard-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  gap: 12px;
}

.leaderboard-loading p {
  color: rgba(255, 255, 255, 0.6);
}

/* Error State */
.leaderboard-error {
  text-align: center;
  padding: 30px;
}

.leaderboard-error p {
  color: #ff6b6b;
  margin-bottom: 12px;
}

.leaderboard-error button {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 480px) {
  .podium {
    gap: 8px;
  }

  .podium-card {
    min-width: 80px;
    padding: 12px;
  }

  .podium-card.position-1 {
    transform: scale(1.05);
  }

  .gate-benefits {
    flex-direction: column;
    gap: 10px;
  }
}
```

---

## Part 3: Score Submission Integration

### 3.1 useGameScore Hook
Create `src/hooks/useGameScore.ts`:

```typescript
import { useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeaderboard } from '../contexts/LeaderboardContext';
import { GameId } from '../types/leaderboard';

interface GameScoreOptions {
  gameId: GameId;
  onHighScore?: (score: number, rank?: number) => void;
  onLeaderboardUpdate?: (addedToLeaderboard: boolean, rank?: number) => void;
}

export const useGameScore = (options: GameScoreOptions) => {
  const { gameId, onHighScore, onLeaderboardUpdate } = options;
  const { user } = useAuth();
  const { submitScore, canUserCompete, fetchPersonalStats } = useLeaderboard();
  const personalStatsRef = useRef<any>(null);

  // Load personal stats on mount
  const loadStats = useCallback(async () => {
    const stats = await fetchPersonalStats(gameId);
    personalStatsRef.current = stats;
    return stats;
  }, [gameId, fetchPersonalStats]);

  // Submit score when game ends
  const handleGameEnd = useCallback(async (finalScore: number) => {
    if (!user) return;

    const result = await submitScore(gameId, finalScore);

    if (result.success) {
      // Check if it's a new high score
      if (result.isNewHighScore) {
        onHighScore?.(finalScore, result.newRank);
      }

      // Notify about leaderboard status
      if (canUserCompete()) {
        onLeaderboardUpdate?.(result.addedToLeaderboard, result.newRank);
      } else {
        // User is not NFT holder - show prompt
        onLeaderboardUpdate?.(false);
      }
    }

    return result;
  }, [user, gameId, submitScore, canUserCompete, onHighScore, onLeaderboardUpdate]);

  // Get current high score
  const getHighScore = useCallback((): number => {
    return personalStatsRef.current?.highScore || 0;
  }, []);

  return {
    loadStats,
    handleGameEnd,
    getHighScore,
    isNftHolder: canUserCompete()
  };
};
```

### 3.2 Integration with Game Over Screen
Update your game over screens to use the hook:

```typescript
// Example: In OrangeStack.tsx or any game component

import { useGameScore } from '../hooks/useGameScore';

const OrangeStack: React.FC = () => {
  const [showLeaderboardPrompt, setShowLeaderboardPrompt] = useState(false);

  const { handleGameEnd, isNftHolder } = useGameScore({
    gameId: 'orange-stack',
    onHighScore: (score, rank) => {
      // Trigger celebration animation
      showHighScoreCelebration(score, rank);
    },
    onLeaderboardUpdate: (addedToLeaderboard, rank) => {
      if (!addedToLeaderboard && !isNftHolder) {
        // Show NFT gate prompt
        setShowLeaderboardPrompt(true);
      } else if (rank && rank <= 10) {
        // Show top 10 celebration
        showTopTenCelebration(rank);
      }
    }
  });

  const onGameOver = async (finalScore: number) => {
    // Submit score
    const result = await handleGameEnd(finalScore);

    // Show game over screen with results
    setGameOverData({
      score: finalScore,
      isNewHighScore: result.isNewHighScore,
      rank: result.newRank,
      orangesEarned: result.orangesEarned,
      addedToLeaderboard: result.addedToLeaderboard
    });

    setShowGameOver(true);
  };

  // ... rest of game component
};
```

---

## Part 4: Backend API Endpoints (Reference)

```typescript
// GET /api/leaderboard
// Fetches leaderboard entries
{
  query: {
    gameId: string,
    timeframe: 'all-time' | 'weekly' | 'daily',
    limit?: number
  },
  response: {
    entries: LeaderboardEntry[],
    userRank: number | null, // Current user's rank if on leaderboard
    userEntry: LeaderboardEntry | null
  }
}

// POST /api/scores/submit
// Submits a new score
{
  request: {
    gameId: string,
    score: number
  },
  response: {
    success: boolean,
    isNewHighScore: boolean,
    newRank?: number,
    previousRank?: number,
    addedToLeaderboard: boolean, // False if user doesn't have NFT avatar
    orangesEarned: number
  }
}

// GET /api/stats/personal/:gameId
// Fetches user's personal stats for a game
{
  response: PersonalStats
}
```

---

## Part 5: Database Schema (Reference)

```sql
-- Scores table (stores all game scores)
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  game_id VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Index for leaderboard queries
  INDEX idx_scores_game_score (game_id, score DESC),
  INDEX idx_scores_user_game (user_id, game_id)
);

-- Leaderboard view (only NFT holders)
CREATE VIEW leaderboard_entries AS
SELECT
  s.id,
  s.user_id,
  u.username,
  u.display_name,
  u.avatar_type,
  u.avatar_value,
  s.game_id,
  s.score,
  s.created_at as achieved_at,
  RANK() OVER (PARTITION BY s.game_id ORDER BY s.score DESC) as rank
FROM scores s
JOIN users u ON s.user_id = u.id
WHERE u.avatar_type = 'nft' -- ONLY NFT HOLDERS
  AND s.score = (
    SELECT MAX(score)
    FROM scores s2
    WHERE s2.user_id = s.user_id AND s2.game_id = s.game_id
  );

-- Personal stats view (all users)
CREATE VIEW personal_stats AS
SELECT
  user_id,
  game_id,
  MAX(score) as high_score,
  COUNT(*) as total_games_played,
  SUM(score) as total_score,
  AVG(score) as average_score,
  MAX(created_at) as last_played_at
FROM scores
GROUP BY user_id, game_id;
```

---

## Implementation Checklist

- [ ] Create leaderboard types and interfaces
- [ ] Implement LeaderboardContext with state management
- [ ] Build main Leaderboard component
- [ ] Create LeaderboardEntry component (list and podium views)
- [ ] Design NFTGatePrompt for non-holders
- [ ] Style all components with premium glassmorphism theme
- [ ] Create useGameScore hook for game integration
- [ ] Integrate score submission with all 9 games
- [ ] Implement backend API endpoints
- [ ] Set up database tables and views
- [ ] Test leaderboard with NFT and non-NFT users
- [ ] Test score submission and ranking updates
- [ ] Test timeframe filtering (daily, weekly, all-time)
- [ ] Add celebration animations for high scores and rankings

---

## Key Design Decisions

1. **NFT-Only Competition**: Non-NFT holders can VIEW leaderboards but cannot APPEAR on them. This creates real utility for Wojak NFTs.

2. **Personal Stats for All**: Everyone can see their own stats and high scores, even without NFT. This keeps the games fun for casual players.

3. **Multiple Timeframes**: Daily, weekly, and all-time leaderboards give players multiple ways to compete and climb ranks.

4. **Visual Distinction**: NFT holders have a gold badge/glow on their avatars, making their status immediately visible.

5. **Clear Upgrade Path**: Non-holders see a prominent but non-intrusive prompt explaining how to unlock competition.

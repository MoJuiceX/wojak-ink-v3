/**
 * Games Hub Page
 *
 * Dedicated page for all mini-games with /games route.
 * Desktop: 3-column layout (Leaderboard | Games | Stats)
 * Mobile: Scrollable single column layout.
 *
 * UPDATED: Added emoji flick voting system
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useLayout } from '@/hooks/useLayout';
import { GamesGrid, GameModal } from '@/components/media';
import { LeaderboardPanel } from '@/components/media/games/LeaderboardPanel';
import { StatsPanel } from '@/components/media/games/StatsPanel';
import { useMediaContent } from '@/hooks/data/useMediaData';
import type { MiniGame } from '@/types/media';
import { useUserProfile } from '@/contexts/UserProfileContext';

// Voting imports
import {
  FlickModeToggle,
  FlyingEmoji,
  SplatterEffect,
  HeatmapRain,
} from '@/components/voting';
import { useFlickVoting } from '@/hooks/useFlickVoting';
import { SoundManager } from '@/systems/audio';
import '@/styles/voting.css';

const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function GamesHub() {
  const { contentPadding, isDesktop } = useLayout();
  const { isSignedIn } = useUserProfile();
  // Always call the hook unconditionally
  const clerkResult = useClerk();
  const clerk = CLERK_ENABLED ? clerkResult : null;

  const handleSignInClick = useCallback(() => {
    if (clerk) {
      clerk.openSignIn();
    }
  }, [clerk]);

  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [gameModalOpen, setGameModalOpen] = useState(false);

  // Fetch games using TanStack Query
  const { games, isLoading } = useMediaContent('all');

  // === VOTING STATE ===
  const {
    activeMode,
    setActiveMode,
    addVote,
    isLoading: isVotingLoading,
  } = useFlickVoting('games');

  // Track user's vote balances (decreases when they vote)
  // Persist to localStorage so balance survives navigation
  const [donutBalance, setDonutBalance] = useState(() => {
    try {
      const saved = localStorage.getItem('wojak_donut_balance');
      return saved !== null ? parseInt(saved, 10) : 100;
    } catch {
      return 100;
    }
  });
  const [poopBalance, setPoopBalance] = useState(() => {
    try {
      const saved = localStorage.getItem('wojak_poop_balance');
      return saved !== null ? parseInt(saved, 10) : 50;
    } catch {
      return 50;
    }
  });

  // Save balances to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('wojak_donut_balance', String(donutBalance));
    } catch {
      // Ignore storage errors
    }
  }, [donutBalance]);

  useEffect(() => {
    try {
      localStorage.setItem('wojak_poop_balance', String(poopBalance));
    } catch {
      // Ignore storage errors
    }
  }, [poopBalance]);

  const toggleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [flickState, setFlickState] = useState<{
    flyingEmoji: {
      type: 'donut' | 'poop';
      start: { x: number; y: number };
      end: { x: number; y: number };
      targetId: string;
      xPercent: number;
      yPercent: number;
    } | null;
    splatter: {
      type: 'donut' | 'poop';
      position: { x: number; y: number };
    } | null;
  }>({
    flyingEmoji: null,
    splatter: null,
  });

  const [heatmapState, setHeatmapState] = useState<{
    isActive: boolean;
    type: 'donut' | 'poop';
    votes: Array<{
      id: string;
      xPercent: number;
      yPercent: number;
      targetId: string;
    }>;
  }>({
    isActive: false,
    type: 'donut',
    votes: [],
  });

  // Store user's actual votes locally for heatmap display
  const [localVotes, setLocalVotes] = useState<Array<{
    id: string;
    type: 'donut' | 'poop';
    xPercent: number;
    yPercent: number;
    targetId: string;
  }>>([]);

  // === HANDLERS ===
  const handleGameSelect = useCallback((game: MiniGame) => {
    // Don't open game if flick mode is active
    if (activeMode) return;
    setSelectedGame(game);
    setGameModalOpen(true);
  }, [activeMode]);

  const handleGameModalClose = useCallback(() => {
    setGameModalOpen(false);
    setSelectedGame(null);
  }, []);

  const getTogglePosition = useCallback(() => {
    if (!toggleRef.current) {
      return { x: window.innerWidth - 60, y: window.innerHeight - 60 };
    }
    const rect = toggleRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  // Handle card flick (called from GameCard)
  const handleCardFlick = useCallback((
    gameId: string,
    clickX: number,
    clickY: number,
    cardRect: DOMRect
  ) => {
    if (!activeMode || flickState.flyingEmoji) return;

    // Check if user has balance
    const balance = activeMode === 'donut' ? donutBalance : poopBalance;
    if (balance <= 0) return;

    const startPos = getTogglePosition();
    const xPercent = ((clickX - cardRect.left) / cardRect.width) * 100;
    const yPercent = ((clickY - cardRect.top) / cardRect.height) * 100;

    SoundManager.playVoteThrow();

    setFlickState({
      flyingEmoji: {
        type: activeMode,
        start: startPos,
        end: { x: clickX, y: clickY },
        targetId: gameId,
        xPercent,
        yPercent,
      },
      splatter: null,
    });
  }, [activeMode, flickState.flyingEmoji, getTogglePosition, donutBalance, poopBalance]);

  const handleEmojiLand = useCallback(() => {
    if (!flickState.flyingEmoji) return;

    const { type, end, targetId, xPercent, yPercent } = flickState.flyingEmoji;

    SoundManager.playVoteImpact(type);
    addVote(targetId, type, xPercent, yPercent);

    // Save vote locally for heatmap display
    setLocalVotes(prev => [...prev, {
      id: `vote-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      xPercent,
      yPercent,
      targetId,
    }]);

    // Decrease the balance
    if (type === 'donut') {
      setDonutBalance(prev => Math.max(0, prev - 1));
    } else {
      setPoopBalance(prev => Math.max(0, prev - 1));
    }

    setFlickState({
      flyingEmoji: null,
      splatter: { type, position: end },
    });
  }, [flickState.flyingEmoji, addVote]);

  const handleSplatterComplete = useCallback(() => {
    setFlickState(prev => ({ ...prev, splatter: null }));
  }, []);

  const handleShowHeatmap = useCallback((type: 'donut' | 'poop') => {
    // Toggle off if already showing
    if (heatmapState.isActive) {
      setHeatmapState({ isActive: false, type: 'donut', votes: [] });
      return;
    }

    // Filter local votes by type
    const votesForType = localVotes
      .filter(v => v.type === type)
      .map(v => ({
        id: v.id,
        xPercent: v.xPercent,
        yPercent: v.yPercent,
        targetId: v.targetId,
      }));

    console.log('Showing heatmap for', type, 'with', votesForType.length, 'votes');

    if (votesForType.length === 0) {
      console.log('No votes yet! Click on game cards to add votes first.');
      return;
    }

    SoundManager.play('vote-rain');
    setHeatmapState({ isActive: true, type, votes: votesForType });
  }, [localVotes, heatmapState.isActive]);

  const handleCloseHeatmap = useCallback(() => {
    setHeatmapState(prev => ({ ...prev, isActive: false, votes: [] }));
  }, []);

  // === RENDER ===
  const gamesGridWithVoting = (
    <GamesGrid
      games={games}
      onGameSelect={handleGameSelect}
      isLoading={isLoading}
      flickModeActive={activeMode}
      onFlick={handleCardFlick}
    />
  );

  // Desktop: 3-column layout that fits viewport
  if (isDesktop) {
    return (
      <PageTransition>
        <div
          ref={containerRef}
          className={activeMode ? 'flick-mode-active' : ''}
          style={{
            padding: contentPadding,
            height: 'calc(100vh - 64px)',
            maxHeight: 'calc(100dvh - 64px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '220px 1fr 220px',
              gap: '20px',
              minHeight: 0,
              maxWidth: '1400px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            <LeaderboardPanel />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
              {gamesGridWithVoting}
            </div>
            {/* Right column: Stats + Voting Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'auto' }}>
              <StatsPanel />
              <FlickModeToggle
                ref={toggleRef}
                activeMode={activeMode}
                onModeChange={setActiveMode}
                donutBalance={donutBalance}
                poopBalance={poopBalance}
                onShowHeatmap={handleShowHeatmap}
                isHeatmapActive={heatmapState.isActive}
                isHeatmapLoading={isVotingLoading}
                isDesktop={true}
                isSignedIn={isSignedIn}
                onSignInClick={handleSignInClick}
              />
            </div>
          </div>
        </div>

        {/* Game Modal */}
        <GameModal game={selectedGame} isOpen={gameModalOpen} onClose={handleGameModalClose} />

        {flickState.flyingEmoji && (
          <FlyingEmoji
            type={flickState.flyingEmoji.type}
            startPosition={flickState.flyingEmoji.start}
            endPosition={flickState.flyingEmoji.end}
            onComplete={handleEmojiLand}
          />
        )}

        {flickState.splatter && (
          <SplatterEffect
            type={flickState.splatter.type}
            position={flickState.splatter.position}
            onComplete={handleSplatterComplete}
          />
        )}

        {heatmapState.isActive && (
          <HeatmapRain
            votes={heatmapState.votes}
            type={heatmapState.type}
            containerRef={containerRef}
            onComplete={handleCloseHeatmap}
          />
        )}
      </PageTransition>
    );
  }

  // Mobile: Scrollable single column
  return (
    <PageTransition>
      <div
        ref={containerRef}
        className={activeMode ? 'flick-mode-active' : ''}
        style={{ padding: contentPadding, minHeight: '100%' }}
      >
        <div style={{ paddingBottom: '96px', paddingTop: '16px' }}>
          {gamesGridWithVoting}
        </div>
      </div>

      <GameModal game={selectedGame} isOpen={gameModalOpen} onClose={handleGameModalClose} />

      {/* Voting UI - Mobile: Fixed position */}
      <FlickModeToggle
        ref={toggleRef}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        donutBalance={donutBalance}
        poopBalance={poopBalance}
        onShowHeatmap={handleShowHeatmap}
        isHeatmapActive={heatmapState.isActive}
        isHeatmapLoading={isVotingLoading}
        isDesktop={false}
        isSignedIn={isSignedIn}
        onSignInClick={handleSignInClick}
      />

      {flickState.flyingEmoji && (
        <FlyingEmoji
          type={flickState.flyingEmoji.type}
          startPosition={flickState.flyingEmoji.start}
          endPosition={flickState.flyingEmoji.end}
          onComplete={handleEmojiLand}
        />
      )}

      {flickState.splatter && (
        <SplatterEffect
          type={flickState.splatter.type}
          position={flickState.splatter.position}
          onComplete={handleSplatterComplete}
        />
      )}

      {heatmapState.isActive && (
        <HeatmapRain
          votes={heatmapState.votes}
          type={heatmapState.type}
          containerRef={containerRef}
          onComplete={handleCloseHeatmap}
        />
      )}
    </PageTransition>
  );
}

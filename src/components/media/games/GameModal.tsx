/**
 * Game Modal Component
 *
 * Full-screen game container with instructions panel.
 * On desktop, renders the actual game component in a lightbox.
 */

import { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, HelpCircle } from 'lucide-react';
import type { MiniGame } from '@/types/media';
import { ACCESSIBILITY_ICONS } from '@/config/games';
import {
  gameModalOverlayVariants,
  gameModalContentVariants,
} from '@/config/mediaAnimations';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { LeaderboardOverlay } from './LeaderboardOverlay';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import type { GameId } from '@/config/query/queryKeys';
import { ArcadeFrame } from '@/components/ArcadeFrame';
import type { LightSequence } from '@/components/ArcadeButtonLights';
import { GameMuteContext } from '@/contexts/GameMuteContext';
import './GameModal.css';

// Lazy load game components
const BrickByBrick = lazy(() => import('@/pages/BrickByBrick'));
const MemoryMatch = lazy(() => import('@/pages/MemoryMatch'));
const OrangePong = lazy(() => import('@/pages/OrangePong'));
const WojakRunner = lazy(() => import('@/pages/WojakRunner'));
const OrangeJuggle = lazy(() => import('@/pages/OrangeJuggle'));
const KnifeGame = lazy(() => import('@/pages/KnifeGame'));
const ColorReaction = lazy(() => import('@/pages/ColorReaction'));
const Merge2048Game = lazy(() => import('@/games/Merge2048/Merge2048Game'));
const WordleGame = lazy(() => import('@/games/Wordle/WordleGame'));
const BlockPuzzle = lazy(() => import('@/pages/BlockPuzzle'));
const FlappyOrange = lazy(() => import('@/pages/FlappyOrange'));
const CitrusDrop = lazy(() => import('@/pages/CitrusDrop'));
const OrangeSnake = lazy(() => import('@/pages/OrangeSnake'));
const BrickBreaker = lazy(() => import('@/pages/BrickBreaker'));
const WojakWhack = lazy(() => import('@/pages/WojakWhack'));

// Map game IDs to their components
const GAME_COMPONENTS: Record<string, React.LazyExoticComponent<React.FC>> = {
  'orange-stack': BrickByBrick,
  'memory-match': MemoryMatch,
  'orange-pong': OrangePong,
  'wojak-runner': WojakRunner,
  'orange-juggle': OrangeJuggle,
  'knife-game': KnifeGame,
  'color-reaction': ColorReaction,
  'merge-2048': Merge2048Game,
  'orange-wordle': WordleGame,
  'block-puzzle': BlockPuzzle,
  'flappy-orange': FlappyOrange,
  'citrus-drop': CitrusDrop,
  'orange-snake': OrangeSnake,
  'brick-breaker': BrickBreaker,
  'wojak-whack': WojakWhack,
};

// Preload functions for each game (call the import to cache it)
const GAME_PRELOADERS: Record<string, () => Promise<unknown>> = {
  'orange-stack': () => import('@/pages/BrickByBrick'),
  'memory-match': () => import('@/pages/MemoryMatch'),
  'orange-pong': () => import('@/pages/OrangePong'),
  'wojak-runner': () => import('@/pages/WojakRunner'),
  'orange-juggle': () => import('@/pages/OrangeJuggle'),
  'knife-game': () => import('@/pages/KnifeGame'),
  'color-reaction': () => import('@/pages/ColorReaction'),
  'merge-2048': () => import('@/games/Merge2048/Merge2048Game'),
  'orange-wordle': () => import('@/games/Wordle/WordleGame'),
  'block-puzzle': () => import('@/pages/BlockPuzzle'),
  'flappy-orange': () => import('@/pages/FlappyOrange'),
  'citrus-drop': () => import('@/pages/CitrusDrop'),
  'orange-snake': () => import('@/pages/OrangeSnake'),
  'brick-breaker': () => import('@/pages/BrickBreaker'),
  'wojak-whack': () => import('@/pages/WojakWhack'),
};

// Game-specific music playlists - music starts when modal opens
const GAME_MUSIC: Record<string, string[]> = {
  'orange-stack': [
    '/audio/music/brick-by-brick/yoshis-island-final.mp3',
    '/audio/music/brick-by-brick/wandering-the-plains-final.mp3',
    '/audio/music/brick-by-brick/valley-of-bowser-final.mp3',
    '/audio/music/brick-by-brick/forest-of-illusion-final.mp3',
  ],
  'flappy-orange': [
    '/audio/music/FlappyOrange/gourmet-race-whisper.mp3',
    '/audio/music/FlappyOrange/lost-woods-whisper.mp3',
    '/audio/music/FlappyOrange/tetris-troika-whisper.mp3',
    '/audio/music/FlappyOrange/smb3-overworld-whisper.mp3',
  ],
  'block-puzzle': [
    '/audio/music/block-puzzle/tetris-theme-final.mp3',
    '/audio/music/block-puzzle/mt-dedede-final.mp3',
    '/audio/music/block-puzzle/smb-underwater-final.mp3',
    '/audio/music/block-puzzle/street-fighter-balrog-final.mp3',
  ],
  'memory-match': [
    '/audio/music/memory-match/megaman-cutman-final.mp3',
    '/audio/music/memory-match/megaman-elecman-final.mp3',
    '/audio/music/memory-match/megaman-fireman-final.mp3',
    '/audio/music/memory-match/sf2-zangief-final.mp3',
  ],
  'wojak-runner': [
    '/audio/music/wojak-runner/sonic-green-hill-final.mp3',
    '/audio/music/wojak-runner/sonic-chemical-plant-final.mp3',
    '/audio/music/wojak-runner/street-fighter-mbison-final.mp3',
    '/audio/music/wojak-runner/street-fighter-vega-final.mp3',
  ],
  'color-reaction': [
    '/audio/music/color-reaction/smb-main-theme-final.mp3',
    '/audio/music/color-reaction/smw-overworld-final.mp3',
    '/audio/music/color-reaction/smb-underground-final.mp3',
    '/audio/music/color-reaction/smw-title-theme-final.mp3',
  ],
  'merge-2048': [
    '/audio/music/2048-merge/sf2-chunli-final.mp3',
    '/audio/music/2048-merge/sf2-blanka-final.mp3',
    '/audio/music/2048-merge/sf2-sagat-final.mp3',
    '/audio/music/2048-merge/sf2-ending-final.mp3',
  ],
};

interface GameModalProps {
  game: MiniGame | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GameModal({ game, isOpen, onClose }: GameModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [_gameReady, setGameReady] = useState(false);
  const [lightSequence, setLightSequence] = useState<LightSequence>('off');
  const [isMuted, setIsMuted] = useState(false);
  const isMobile = useIsMobile();

  // Game music management
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistIndexRef = useRef(0);
  const isMutedRef = useRef(false); // Ref for checking mute state in callbacks (avoids stale closures)

  // Keep isMutedRef in sync with isMuted state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Play a track from the game's playlist
  const playGameMusic = useCallback((gameId: string) => {
    const playlist = GAME_MUSIC[gameId];
    if (!playlist || playlist.length === 0) return;

    // Start with random track
    playlistIndexRef.current = Math.floor(Math.random() * playlist.length);
    const track = playlist[playlistIndexRef.current];

    // Stop any existing music
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(track);
    audio.volume = 1.0;

    // When song ends, play next track (use ref to avoid stale closure)
    const handleEnded = () => {
      if (!isMutedRef.current) {
        playlistIndexRef.current = (playlistIndexRef.current + 1) % playlist.length;
        const nextTrack = playlist[playlistIndexRef.current];
        audio.src = nextTrack;
        audio.play().catch(() => {});
      }
    };
    audio.addEventListener('ended', handleEnded);

    audioRef.current = audio;
    audio.play().catch(() => {}); // Handle autoplay restrictions silently
  }, []); // No dependencies - uses refs for mutable values

  // Stop game music
  const stopGameMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  // Reset when modal closes or game changes
  useEffect(() => {
    if (!isOpen) {
      setGameStarted(false);
      setGameReady(false);
      setShowInstructions(false);
      setShowLeaderboard(false);
      setLightSequence('off');
      setIsMuted(false);
      stopGameMusic();

      // Exit fullscreen when game closes
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitFullscreenElement) {
        (document as any).webkitExitFullscreen?.();
      }
    } else {
      // Go directly to idle for testing (skip startup for now)
      setLightSequence('idle');
      // Start game music immediately when modal opens
      if (game?.id && GAME_MUSIC[game.id]) {
        playGameMusic(game.id);
      }
    }
  }, [isOpen, game?.id, playGameMusic, stopGameMusic]);

  // Handle mute toggle - simple pause/resume
  const handleMuteToggle = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      // If GameModal manages music, control it directly
      if (audioRef.current) {
        if (newMuted) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(() => {});
        }
      }
      return newMuted;
    });
  }, []);

  // Preload game component when modal opens (so it's ready when user clicks Play)
  useEffect(() => {
    if (isOpen && game?.id && GAME_PRELOADERS[game.id]) {
      GAME_PRELOADERS[game.id]().then(() => {
        setGameReady(true);
      });
    }
  }, [isOpen, game?.id]);

  // Transition from startup to idle
  const handleLightSequenceComplete = () => {
    if (lightSequence === 'startup') {
      setLightSequence('idle');
    } else if (lightSequence === 'gameStart') {
      // After game start burst, turn off (game is now in focus)
      setLightSequence('off');
    }
  };

  // Handle play button click with light sequence
  const handlePlayClick = () => {
    setLightSequence('gameStart');
    setGameStarted(true);

    // Request fullscreen on mobile for immersive gameplay
    if (isMobile) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if ((elem as any).webkitRequestFullscreen) {
        // Safari/iOS
        (elem as any).webkitRequestFullscreen();
      }
    }
  };

  // Hide bottom navigation during gameplay on mobile
  useEffect(() => {
    if (isMobile && gameStarted) {
      document.body.classList.add('game-fullscreen-mode');
    } else {
      document.body.classList.remove('game-fullscreen-mode');
    }

    return () => {
      document.body.classList.remove('game-fullscreen-mode');
    };
  }, [isMobile, gameStarted]);

  // Add class when arcade frame is visible (desktop only)
  useEffect(() => {
    const showArcadeFrame = !isMobile && isOpen && game?.status !== 'coming-soon';
    if (showArcadeFrame) {
      document.body.classList.add('arcade-frame-visible');
    } else {
      document.body.classList.remove('arcade-frame-visible');
    }

    return () => {
      document.body.classList.remove('arcade-frame-visible');
    };
  }, [isMobile, isOpen, game?.status]);

  // Browser back button support - push state when modal opens, close on popstate
  useEffect(() => {
    if (!isOpen) return;

    // Push a state when modal opens so back button has something to pop
    const stateId = `game-modal-${game?.id}-${Date.now()}`;
    window.history.pushState({ gameModal: stateId }, '');

    const handlePopState = (event: PopStateEvent) => {
      // If we're going back from our pushed state, close the modal
      if (!event.state?.gameModal || event.state.gameModal !== stateId) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If modal is closing normally (not via back button), clean up the history entry
      // Check if the current state is still our pushed state
      if (window.history.state?.gameModal === stateId) {
        window.history.back();
      }
    };
  }, [isOpen, game?.id, onClose]);

  // Fetch leaderboard data for intro screen
  const { leaderboard: introLeaderboard } = useLeaderboard(game?.id as GameId);

  if (!game) return null;

  const isComingSoon = game.status === 'coming-soon';

  const accessibilityList = Object.entries(game.accessibilityFeatures)
    .filter(([, enabled]) => enabled)
    .map(([key]) => ({
      key,
      ...ACCESSIBILITY_ICONS[key as keyof typeof ACCESSIBILITY_ICONS],
    }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - no onClick, only close button closes the modal */}
          {/* This allows games to receive clicks anywhere on screen */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0, 0, 0, 0.9)' }}
            variants={prefersReducedMotion ? undefined : gameModalOverlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />

          {/* External buttons - only show for mobile or coming soon (arcade frame has its own buttons) */}
          {/* Skip if game has its own controls (e.g., Block Puzzle has back/pause buttons) */}
          {(isMobile || isComingSoon) && (gameStarted || isComingSoon) && !game.hasOwnControls && (
            <div
              className="fixed z-[110] flex flex-col gap-3"
              style={{ top: '16px', right: '12px', pointerEvents: 'auto' }}
            >
              {/* Help button - only during gameplay on mobile */}
              {gameStarted && !isComingSoon && (
                <motion.button
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 44,
                    height: 44,
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowInstructions(!showInstructions);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInstructions(!showInstructions);
                  }}
                  aria-label="Show instructions"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <HelpCircle size={22} />
                </motion.button>
              )}

              {/* Close button */}
              <motion.button
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 44,
                  height: 44,
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                aria-label="Close game"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <X size={22} />
              </motion.button>
            </div>
          )}

          {/* Modal content - centering wrapper */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{
              // Mobile: minimal padding to maximize game area
              // Arcade frame: no padding needed (fills screen)
              // When gameStarted on mobile, all padding removed for full screen experience
              paddingTop: isMobile ? (gameStarted ? '0' : '45px') : (game.id === 'memory-match' ? '55px' : '0'),
              paddingBottom: isMobile ? (gameStarted ? '0' : '60px') : (game.id === 'memory-match' ? '15px' : '0'),
              paddingLeft: isMobile ? '0' : (game.id === 'memory-match' ? '72px' : '0'),
              paddingRight: isMobile ? '0' : (game.id === 'memory-match' ? '72px' : '0'),
            }}
          >
            {/* Arcade Frame wrapper - shows for ALL states on desktop (intro, gameplay, game over) */}
            {(() => {
              const frameVariant = 'standard';
              // Show arcade frame on desktop for all games (not mobile, not coming soon)
              const showArcadeFrame = !isMobile && !isComingSoon;

              if (showArcadeFrame) {
                // Arcade frame covers entire screen - contains intro OR game
                return (
                  <motion.div
                    className="arcade-frame-wrapper"
                    variants={prefersReducedMotion ? undefined : gameModalContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <ArcadeFrame
                      variant={frameVariant}
                      lightSequence={lightSequence}
                      onLightSequenceComplete={handleLightSequenceComplete}
                      showIntroButtons={true}
                      onHelpClick={() => setShowInstructions(prev => !prev)}
                      onCloseClick={onClose}
                      isMuted={isMuted}
                      onMuteClick={handleMuteToggle}
                    >
                      {/* Game content - renders behind intro, fades in when started */}
                      <div
                        className={`arcade-game-layer ${gameStarted ? 'active' : 'inactive'}`}
                        style={{
                          opacity: gameStarted ? 1 : 0,
                          transition: 'opacity 0.4s ease-out',
                          pointerEvents: gameStarted ? 'auto' : 'none',
                        }}
                      >
                        <GameMuteContext.Provider value={{ isMuted, setIsMuted, toggleMute: () => setIsMuted(prev => !prev), musicManagedExternally: !!GAME_MUSIC[game.id], gameStarted }}>
                          <Suspense
                            fallback={
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ background: '#000' }}
                              >
                                <div className="text-center">
                                  <div className="text-4xl mb-4">{game.emoji}</div>
                                  <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
                                </div>
                              </div>
                            }
                          >
                            {GAME_COMPONENTS[game.id] ? (
                              (() => {
                                const GameComponent = GAME_COMPONENTS[game.id];
                                return <GameComponent />;
                              })()
                            ) : null}
                          </Suspense>
                        </GameMuteContext.Provider>
                      </div>

                      {/* Intro Screen - only render when game hasn't started */}
                      {!gameStarted && (
                      <div
                        className="arcade-intro-screen"
                      >
                          {/* Background with blur and rounded corners */}
                          <div
                            className="arcade-intro-bg"
                            style={{
                              backgroundImage: `url('${game.introBackground || '/assets/wojak-layers/BACKGROUND/Scene/BACKGROUND_Orange Grove.png'}')`,
                            }}
                          />

                          {/* Dark gradient overlay for readability */}
                          <div className="arcade-intro-overlay" />

                          {/* Leaderboard Panel - slides in from left */}
                          <div className={`arcade-leaderboard-panel ${showLeaderboard ? 'visible' : ''}`}>
                            <div className="arcade-leaderboard-content">
                              <div className="arcade-leaderboard-list">
                                {Array.from({ length: 10 }, (_, index) => {
                                  const entry = introLeaderboard[index];
                                  const mockNames = ['OrangeKing', 'FlappyMaster', 'PipeDreamer', 'SkyHopper', 'CitrusNinja', 'WojakPro', 'JuicyPlayer', 'AirBender', 'PipeWizard', 'CloudSurfer'];
                                  const mockScores = [156, 142, 128, 115, 98, 87, 72, 65, 54, 41];
                                  const displayName = entry?.displayName || mockNames[index];
                                  const displayScore = entry?.score ?? mockScores[index];
                                  return (
                                    <div key={index} className="arcade-leaderboard-entry">
                                      <span className="arcade-leaderboard-rank">#{index + 1}</span>
                                      <div className="arcade-leaderboard-avatar">
                                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayName}`} alt="" />
                                      </div>
                                      <span className="arcade-leaderboard-name">{displayName}</span>
                                      <span className="arcade-leaderboard-score">{displayScore}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Premium centered card layout - pushes right when leaderboard opens */}
                          <div className={`arcade-intro-card ${showLeaderboard ? 'pushed' : ''}`}>
                            {/* Juiced-up title with glow and animation */}
                            <div
                              className="arcade-game-title"
                              style={{
                                color: 'white',
                                '--glow-color': game.accentColor,
                              } as React.CSSProperties}
                            >
                              {game.name}
                            </div>

                            {/* Big bouncing emoji/mascot */}
                            <div className="arcade-game-mascot">{game.emoji}</div>

                            {/* Action buttons - stacked and cohesive */}
                            <div className="arcade-buttons-stack">
                              <button
                                className="arcade-play-btn"
                                onClick={handlePlayClick}
                                style={{
                                  background: 'linear-gradient(180deg, #60a5fa 0%, #1e40af 100%)',
                                  boxShadow: '0 6px 24px rgba(30, 64, 175, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
                                }}
                              >
                                <span className="play-icon">▶</span>
                                PLAY
                              </button>

                              {game.hasHighScores && (
                                <button
                                  className={`arcade-leaderboard-btn ${showLeaderboard ? 'active' : ''}`}
                                  onClick={() => setShowLeaderboard(!showLeaderboard)}
                                  style={{
                                    borderColor: `${game.accentColor}60`,
                                  }}
                                >
                                  <span className="trophy-icon">🏆</span>
                                  Leaderboard
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Instructions overlay inside arcade frame */}
                          <AnimatePresence>
                            {showInstructions && (
                              <motion.div
                                className="absolute inset-0 z-50 flex items-center justify-center"
                                style={{ background: 'rgba(0, 0, 0, 0.85)' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={(e) => { e.stopPropagation(); setShowInstructions(false); }}
                              >
                                <motion.div
                                  className="w-fit max-h-[80%] overflow-y-auto p-6 rounded-xl whitespace-nowrap"
                                  style={{
                                    background: 'var(--color-bg-primary)',
                                    border: `1px solid ${game.accentColor}40`,
                                  }}
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.9, opacity: 0 }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <h2
                                    className="text-lg font-bold mb-4 text-center"
                                    style={{ color: game.accentColor }}
                                  >
                                    How to Play
                                  </h2>
                                  <ol className="space-y-3">
                                    {game.instructions.map((instruction) => (
                                      <li
                                        key={instruction.step}
                                        className="flex items-start gap-2 text-sm"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                      >
                                        <span
                                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                                          style={{
                                            background: `${game.accentColor}30`,
                                            color: game.accentColor,
                                          }}
                                        >
                                          {instruction.step}
                                        </span>
                                        <span>{instruction.text}</span>
                                      </li>
                                    ))}
                                  </ol>
                                  {game.controls.length > 0 && (
                                    <div className="mt-6">
                                      <h3
                                        className="text-sm font-semibold mb-3"
                                        style={{ color: 'var(--color-text-primary)' }}
                                      >
                                        Controls
                                      </h3>
                                      <div className="space-y-2">
                                        {game.controls.map((control, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between p-2 rounded-lg"
                                            style={{ background: 'var(--color-glass-bg)' }}
                                          >
                                            <span
                                              className="text-xs font-mono px-2 py-1 rounded"
                                              style={{
                                                background: `${game.accentColor}20`,
                                                color: game.accentColor,
                                              }}
                                            >
                                              {control.input}
                                            </span>
                                            <span
                                              className="text-sm"
                                              style={{ color: 'var(--color-text-secondary)' }}
                                            >
                                              {control.action}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      )}
                    </ArcadeFrame>
                  </motion.div>
                );
              }

              // Regular modal (mobile, coming soon, wide games like memory-match)
              return (
            <motion.div
              className={`flex flex-col pointer-events-auto ${isMobile ? '' : 'rounded-2xl'}`}
              style={{
                // Mobile: TRUE full-screen (edge to edge), Desktop: constrained
                // Memory Match uses fit-content ONLY during gameplay (not intro)
                // When gameStarted on mobile, use full screen height (no subtraction)
                width: isMobile
                  ? '100vw'
                  : (game.id === 'memory-match' && gameStarted ? 'fit-content' : 'min(75vw, 900px)'),
                // Mobile: use dvh for better iOS Safari support, full screen when game started
                height: isMobile
                  ? (gameStarted ? '100dvh' : 'calc(100dvh - 105px)')
                  : (game.id === 'memory-match' && gameStarted ? 'fit-content' : '88vh'),
                maxWidth: game.id === 'memory-match' && gameStarted && !isMobile ? 'calc(100vw - 145px)' : undefined,
                maxHeight: isMobile ? (gameStarted ? '100dvh' : 'calc(100dvh - 105px)') : 'calc(100vh - 70px)',
                background: isMobile
                  ? 'transparent' // Let game background show through on mobile
                  : `linear-gradient(135deg, ${game.accentColor}15 0%, ${game.accentColor}05 100%)`,
                border: isMobile ? 'none' : `1px solid ${game.accentColor}40`,
                boxShadow: isMobile ? 'none' : `0 8px 32px ${game.accentColor}20, 0 0 0 1px ${game.accentColor}10`,
                overflow: 'hidden',
              }}
              variants={prefersReducedMotion ? undefined : gameModalContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
            {/* Main content area */}
            <div className="flex-1 flex overflow-hidden min-h-0 relative">
              {/* Intro Screen - shows before game starts */}
              {!gameStarted && !isComingSoon && (
                <div
                  className="game-intro-screen"
                  style={{
                    backgroundImage: `url('${game.introBackground || '/assets/wojak-layers/BACKGROUND/Scene/BACKGROUND_Orange Grove.png'}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Premium Glassmorphism Header Bar */}
                  <div className="game-intro-header-bar">
                    <button
                      className="game-intro-header-btn"
                      onClick={() => setShowInstructions(true)}
                      aria-label="How to play"
                    >
                      <HelpCircle size={20} />
                    </button>
                    <span className="game-intro-header-title">{game.name}</span>
                    <button
                      className="game-intro-header-btn"
                      onClick={onClose}
                      aria-label="Close game"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="game-intro-content">
                    <div className="game-intro-emoji">{game.emoji}</div>
                    <p className="game-intro-description">
                      {game.shortDescription || game.description}
                    </p>

                    <button
                      className="game-intro-play-btn"
                      onClick={() => setGameStarted(true)}
                      style={{
                        background: `linear-gradient(135deg, ${game.accentColor} 0%, ${game.accentColor}cc 100%)`,
                        boxShadow: `0 4px 24px ${game.accentColor}60, 0 0 60px ${game.accentColor}30`,
                      }}
                    >
                      PLAY
                    </button>

                    {game.hasHighScores && (
                      <button
                        className="game-intro-leaderboard-link"
                        onClick={() => setShowLeaderboard(true)}
                      >
                        🏆 View Leaderboard <span className="arrow">→</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Coming Soon state */}
              {isComingSoon && (
                <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex items-center justify-center p-4">
                  <div className="text-center max-w-md">
                    <div className="text-8xl mb-6">{game.emoji}</div>
                    <h3
                      className="text-2xl font-bold mb-4"
                      style={{ color: game.accentColor }}
                    >
                      Coming Soon!
                    </h3>
                    <p
                      className="text-base mb-6"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {game.description}
                    </p>

                    {/* Accessibility features */}
                    <div
                      className="p-4 rounded-xl mb-4"
                      style={{
                        background: 'var(--color-glass-bg)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <h4
                        className="text-sm font-medium mb-3"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        Accessibility Features
                      </h4>
                      <div className="flex flex-wrap justify-center gap-3">
                        {accessibilityList.map(({ key, icon, label }) => (
                          <div
                            key={key}
                            className="flex items-center gap-1 text-sm"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <span>{icon}</span>
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Game area - only renders when game has started (mobile or wide games only - arcade frame handles desktop) */}
              {gameStarted && !isComingSoon && (
                <div className="w-full h-full overflow-hidden" style={{ position: 'relative' }}>
                  {/* CRITICAL: Mobile needs GameMuteContext.Provider too! Without it, musicManagedExternally is false and games start their own music */}
                  <GameMuteContext.Provider value={{ isMuted, setIsMuted, toggleMute: () => setIsMuted(prev => !prev), musicManagedExternally: !!GAME_MUSIC[game.id], gameStarted }}>
                    <Suspense
                      fallback={
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: 'var(--color-glass-bg)' }}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-4">{game.emoji}</div>
                            <p style={{ color: 'var(--color-text-muted)' }}>Loading game...</p>
                          </div>
                        </div>
                      }
                    >
                      {GAME_COMPONENTS[game.id] ? (
                        (() => {
                          const GameComponent = GAME_COMPONENTS[game.id];
                          return <GameComponent />;
                        })()
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: 'var(--color-glass-bg)' }}
                        >
                          <p style={{ color: 'var(--color-text-muted)' }}>
                            Game not available
                          </p>
                        </div>
                      )}
                    </Suspense>
                  </GameMuteContext.Provider>
                </div>
              )}
            </div>

            {/* Instructions overlay - renders on top of game */}
            <AnimatePresence>
              {showInstructions && (
                <motion.div
                  className="absolute inset-0 z-50 flex items-center justify-center"
                  style={{ background: 'rgba(0, 0, 0, 0.85)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={(e) => { e.stopPropagation(); setShowInstructions(false); }}
                >
                  <motion.div
                    className="w-fit max-h-[80%] overflow-y-auto p-6 rounded-xl whitespace-nowrap"
                    style={{
                      background: 'var(--color-bg-primary)',
                      border: `1px solid ${game.accentColor}40`,
                    }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Title */}
                    <h2
                      className="text-lg font-bold mb-4 text-center"
                      style={{ color: game.accentColor }}
                    >
                      How to Play
                    </h2>

                    {/* Instructions */}
                    <ol className="space-y-3">
                      {game.instructions.map((instruction) => (
                        <li
                          key={instruction.step}
                          className="flex items-start gap-2 text-sm"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          <span
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              background: `${game.accentColor}30`,
                              color: game.accentColor,
                            }}
                          >
                            {instruction.step}
                          </span>
                          <span>{instruction.text}</span>
                        </li>
                      ))}
                    </ol>

                    {/* Controls - only show if there are any */}
                    {game.controls.length > 0 && (
                      <div className="mt-6">
                        <h3
                          className="text-sm font-semibold mb-3"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          Controls
                        </h3>
                        <div className="space-y-2">
                          {game.controls.map((control, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 rounded-lg"
                              style={{
                                background: 'var(--color-glass-bg)',
                              }}
                            >
                              <span
                                className="text-xs font-mono px-2 py-1 rounded"
                                style={{
                                  background: `${game.accentColor}20`,
                                  color: game.accentColor,
                                }}
                              >
                                {control.input}
                              </span>
                              <span
                                className="text-sm"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {control.action}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Leaderboard Overlay */}
            <LeaderboardOverlay
              isOpen={showLeaderboard}
              onClose={() => setShowLeaderboard(false)}
              gameId={game.id}
              accentColor={game.accentColor}
            />

          </motion.div>
              );
            })()}
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GameModal;

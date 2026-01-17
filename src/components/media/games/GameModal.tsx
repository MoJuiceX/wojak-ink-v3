/**
 * Game Modal Component
 *
 * Full-screen game container with instructions panel.
 * On desktop, renders the actual game component in a lightbox.
 */

import { useState, useEffect, lazy, Suspense } from 'react';
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
import './GameModal.css';

// Lazy load game components
const OrangeStack = lazy(() => import('@/pages/OrangeStack'));
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
  'orange-stack': OrangeStack,
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
  const isMobile = useIsMobile();

  // Reset when modal closes or game changes
  useEffect(() => {
    if (!isOpen) {
      setGameStarted(false);
      setShowInstructions(false);
      setShowLeaderboard(false);
    }
  }, [isOpen]);

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

          {/* External buttons - only show during gameplay (× only) or for coming soon */}
          {(gameStarted || isComingSoon) && (
            <div className="fixed z-[60] flex gap-2" style={{ top: '1rem', right: '1rem' }}>
              {/* Help button - only during gameplay */}
              {gameStarted && (
                <motion.button
                  className="p-2 rounded-full"
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                  onClick={() => setShowInstructions(!showInstructions)}
                  aria-label="Show instructions"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                >
                  <HelpCircle size={20} />
                </motion.button>
              )}

              {/* Close button */}
              <motion.button
                className="p-2 rounded-full"
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
                onClick={onClose}
                aria-label="Close game"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
              >
                <X size={20} />
              </motion.button>
            </div>
          )}

          {/* Modal content - centering wrapper */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{
              // Mobile: minimal padding to maximize game area
              // When gameStarted on mobile, bottom nav is hidden so use minimal padding
              paddingTop: isMobile ? '45px' : (game.id === 'memory-match' ? '55px' : '60px'),
              paddingBottom: isMobile ? (gameStarted ? '10px' : '60px') : (game.id === 'memory-match' ? '15px' : '20px'),
              paddingLeft: isMobile ? '0' : (game.id === 'memory-match' ? '90px' : '20px'),
              paddingRight: isMobile ? '0' : (game.id === 'memory-match' ? '55px' : '20px'),
            }}
          >
            <motion.div
              className={`flex flex-col pointer-events-auto ${isMobile ? '' : 'rounded-2xl'}`}
              style={{
                // Mobile: TRUE full-screen (edge to edge), Desktop: constrained
                // Memory Match uses fit-content ONLY during gameplay (not intro)
                // When gameStarted on mobile, bottom nav is hidden so use more height
                width: isMobile
                  ? '100vw'
                  : (game.id === 'memory-match' && gameStarted ? 'fit-content' : 'min(75vw, 900px)'),
                height: isMobile
                  ? (gameStarted ? 'calc(100vh - 55px)' : 'calc(100vh - 105px)') // 45px header (+ 60px tab bar when not started)
                  : (game.id === 'memory-match' && gameStarted ? 'fit-content' : '88vh'),
                maxWidth: game.id === 'memory-match' && gameStarted && !isMobile ? 'calc(100vw - 145px)' : undefined,
                maxHeight: isMobile ? (gameStarted ? 'calc(100vh - 55px)' : 'calc(100vh - 105px)') : 'calc(100vh - 70px)',
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

              {/* Game area - only renders when game has started */}
              {gameStarted && !isComingSoon && (
                <div className="w-full h-full overflow-hidden" style={{ position: 'relative' }}>
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
                  onClick={() => setShowInstructions(false)}
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GameModal;

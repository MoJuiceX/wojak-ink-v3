/**
 * Game Modal Component
 *
 * Full-screen game container with instructions panel.
 * On desktop, renders the actual game component in a lightbox.
 */

import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, HelpCircle, ChevronRight } from 'lucide-react';
import type { MiniGame } from '@/types/media';
import { ACCESSIBILITY_ICONS } from '@/config/games';
import {
  gameModalOverlayVariants,
  gameModalContentVariants,
} from '@/config/mediaAnimations';

// Lazy load game components
const OrangeStack = lazy(() => import('@/pages/OrangeStack'));
const MemoryMatch = lazy(() => import('@/pages/MemoryMatch'));
const OrangePong = lazy(() => import('@/pages/OrangePong'));
const WojakRunner = lazy(() => import('@/pages/WojakRunner'));
const OrangeJuggle = lazy(() => import('@/pages/OrangeJuggle'));
const KnifeGame = lazy(() => import('@/pages/KnifeGame'));

// Map game IDs to their components
const GAME_COMPONENTS: Record<string, React.LazyExoticComponent<React.FC>> = {
  'orange-stack': OrangeStack,
  'memory-match': MemoryMatch,
  'orange-pong': OrangePong,
  'wojak-runner': WojakRunner,
  'orange-juggle': OrangeJuggle,
  'knife-game': KnifeGame,
};

interface GameModalProps {
  game: MiniGame | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GameModal({ game, isOpen, onClose }: GameModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showInstructions, setShowInstructions] = useState(false);

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
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0, 0, 0, 0.9)' }}
            variants={prefersReducedMotion ? undefined : gameModalOverlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />

          {/* External buttons - always visible outside the lightbox */}
          <div className="fixed z-[60] flex gap-2" style={{ top: '1rem', right: '1rem' }}>
            {/* Help button */}
            <motion.button
              className="p-3 rounded-full"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
              }}
              onClick={() => setShowInstructions(!showInstructions)}
              aria-label="Show instructions"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <HelpCircle size={24} />
            </motion.button>

            {/* Close button */}
            <motion.button
              className="p-3 rounded-full"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
              }}
              onClick={onClose}
              aria-label="Close game"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* Modal content - centering wrapper */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{
              paddingTop: game.id === 'memory-match' ? '55px' : '60px',
              paddingBottom: game.id === 'memory-match' ? '15px' : '20px',
              paddingLeft: game.id === 'memory-match' ? '90px' : '20px',
              paddingRight: game.id === 'memory-match' ? '55px' : '20px',
            }}
          >
            <motion.div
              className="rounded-2xl flex flex-col pointer-events-auto"
              style={{
                // Memory Match: fit content - lightbox wraps tightly around cards
                width: game.id === 'memory-match' ? 'fit-content' : 'min(75vw, 900px)',
                height: game.id === 'memory-match' ? 'fit-content' : '80vh',
                maxWidth: game.id === 'memory-match' ? 'calc(100vw - 145px)' : undefined,
                maxHeight: 'calc(100vh - 70px)',
                background: `linear-gradient(135deg, ${game.accentColor}15 0%, ${game.accentColor}05 100%)`,
                border: `1px solid ${game.accentColor}`,
                overflow: 'hidden',
              }}
              variants={prefersReducedMotion ? undefined : gameModalContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
            {/* Main content area */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Game area */}
              <div className={`flex-1 min-h-0 min-w-0 overflow-hidden ${isComingSoon ? 'flex items-center justify-center p-4' : ''}`}>
                {isComingSoon ? (
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

                    {/* Instructions preview */}
                    <div
                      className="p-4 rounded-xl"
                      style={{
                        background: 'var(--color-glass-bg)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <h4
                        className="text-sm font-medium mb-3"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        How to Play
                      </h4>
                      <ol className="space-y-2 text-left">
                        {game.instructions.slice(0, 3).map((instruction) => (
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
                      {game.instructions.length > 3 && (
                        <button
                          className="mt-3 text-sm flex items-center gap-1"
                          style={{ color: game.accentColor }}
                          onClick={() => setShowInstructions(true)}
                        >
                          View all instructions
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full overflow-hidden relative">
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

          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GameModal;

/**
 * Game Modal Component
 *
 * Full-screen game container with instructions panel.
 */

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, HelpCircle, ChevronRight } from 'lucide-react';
import type { MiniGame } from '@/types/media';
import { ACCESSIBILITY_ICONS, DIFFICULTY_COLORS } from '@/config/games';
import {
  gameModalOverlayVariants,
  gameModalContentVariants,
  instructionsPanelVariants,
} from '@/config/mediaAnimations';

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

          {/* Modal content */}
          <motion.div
            className="fixed inset-4 sm:inset-8 lg:inset-16 z-50 rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'var(--color-bg-secondary)',
              border: `1px solid ${game.accentColor}`,
            }}
            variants={prefersReducedMotion ? undefined : gameModalContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4"
              style={{ borderBottom: `1px solid ${game.accentColor}40` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{game.emoji}</span>
                <div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {game.name}
                  </h2>
                  {game.difficulty && (
                    <span
                      className="text-xs"
                      style={{ color: DIFFICULTY_COLORS[game.difficulty] }}
                    >
                      {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
                      {game.estimatedPlayTime && ` • ${game.estimatedPlayTime}`}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    background: 'var(--color-glass-bg)',
                    color: 'var(--color-text-secondary)',
                  }}
                  onClick={() => setShowInstructions(!showInstructions)}
                  aria-label="Toggle instructions"
                >
                  <HelpCircle size={20} />
                </button>
                <button
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    background: 'var(--color-glass-bg)',
                    color: 'var(--color-text-secondary)',
                  }}
                  onClick={onClose}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Game area */}
              <div className="flex-1 flex items-center justify-center p-4">
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
                  <div
                    className="w-full max-w-4xl aspect-video rounded-xl flex items-center justify-center"
                    style={{
                      background: 'var(--color-glass-bg)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <p style={{ color: 'var(--color-text-muted)' }}>
                      Game canvas would render here
                    </p>
                  </div>
                )}
              </div>

              {/* Instructions panel */}
              <AnimatePresence>
                {showInstructions && (
                  <motion.div
                    className="w-80 flex-shrink-0 overflow-y-auto p-4"
                    style={{
                      background: 'var(--color-bg-primary)',
                      borderLeft: '1px solid var(--color-border)',
                    }}
                    variants={prefersReducedMotion ? undefined : instructionsPanelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {/* Instructions */}
                    <div className="mb-6">
                      <h3
                        className="text-sm font-semibold mb-3"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        Instructions
                      </h3>
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
                    </div>

                    {/* Controls */}
                    <div>
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer (for available games) */}
            {!isComingSoon && (
              <div
                className="flex items-center justify-between p-4"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Score: 0 | High Score: 0
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      background: 'var(--color-glass-bg)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Pause
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      background: game.accentColor,
                      color: 'white',
                    }}
                  >
                    Restart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GameModal;

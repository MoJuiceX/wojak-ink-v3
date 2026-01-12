/**
 * BigPulpCharacter Component
 *
 * Animated BigPulp character with speech bubble and typing animation.
 */

import { useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { BigPulpState } from '@/types/bigpulp';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import {
  characterIdleVariants,
  speechBubbleVariants,
  speechBubbleTransition,
  TYPING_CONFIG,
} from '@/config/bigpulpAnimations';

interface BigPulpCharacterProps {
  state: BigPulpState;
  onMessageComplete?: () => void;
  onSkipMessage?: () => void;
  compact?: boolean;
}

// BigPulp character image variants
const BIGPULP_VARIANTS: Record<string, string> = {
  default: '/assets/BigPulp/art/BigP_base.png',
  crown: '/assets/BigPulp/art/BigP_crown.png',
  beret: '/assets/BigPulp/art/BigP_beret.png',
  fedora: '/assets/BigPulp/art/BigP_Fedora.png',
  viking: '/assets/BigPulp/art/BigP_viking.png',
  propeller: '/assets/BigPulp/art/BigP_propeller.png',
  tin: '/assets/BigPulp/art/BigP_tin.png',
  clown: '/assets/BigPulp/art/BigP_clown.png',
  'super-wojak': '/assets/BigPulp/art/BigP_super_wojak.png',
  'wiz-orange': '/assets/BigPulp/art/BigP_wiz_orange.png',
  'wiz-blue': '/assets/BigPulp/art/BigP_wiz_blue.png',
  'wiz-pink': '/assets/BigPulp/art/BigP_wiz_pink.png',
  'wiz-red': '/assets/BigPulp/art/BigP_wiz_red.png',
  'wiz-yellow': '/assets/BigPulp/art/BigP_wiz_yellow.png',
  'wiz-dark-blue': '/assets/BigPulp/art/BigP_wiz_dark_blue.png',
};

// BigPulp mood to expression mapping (for overlay emoji)
const MOOD_EXPRESSIONS: Record<string, string> = {
  neutral: '😐',
  excited: '🤩',
  thinking: '🤔',
  impressed: '😮',
  suspicious: '🤨',
  chill: '😎',
};

export function BigPulpCharacter({
  state,
  onMessageComplete,
  onSkipMessage,
  compact = false,
}: BigPulpCharacterProps) {
  const prefersReducedMotion = useReducedMotion();

  // Typing animation for current message
  const { displayedText, isTyping, cursorVisible, skip } = useTypingAnimation(
    state.message,
    {
      onComplete: () => {
        // Advance queue after delay if there are more messages
        if (state.messageQueue.length > 0) {
          setTimeout(() => {
            onMessageComplete?.();
          }, TYPING_CONFIG.messageDelay);
        } else {
          onMessageComplete?.();
        }
      },
    }
  );

  // Handle click to skip message
  const handleBubbleClick = useCallback(() => {
    if (isTyping) {
      skip();
    } else if (state.messageQueue.length > 0) {
      onSkipMessage?.();
    }
  }, [isTyping, skip, state.messageQueue.length, onSkipMessage]);

  // Handle keyboard skip
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleBubbleClick();
      }
    },
    [handleBubbleClick]
  );

  const characterSize = compact ? 80 : 160;
  const bubbleMaxWidth = compact ? 180 : 280;

  // Get the appropriate character image
  const characterImage = BIGPULP_VARIANTS[state.headVariant] || BIGPULP_VARIANTS.default;

  return (
    <div
      className={`flex items-start gap-4 ${compact ? 'flex-row' : 'flex-col sm:flex-row'}`}
    >
      {/* Character with orange gradient background */}
      <motion.div
        className="relative flex-shrink-0 rounded-2xl overflow-hidden"
        style={{
          width: characterSize,
          height: characterSize,
          background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 25%, #FFA500 50%, #32CD32 75%, #228B22 100%)',
        }}
        variants={prefersReducedMotion ? undefined : characterIdleVariants}
        animate="idle"
      >
        {/* Character image */}
        <motion.img
          key={characterImage}
          src={characterImage}
          alt="BigPulp character"
          className="absolute inset-0 w-full h-full object-contain"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Mood expression overlay */}
        <motion.div
          className="absolute top-1 right-1 p-1 rounded-full"
          style={{
            fontSize: characterSize * 0.15,
            background: 'rgba(0,0,0,0.5)',
          }}
          key={state.mood}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span role="img" aria-label={`${state.mood} expression`}>
            {MOOD_EXPRESSIONS[state.mood] || MOOD_EXPRESSIONS.neutral}
          </span>
        </motion.div>
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.button
          key={state.message}
          className="relative text-left p-4 rounded-2xl cursor-pointer transition-colors"
          style={{
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
            maxWidth: bubbleMaxWidth,
            minHeight: compact ? 50 : 70,
          }}
          onClick={handleBubbleClick}
          onKeyDown={handleKeyDown}
          variants={prefersReducedMotion ? undefined : speechBubbleVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={speechBubbleTransition}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          aria-live="polite"
          aria-label={`BigPulp says: ${state.message}`}
        >
          {/* Bubble tail */}
          <div
            className="absolute top-4 -left-2 w-3 h-3 transform rotate-45"
            style={{
              background: 'var(--color-glass-bg)',
              borderLeft: '1px solid var(--color-border)',
              borderBottom: '1px solid var(--color-border)',
            }}
          />

          {/* Message text */}
          <p
            className="text-sm relative z-10"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {displayedText}
            {cursorVisible && (
              <span
                className="inline-block ml-0.5"
                style={{ color: 'var(--color-brand-primary)' }}
              >
                ▌
              </span>
            )}
          </p>

          {/* Hidden full text for screen readers */}
          <span className="sr-only">{state.message}</span>

          {/* Queue indicator */}
          {state.messageQueue.length > 0 && !isTyping && (
            <motion.div
              className="absolute bottom-1 right-2 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Tap for more ({state.messageQueue.length})
            </motion.div>
          )}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}

export default BigPulpCharacter;

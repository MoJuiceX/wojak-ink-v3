/**
 * Animated emoji that flies from toggle button to target with gravity arc
 */

import { motion } from 'framer-motion';

interface FlyingEmojiProps {
  type: 'donut' | 'poop';
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
}

export function FlyingEmoji({ type, startPosition, endPosition, onComplete }: FlyingEmojiProps) {
  const emoji = type === 'donut' ? '🍩' : '💩';

  const midX = (startPosition.x + endPosition.x) / 2;
  const distance = Math.sqrt(
    Math.pow(endPosition.x - startPosition.x, 2) +
    Math.pow(endPosition.y - startPosition.y, 2)
  );
  const arcHeight = Math.min(180, Math.max(80, distance * 0.35));
  const baseY = Math.min(startPosition.y, endPosition.y);
  const peakY = baseY - arcHeight;

  return (
    <motion.div
      className="flying-emoji"
      style={{
        position: 'fixed',
        fontSize: '42px',
        pointerEvents: 'none',
        zIndex: 9998,
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))',
      }}
      initial={{
        x: startPosition.x - 21,
        y: startPosition.y - 21,
        scale: 0.3,
        opacity: 1,
        rotate: 0,
      }}
      animate={{
        x: [startPosition.x - 21, midX - 21, endPosition.x - 21],
        y: [startPosition.y - 21, peakY - 21, endPosition.y - 21],
        scale: [0.3, 1.3, 1],
        opacity: 1,
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
        times: [0, 0.45, 1],
      }}
      onAnimationComplete={onComplete}
    >
      {emoji}
    </motion.div>
  );
}

/**
 * Splatter effect - emoji splits into 4 pieces on impact
 * Supports multiple simultaneous splatters via unique id
 */

import { motion } from 'framer-motion';

interface SplatterEffectProps {
  id: string;
  type: 'donut' | 'poop';
  position: { x: number; y: number };
  onComplete: (id: string) => void;
}

const pieceDirections = [
  { x: -60, y: -50, rotate: -180 },
  { x: 60, y: -50, rotate: 180 },
  { x: -50, y: 60, rotate: -90 },
  { x: 50, y: 60, rotate: 90 },
];

export function SplatterEffect({ id, type, position, onComplete }: SplatterEffectProps) {
  const emoji = type === 'donut' ? '🍩' : '💩';

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {/* Shockwave ring - faster for snappier feel */}
      <motion.div
        style={{
          position: 'absolute',
          left: -40,
          top: -40,
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: `3px solid ${type === 'donut' ? 'rgba(255, 180, 100, 0.8)' : 'rgba(139, 90, 43, 0.8)'}`,
        }}
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
      />

      {/* Inner flash - faster */}
      <motion.div
        style={{
          position: 'absolute',
          left: -30,
          top: -30,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: type === 'donut'
            ? 'radial-gradient(circle, rgba(255,200,150,0.9) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,90,43,0.9) 0%, transparent 70%)',
        }}
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />

      {/* 4 emoji pieces - faster animation */}
      {pieceDirections.map((dir, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            left: -16,
            top: -16,
            fontSize: '32px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
          animate={{
            x: dir.x,
            y: dir.y + 20,
            scale: [1, 0.8, 0.4],
            opacity: [1, 0.8, 0],
            rotate: dir.rotate,
          }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.6, 1] }}
          onAnimationComplete={index === 0 ? () => onComplete(id) : undefined}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Particle debris - faster */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            left: -4,
            top: -4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: type === 'donut' ? '#ffb366' : '#8B5A2B',
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 120,
            y: (Math.random() - 0.5) * 100 + 30,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: Math.random() * 0.08 }}
        />
      ))}
    </div>
  );
}

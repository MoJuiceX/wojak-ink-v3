/**
 * Ambient Background
 *
 * Animated gradient background with floating orbs for a cyberpunk atmosphere.
 * Includes optional noise texture overlay.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './AmbientBackground.css';

interface AmbientBackgroundProps {
  /** Show noise texture overlay (default: true) */
  showNoise?: boolean;
  /** Number of floating orbs (default: 3) */
  orbCount?: number;
  /** Custom class name */
  className?: string;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  showNoise = true,
  orbCount = 3,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const orbVariants = {
    animate: (i: number) => ({
      x: [0, 30, -20, 0],
      y: [0, -20, 10, 0],
      scale: [1, 1.05, 0.95, 1],
      transition: {
        duration: 20 + i * 5,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    }),
  };

  const orbs = [
    { color: 'rgba(249, 115, 22, 0.08)', size: 600, x: '20%', y: '80%' },
    { color: 'rgba(124, 58, 237, 0.06)', size: 400, x: '80%', y: '20%' },
    { color: 'rgba(249, 115, 22, 0.04)', size: 500, x: '60%', y: '60%' },
  ].slice(0, orbCount);

  return (
    <>
      {/* Base gradient background */}
      <div className={`ambient-background ${className}`}>
        {/* Floating orbs */}
        {orbs.map((orb, index) => (
          <motion.div
            key={index}
            className="ambient-orb"
            style={{
              background: `radial-gradient(ellipse ${orb.size}px ${orb.size}px at center, ${orb.color} 0%, transparent 70%)`,
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
            }}
            custom={index}
            animate={prefersReducedMotion ? {} : 'animate'}
            variants={orbVariants}
          />
        ))}
      </div>

      {/* Noise texture overlay */}
      {showNoise && <div className="noise-overlay" aria-hidden="true" />}
    </>
  );
};

/**
 * Minimal version with just the gradient (no orbs)
 */
export const GradientBackground: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return <div className={`gradient-background ${className}`} />;
};

/**
 * Just the noise overlay
 */
export const NoiseOverlay: React.FC = () => {
  return <div className="noise-overlay" aria-hidden="true" />;
};

export default AmbientBackground;

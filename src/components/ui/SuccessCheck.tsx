/**
 * Success Check Animation
 *
 * Animated checkmark for success feedback with SVG path animation.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SuccessCheckProps {
  size?: number;
  color?: string;
  className?: string;
}

export const SuccessCheck: React.FC<SuccessCheckProps> = ({
  size = 48,
  color = '#22c55e',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const circleVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0 : 0.3 },
    },
  };

  const checkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        delay: prefersReducedMotion ? 0 : 0.2,
      },
    },
  };

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 10px ${color}50)`,
      }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        initial="hidden"
        animate="visible"
      >
        {/* Circle */}
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="2"
          fill="none"
          variants={circleVariants}
        />
        {/* Checkmark */}
        <motion.path
          d="M6 12l4 4 8-8"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={checkVariants}
        />
      </motion.svg>
    </div>
  );
};

/**
 * Success Pulse Animation
 *
 * Pulsing circle with checkmark for more prominent feedback.
 */
export const SuccessPulse: React.FC<SuccessCheckProps> = ({
  size = 64,
  color = '#22c55e',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
      }}
    >
      {/* Pulsing background */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `${color}20`,
        }}
        animate={
          !prefersReducedMotion
            ? {
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Icon container */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: color,
          borderRadius: '50%',
          color: 'white',
          fontSize: size * 0.5,
        }}
        initial={prefersReducedMotion ? {} : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={
          prefersReducedMotion
            ? {}
            : { type: 'spring', stiffness: 300, damping: 20 }
        }
      >
        ✓
      </motion.div>
    </div>
  );
};

export default SuccessCheck;

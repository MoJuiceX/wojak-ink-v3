/**
 * Community Preview
 *
 * Community stats and treasury visualization for the
 * Community feature section.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const STATS = [
  { value: '4.2K', label: 'NFTs' },
  { value: '500+', label: 'Holders' },
  { value: '100K', label: 'XCH Volume' },
];

export const CommunityPreview: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="community-preview">
      {/* Animated stats cards */}
      <div className="community-stats">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.4 }}
            viewport={{ once: true }}
            whileHover={!prefersReducedMotion ? { scale: 1.05, y: -5 } : {}}
          >
            <motion.div
              className="stat-value"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: index * 0.15 + 0.3, duration: 0.3 }}
              viewport={{ once: true }}
            >
              {stat.value}
            </motion.div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Decorative floating orbs (crypto bubbles style) */}
      <motion.div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 20,
        }}
      >
        {['🌳', '🍊', '⚡'].map((emoji, index) => (
          <motion.span
            key={emoji}
            style={{ fontSize: 32, opacity: 0.6 }}
            animate={
              !prefersReducedMotion
                ? {
                    y: [0, -10, 0],
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={{
              delay: index * 0.3,
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default CommunityPreview;

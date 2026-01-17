/**
 * Games Preview
 *
 * Bouncing game icons for the Play feature section.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const GAMES = [
  { icon: '🧱', name: 'Brick by Brick' },
  { icon: '🧠', name: 'Memory Match' },
  { icon: '🏃', name: 'Wojak Runner' },
  { icon: '🏓', name: 'Orange Pong' },
  { icon: '🔪', name: 'Knife Game' },
  { icon: '🧩', name: 'Block Puzzle' },
];

export const GamesPreview: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="games-preview">
      {GAMES.map((game, index) => (
        <motion.div
          key={game.name}
          className="game-icon-card"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
          viewport={{ once: true }}
          animate={
            !prefersReducedMotion
              ? {
                  y: [0, -8, 0],
                }
              : {}
          }
          whileHover={!prefersReducedMotion ? { scale: 1.1, y: -5 } : {}}
          style={{
            animationDelay: `${index * 0.2}s`,
          }}
          // Staggered bounce animation
          {...(!prefersReducedMotion && {
            animate: {
              y: [0, -8, 0],
            },
            transition: {
              y: {
                delay: index * 0.15,
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            },
          })}
        >
          {game.icon}
        </motion.div>
      ))}
    </div>
  );
};

export default GamesPreview;

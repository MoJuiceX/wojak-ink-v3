/**
 * BigPulp Preview
 *
 * Animated BigPulp character with speech bubble for the
 * BigPulp Intelligence feature section.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const QUOTES = [
  '"Let me analyze that for you!"',
  '"This NFT has great potential!"',
  '"Rare combo detected!"',
];

export const BigPulpPreview: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="bigpulp-preview">
      <motion.div
        className="bigpulp-character"
        animate={
          !prefersReducedMotion
            ? {
                y: [0, -15, 0],
                rotate: [-2, 2, -2],
              }
            : {}
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <img
          src="/assets/BigPulp/art/BigP_crown.png"
          alt="BigPulp"
          loading="lazy"
        />

        {/* Speech bubble */}
        <motion.div
          className="speech-bubble"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          {QUOTES[0]}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BigPulpPreview;

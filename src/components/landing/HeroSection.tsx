/**
 * Hero Section
 *
 * Above-the-fold landing section with BigPulp character,
 * floating NFTs, and scroll indicator with parallax layers.
 */

import React from 'react';
import { motion, useTransform, useReducedMotion, MotionValue } from 'framer-motion';
import { FloatingNFTs } from './FloatingNFTs';

interface HeroSectionProps {
  scrollProgress: MotionValue<number>;
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  scrollProgress,
  onExplore,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const parallaxMultiplier = prefersReducedMotion ? 0 : 1;

  // Parallax layers at different speeds
  const bgY = useTransform(scrollProgress, [0, 0.3], [0, -150 * parallaxMultiplier]);
  const midY = useTransform(scrollProgress, [0, 0.3], [0, -80 * parallaxMultiplier]);
  const frontY = useTransform(scrollProgress, [0, 0.3], [0, -30 * parallaxMultiplier]);
  const textOpacity = useTransform(scrollProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollProgress, [0, 0.2], [1, 0.9]);

  return (
    <>
      {/* Background layer - gradient glow */}
      <motion.div
        className="hero-bg-layer"
        style={{ y: bgY }}
      />

      {/* Mid layer - floating NFTs */}
      <motion.div
        className="hero-mid-layer"
        style={{ y: midY }}
      >
        <FloatingNFTs />
      </motion.div>

      {/* Front layer - BigPulp */}
      <motion.div
        className="hero-front-layer"
        style={{ y: frontY, scale }}
      >
        <motion.div
          className="bigpulp-hero"
          animate={
            !prefersReducedMotion
              ? {
                  y: [0, -20, 0],
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
            loading="eager"
          />
        </motion.div>
      </motion.div>

      {/* Text content */}
      <motion.div className="hero-content" style={{ opacity: textOpacity }}>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Welcome to the Grove
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          4,200 Unique Wojaks on Chia Blockchain
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-indicator"
        animate={!prefersReducedMotion ? { y: [0, 10, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ opacity: textOpacity }}
        onClick={onExplore}
      >
        <span>Scroll to Explore</span>
        <div className="scroll-arrow">↓</div>
      </motion.div>
    </>
  );
};

export default HeroSection;

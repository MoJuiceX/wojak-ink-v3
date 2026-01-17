/**
 * Collection Preview
 *
 * Parallax NFT cards for the Gallery feature section.
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const PREVIEW_CARDS = [
  { src: '/assets/gallery-previews/alien-soyjak.png', alt: 'Alien Soyjak' },
  { src: '/assets/gallery-previews/papa-tang.png', alt: 'Papa Tang', featured: true },
  { src: '/assets/gallery-previews/bepe-waifu.png', alt: 'Bepe Waifu' },
];

export const CollectionPreview: React.FC = () => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const parallaxMultiplier = prefersReducedMotion ? 0 : 1;

  // Staggered parallax for each card
  const y1 = useTransform(
    scrollYProgress,
    [0, 1],
    [100 * parallaxMultiplier, -100 * parallaxMultiplier]
  );
  const y2 = useTransform(
    scrollYProgress,
    [0, 1],
    [150 * parallaxMultiplier, -50 * parallaxMultiplier]
  );
  const y3 = useTransform(
    scrollYProgress,
    [0, 1],
    [80 * parallaxMultiplier, -120 * parallaxMultiplier]
  );

  const yTransforms = [y1, y2, y3];

  return (
    <div ref={ref} className="collection-preview">
      {PREVIEW_CARDS.map((card, index) => (
        <motion.div
          key={card.alt}
          className={`preview-card ${card.featured ? 'featured' : ''}`}
          style={{ y: yTransforms[index] }}
          whileHover={!prefersReducedMotion ? { scale: 1.05, rotateY: 0 } : {}}
        >
          <img src={card.src} alt={card.alt} loading="lazy" />
        </motion.div>
      ))}
    </div>
  );
};

export default CollectionPreview;

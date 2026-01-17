/**
 * Floating NFTs
 *
 * Decorative floating NFT previews for the hero section
 * with staggered animations.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const NFT_PREVIEWS = [
  { id: 1, src: '/assets/gallery-previews/alien-wojak.png', x: '8%', y: '15%', delay: 0 },
  { id: 2, src: '/assets/gallery-previews/papa-tang.png', x: '85%', y: '12%', delay: 0.5 },
  { id: 3, src: '/assets/gallery-previews/soyjak.png', x: '78%', y: '65%', delay: 1 },
  { id: 4, src: '/assets/gallery-previews/waifu.png', x: '12%', y: '60%', delay: 1.5 },
  { id: 5, src: '/assets/gallery-previews/baddie.png', x: '5%', y: '38%', delay: 0.8 },
  { id: 6, src: '/assets/gallery-previews/bepe-wojak.png', x: '90%', y: '40%', delay: 1.2 },
];

export const FloatingNFTs: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {NFT_PREVIEWS.map((nft) => (
        <motion.div
          key={nft.id}
          className="floating-nft"
          style={{ left: nft.x, top: nft.y }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={
            !prefersReducedMotion
              ? {
                  opacity: [0.5, 0.7, 0.5],
                  y: [0, -20, 0],
                  rotate: [-3, 3, -3],
                  scale: 1,
                }
              : { opacity: 0.6, scale: 1 }
          }
          transition={{
            delay: nft.delay,
            duration: 5 + nft.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <img src={nft.src} alt="" loading="eager" />
        </motion.div>
      ))}
    </>
  );
};

export default FloatingNFTs;

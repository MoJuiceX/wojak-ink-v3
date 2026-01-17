/**
 * NFT Card Skeleton
 *
 * Loading placeholder for NFT cards in the gallery grid.
 */

import React from 'react';
import { motion } from 'framer-motion';
import './skeletons.css';

interface NFTCardSkeletonProps {
  /** Animation delay for staggered loading */
  delay?: number;
}

export const NFTCardSkeleton: React.FC<NFTCardSkeletonProps> = ({ delay = 0 }) => (
  <motion.div
    className="nft-card-skeleton"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
  >
    <div className="skeleton skeleton-shimmer skeleton-image" />
    <div className="skeleton-content">
      <div className="skeleton skeleton-shimmer skeleton-title" />
      <div className="skeleton skeleton-shimmer skeleton-subtitle" />
    </div>
  </motion.div>
);

export default NFTCardSkeleton;

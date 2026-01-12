/**
 * Videos Grid Component
 *
 * Responsive grid of video cards with category filter.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Video } from 'lucide-react';
import type { VideoItem, VideoCategory } from '@/types/media';
import { VideoCard } from './VideoCard';
import { getVideoCategories } from '@/utils/mockMediaData';
import { gameGridVariants, filterTabVariants } from '@/config/mediaAnimations';

interface VideosGridProps {
  videos: VideoItem[];
  filter: VideoCategory | 'all';
  onFilterChange: (filter: VideoCategory | 'all') => void;
  onVideoSelect: (video: VideoItem) => void;
  isLoading?: boolean;
}

function VideoCardSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="aspect-video"
        style={{ background: 'var(--color-border)' }}
      />
      <div className="p-3 space-y-2">
        <div
          className="h-4 rounded"
          style={{ background: 'var(--color-border)', width: '80%' }}
        />
        <div
          className="h-3 rounded"
          style={{ background: 'var(--color-border)', width: '40%' }}
        />
      </div>
    </div>
  );
}

export function VideosGrid({
  videos,
  filter,
  onFilterChange,
  onVideoSelect,
  isLoading = false,
}: VideosGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const categories = getVideoCategories();

  const filteredVideos =
    filter === 'all'
      ? videos
      : videos.filter((video) => video.category === filter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Video
            size={24}
            style={{ color: 'var(--color-brand-primary)' }}
          />
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Music Videos
          </h2>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {categories.map((category) => (
            <motion.button
              key={category.value}
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                background:
                  filter === category.value
                    ? 'var(--color-brand-primary)'
                    : 'var(--color-glass-bg)',
                color:
                  filter === category.value
                    ? 'white'
                    : 'var(--color-text-secondary)',
                border: `1px solid ${filter === category.value ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
              }}
              variants={prefersReducedMotion ? undefined : filterTabVariants}
              onClick={() => onFilterChange(category.value)}
            >
              {category.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Videos grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={prefersReducedMotion ? undefined : gameGridVariants}
          initial="initial"
          animate="animate"
          key={filter}
        >
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={() => onVideoSelect(video)}
            />
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && filteredVideos.length === 0 && (
        <div
          className="p-8 rounded-xl text-center"
          style={{
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Video
            size={48}
            className="mx-auto mb-4 opacity-30"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <p style={{ color: 'var(--color-text-muted)' }}>
            No videos in this category
          </p>
        </div>
      )}
    </div>
  );
}

export default VideosGrid;

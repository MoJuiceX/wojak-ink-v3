/**
 * Video Card Component
 *
 * Video thumbnail card with play overlay.
 */

import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Subtitles, AudioLines } from 'lucide-react';
import type { VideoItem } from '@/types/media';
import { formatViewCount } from '@/utils/mockMediaData';
import {
  videoCardVariants,
  videoThumbnailVariants,
  playOverlayVariants,
} from '@/config/mediaAnimations';

interface VideoCardProps {
  video: VideoItem;
  onClick: () => void;
}

export const VideoCard = memo(function VideoCard({ video, onClick }: VideoCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const categoryLabels: Record<string, string> = {
    'music-video': 'Music Video',
    community: 'Community',
    tutorial: 'Tutorial',
    meme: 'Meme',
    event: 'Event',
  };

  return (
    <motion.button
      className="group flex flex-col text-left rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
      variants={prefersReducedMotion ? undefined : videoCardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
    >
      {/* Thumbnail container */}
      <div className="relative aspect-video overflow-hidden">
        <motion.img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
          variants={prefersReducedMotion ? undefined : videoThumbnailVariants}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/placeholder-video.jpg';
          }}
        />

        {/* Play overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.3)' }}
          variants={prefersReducedMotion ? undefined : playOverlayVariants}
          initial="initial"
          animate="initial"
          whileHover="hover"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
            style={{
              background: 'var(--color-brand-primary)',
            }}
          >
            <Play size={24} fill="white" color="white" />
          </div>
        </motion.div>

        {/* Duration badge */}
        <div
          className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-xs font-medium"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
          }}
        >
          {video.durationFormatted}
        </div>

        {/* Accessibility badges */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {video.hasCaptions && (
            <div
              className="p-1 rounded"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
              }}
              title="Captions available"
            >
              <Subtitles size={12} />
            </div>
          )}
          {video.hasAudioDescription && (
            <div
              className="p-1 rounded"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
              }}
              title="Audio description available"
            >
              <AudioLines size={12} />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3
          className="text-sm font-medium line-clamp-2 mb-1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {video.title}
        </h3>
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span>{categoryLabels[video.category] || video.category}</span>
          {video.viewCount && (
            <>
              <span>•</span>
              <span>{formatViewCount(video.viewCount)} views</span>
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
});

export default VideoCard;

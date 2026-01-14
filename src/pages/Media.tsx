/**
 * Media Hub Page
 *
 * Games, videos, and music entertainment center.
 */

import { useState, useCallback } from 'react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useLayout } from '@/hooks/useLayout';
import { useMedia } from '@/contexts/MediaContext';
import {
  GamesGrid,
  GameModal,
  VideosGrid,
  MusicPlayer,
} from '@/components/media';
import { useMediaContent } from '@/hooks/data/useMediaData';
import type { MiniGame, VideoItem, VideoCategory } from '@/types/media';

export default function Media() {
  const { contentPadding, isDesktop } = useLayout();
  const { setVideoQueue } = useMedia();

  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [videoFilter, setVideoFilter] = useState<VideoCategory | 'all'>('all');

  // Fetch media content using TanStack Query
  const { videos, tracks, games, isLoading } = useMediaContent(videoFilter);

  const handleGameSelect = useCallback((game: MiniGame) => {
    // Always show games in the lightbox modal
    setSelectedGame(game);
    setGameModalOpen(true);
  }, []);

  const handleGameModalClose = useCallback(() => {
    setGameModalOpen(false);
    setSelectedGame(null);
  }, []);

  const handleVideoSelect = useCallback(
    (video: VideoItem) => {
      // Set the full video queue so auto-play next works
      const videoIndex = videos.findIndex(v => v.id === video.id);
      setVideoQueue(videos, videoIndex >= 0 ? videoIndex : 0);
    },
    [videos, setVideoQueue]
  );

  return (
    <PageTransition>
      <div className="min-h-full" style={{ padding: contentPadding }}>
        <div
          className="space-y-8 pb-24 pt-4"
          style={{ maxWidth: isDesktop ? '1200px' : undefined, margin: '0 auto' }}
        >
          {/* Games Section */}
          <GamesGrid games={games} onGameSelect={handleGameSelect} isLoading={isLoading} />

          {/* Divider */}
          <div
            className="h-px"
            style={{ background: 'var(--color-border)' }}
          />

          {/* Videos Section */}
          <VideosGrid
            videos={videos}
            filter={videoFilter}
            onFilterChange={setVideoFilter}
            onVideoSelect={handleVideoSelect}
            isLoading={isLoading}
          />

          {/* Divider */}
          <div
            className="h-px"
            style={{ background: 'var(--color-border)' }}
          />

          {/* Music Section */}
          <MusicPlayer tracks={tracks} defaultExpanded={isDesktop} isLoading={isLoading} />
        </div>
      </div>

      {/* Game Modal */}
      <GameModal
        game={selectedGame}
        isOpen={gameModalOpen}
        onClose={handleGameModalClose}
      />
    </PageTransition>
  );
}

/**
 * Media Hub Page
 *
 * Games, videos, and music entertainment center.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/layout/PageTransition';
import { useLayout } from '@/hooks/useLayout';
import { MediaProvider, useMedia } from '@/contexts/MediaContext';
import {
  GamesGrid,
  GameModal,
  VideosGrid,
  FloatingVideoPlayer,
  MusicPlayer,
} from '@/components/media';
import { useMediaContent } from '@/hooks/data/useMediaData';
import type { MiniGame, VideoItem, VideoCategory } from '@/types/media';

function MediaContent() {
  const navigate = useNavigate();
  const { contentPadding, isDesktop } = useLayout();
  const { playVideo, videoPlayer } = useMedia();

  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [videoFilter, setVideoFilter] = useState<VideoCategory | 'all'>('all');

  // Fetch media content using TanStack Query
  const { videos, tracks, games, isLoading } = useMediaContent(videoFilter);

  const handleGameSelect = useCallback((game: MiniGame) => {
    // Navigate to game route if available, otherwise show modal
    if (game.status === 'available' && game.route) {
      navigate(game.route);
    } else {
      setSelectedGame(game);
      setGameModalOpen(true);
    }
  }, [navigate]);

  const handleGameModalClose = useCallback(() => {
    setGameModalOpen(false);
    setSelectedGame(null);
  }, []);

  const handleVideoSelect = useCallback(
    (video: VideoItem) => {
      playVideo(video);
    },
    [playVideo]
  );

  return (
    <PageTransition>
      <div className="min-h-full" style={{ padding: contentPadding }}>
        <div
          className="space-y-8 pb-24"
          style={{ maxWidth: isDesktop ? '1200px' : undefined, margin: '0 auto' }}
        >
          {/* Header */}
          <div className="pt-4">
            <h1
              className="text-3xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Media Hub
            </h1>
            <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Games, music, and videos for the Tang Gang community
            </p>
          </div>

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

      {/* Floating Video Player */}
      {videoPlayer.currentVideo && <FloatingVideoPlayer />}
    </PageTransition>
  );
}

export default function Media() {
  return (
    <MediaProvider>
      <MediaContent />
    </MediaProvider>
  );
}

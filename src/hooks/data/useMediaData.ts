/**
 * Media Data Hooks
 *
 * TanStack Query hooks for media content data.
 */

import { useQuery } from '@tanstack/react-query';
import { mediaService } from '@/services/mock/mockMediaService';
import { CACHE_CONFIG } from '@/config/query/cacheConfig';
import type { VideoCategory } from '@/types/media';

// Query keys
export const mediaKeys = {
  all: ['media'] as const,
  videos: () => [...mediaKeys.all, 'videos'] as const,
  videoList: (category: VideoCategory | 'all') =>
    [...mediaKeys.videos(), 'list', category] as const,
  video: (id: string) => [...mediaKeys.videos(), 'detail', id] as const,
  tracks: () => [...mediaKeys.all, 'tracks'] as const,
  trackList: () => [...mediaKeys.tracks(), 'list'] as const,
  track: (id: string) => [...mediaKeys.tracks(), 'detail', id] as const,
  games: () => [...mediaKeys.all, 'games'] as const,
  gameList: () => [...mediaKeys.games(), 'list'] as const,
} as const;

/**
 * Fetch all videos or by category
 */
export function useVideos(category: VideoCategory | 'all' = 'all') {
  return useQuery({
    queryKey: mediaKeys.videoList(category),
    queryFn: () => mediaService.fetchVideos(category),
    ...CACHE_CONFIG.static, // Media content is static
  });
}

/**
 * Fetch a single video by ID
 */
export function useVideo(id: string | null) {
  return useQuery({
    queryKey: mediaKeys.video(id!),
    queryFn: () => mediaService.fetchVideoById(id!),
    ...CACHE_CONFIG.static,
    enabled: !!id,
  });
}

/**
 * Fetch all music tracks
 */
export function useTracks() {
  return useQuery({
    queryKey: mediaKeys.trackList(),
    queryFn: () => mediaService.fetchTracks(),
    ...CACHE_CONFIG.static,
  });
}

/**
 * Fetch a single track by ID
 */
export function useTrack(id: string | null) {
  return useQuery({
    queryKey: mediaKeys.track(id!),
    queryFn: () => mediaService.fetchTrackById(id!),
    ...CACHE_CONFIG.static,
    enabled: !!id,
  });
}

/**
 * Fetch all mini games
 */
export function useGames() {
  return useQuery({
    queryKey: mediaKeys.gameList(),
    queryFn: () => mediaService.fetchGames(),
    ...CACHE_CONFIG.static,
  });
}

/**
 * Combined hook for all media content
 */
export function useMediaContent(videoCategory: VideoCategory | 'all' = 'all') {
  const videosQuery = useVideos(videoCategory);
  const tracksQuery = useTracks();
  const gamesQuery = useGames();

  return {
    videos: videosQuery.data ?? [],
    tracks: tracksQuery.data ?? [],
    games: gamesQuery.data ?? [],
    isLoading: videosQuery.isLoading || tracksQuery.isLoading || gamesQuery.isLoading,
    error: videosQuery.error || tracksQuery.error || gamesQuery.error,
  };
}

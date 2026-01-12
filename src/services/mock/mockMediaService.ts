/**
 * Mock Media Service
 *
 * Media content data service.
 */

import type { VideoItem, MusicTrack, VideoCategory } from '@/types/media';
import type { MiniGame } from '@/types/media';
import {
  MOCK_TRACKS,
  getVideosByCategory,
  getVideoById,
  getTrackById,
} from '@/utils/mockMediaData';
import { MINI_GAMES } from '@/config/games';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface IMediaService {
  fetchVideos(category?: VideoCategory | 'all'): Promise<VideoItem[]>;
  fetchVideoById(id: string): Promise<VideoItem | null>;
  fetchTracks(): Promise<MusicTrack[]>;
  fetchTrackById(id: string): Promise<MusicTrack | null>;
  fetchGames(): Promise<MiniGame[]>;
}

export class MockMediaService implements IMediaService {
  async fetchVideos(category: VideoCategory | 'all' = 'all'): Promise<VideoItem[]> {
    await delay(300);
    return getVideosByCategory(category);
  }

  async fetchVideoById(id: string): Promise<VideoItem | null> {
    await delay(100);
    return getVideoById(id) ?? null;
  }

  async fetchTracks(): Promise<MusicTrack[]> {
    await delay(200);
    return [...MOCK_TRACKS];
  }

  async fetchTrackById(id: string): Promise<MusicTrack | null> {
    await delay(100);
    return getTrackById(id) ?? null;
  }

  async fetchGames(): Promise<MiniGame[]> {
    await delay(150);
    return [...MINI_GAMES];
  }
}

// Singleton instance
export const mediaService = new MockMediaService();

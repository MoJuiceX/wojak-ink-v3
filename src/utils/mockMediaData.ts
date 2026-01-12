/**
 * Mock Media Data
 *
 * Mock data for videos and music during development.
 */

import type { VideoItem, MusicTrack, VideoCategory } from '@/types/media';

// ============ Mock Videos ============

export const MOCK_VIDEOS: VideoItem[] = [
  {
    id: 'video-1',
    title: 'Tang Gang Anthem - Official Music Video',
    description: 'The official anthem of the Tang Gang community',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: '/assets/media/thumbs/tang-anthem.jpg',
    duration: 225,
    durationFormatted: '3:45',
    uploadDate: new Date('2024-01-15'),
    viewCount: 12500,
    category: 'music-video',
    tags: ['official', 'anthem', 'tang-gang'],
    hasCaptions: true,
    hasAudioDescription: false,
    captionLanguages: ['en'],
  },
  {
    id: 'video-2',
    title: 'How to Buy Wojak Farmers NFTs',
    description: 'Step-by-step guide to purchasing your first Wojak',
    youtubeId: 'abc123def',
    thumbnailUrl: '/assets/media/thumbs/tutorial-buy.jpg',
    duration: 480,
    durationFormatted: '8:00',
    uploadDate: new Date('2024-02-20'),
    viewCount: 5200,
    category: 'tutorial',
    tags: ['tutorial', 'guide', 'nft'],
    hasCaptions: true,
    hasAudioDescription: true,
    captionLanguages: ['en', 'es'],
  },
  {
    id: 'video-3',
    title: 'Wojak Farmers Community Highlights 2024',
    description: 'Best moments from the community this year',
    youtubeId: 'xyz789abc',
    thumbnailUrl: '/assets/media/thumbs/highlights-2024.jpg',
    duration: 612,
    durationFormatted: '10:12',
    uploadDate: new Date('2024-03-10'),
    viewCount: 8900,
    category: 'community',
    tags: ['community', 'highlights', 'recap'],
    hasCaptions: true,
    hasAudioDescription: false,
    captionLanguages: ['en'],
  },
  {
    id: 'video-4',
    title: 'When You Buy the Dip Too Early',
    description: 'A classic crypto meme moment',
    youtubeId: 'meme123',
    thumbnailUrl: '/assets/media/thumbs/meme-dip.jpg',
    duration: 45,
    durationFormatted: '0:45',
    uploadDate: new Date('2024-04-01'),
    viewCount: 25000,
    category: 'meme',
    tags: ['meme', 'funny', 'crypto'],
    hasCaptions: false,
    hasAudioDescription: false,
  },
  {
    id: 'video-5',
    title: 'Diamond Hands - Fan Music Video',
    description: 'Community-made music video celebrating holders',
    youtubeId: 'diamond456',
    thumbnailUrl: '/assets/media/thumbs/diamond-hands.jpg',
    duration: 198,
    durationFormatted: '3:18',
    uploadDate: new Date('2024-05-05'),
    viewCount: 6700,
    category: 'music-video',
    tags: ['music', 'community', 'diamond-hands'],
    hasCaptions: true,
    hasAudioDescription: false,
    captionLanguages: ['en'],
  },
  {
    id: 'video-6',
    title: 'Wojak Generator Tutorial',
    description: 'Learn how to create your custom Wojak avatar',
    youtubeId: 'gen789',
    thumbnailUrl: '/assets/media/thumbs/generator-tutorial.jpg',
    duration: 360,
    durationFormatted: '6:00',
    uploadDate: new Date('2024-06-15'),
    viewCount: 4200,
    category: 'tutorial',
    tags: ['tutorial', 'generator', 'guide'],
    hasCaptions: true,
    hasAudioDescription: true,
    captionLanguages: ['en'],
  },
  {
    id: 'video-7',
    title: 'Tang Gang AMA Recap - June 2024',
    description: 'Highlights from the community AMA session',
    youtubeId: 'ama2024',
    thumbnailUrl: '/assets/media/thumbs/ama-june.jpg',
    duration: 2700,
    durationFormatted: '45:00',
    uploadDate: new Date('2024-06-20'),
    viewCount: 3100,
    category: 'event',
    tags: ['ama', 'event', 'community'],
    hasCaptions: true,
    hasAudioDescription: false,
    captionLanguages: ['en'],
  },
  {
    id: 'video-8',
    title: 'Wojak Farming Simulator - Parody',
    description: 'What if Wojak was a farming game?',
    youtubeId: 'parody123',
    thumbnailUrl: '/assets/media/thumbs/farming-parody.jpg',
    duration: 120,
    durationFormatted: '2:00',
    uploadDate: new Date('2024-07-01'),
    viewCount: 18500,
    category: 'meme',
    tags: ['meme', 'parody', 'funny'],
    hasCaptions: false,
    hasAudioDescription: false,
  },
];

// ============ Mock Music Tracks ============

export const MOCK_TRACKS: MusicTrack[] = [
  {
    id: 'track-1',
    title: 'Tang Gang Anthem',
    artist: 'Tang Gang Studios',
    album: 'Wojak Vibes Vol. 1',
    audioUrl: '/assets/media/audio/tang-anthem.mp3',
    duration: 225,
    durationFormatted: '3:45',
    coverArtUrl: '/assets/media/covers/tang-anthem.jpg',
    coverArtColors: {
      primary: '#ff6b00',
      secondary: '#ff8c00',
    },
    genre: 'Electronic',
    mood: ['energetic', 'hype'],
    bpm: 128,
  },
  {
    id: 'track-2',
    title: 'Wojak Lofi Beats',
    artist: 'Tang Gang Studios',
    album: 'Wojak Vibes Vol. 1',
    audioUrl: '/assets/media/audio/lofi-beats.mp3',
    duration: 260,
    durationFormatted: '4:20',
    coverArtUrl: '/assets/media/covers/lofi-beats.jpg',
    coverArtColors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
    },
    genre: 'Lo-Fi',
    mood: ['chill', 'relaxing'],
    bpm: 85,
  },
  {
    id: 'track-3',
    title: 'Orange Sunrise',
    artist: 'Community Artist',
    audioUrl: '/assets/media/audio/orange-sunrise.mp3',
    duration: 178,
    durationFormatted: '2:58',
    coverArtUrl: '/assets/media/covers/orange-sunrise.jpg',
    coverArtColors: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
    },
    genre: 'Ambient',
    mood: ['peaceful', 'morning'],
    bpm: 90,
  },
  {
    id: 'track-4',
    title: 'Diamond Hands',
    artist: 'Tang Gang Studios',
    album: 'Wojak Vibes Vol. 1',
    audioUrl: '/assets/media/audio/diamond-hands.mp3',
    duration: 213,
    durationFormatted: '3:33',
    coverArtUrl: '/assets/media/covers/diamond-hands.jpg',
    coverArtColors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
    },
    genre: 'Electronic',
    mood: ['determined', 'epic'],
    bpm: 140,
  },
  {
    id: 'track-5',
    title: 'To The Moon',
    artist: 'Community Artist',
    audioUrl: '/assets/media/audio/to-the-moon.mp3',
    duration: 240,
    durationFormatted: '4:00',
    coverArtUrl: '/assets/media/covers/to-the-moon.jpg',
    coverArtColors: {
      primary: '#22c55e',
      secondary: '#4ade80',
    },
    genre: 'Synthwave',
    mood: ['hopeful', 'uplifting'],
    bpm: 120,
  },
  {
    id: 'track-6',
    title: 'Rug Pull Blues',
    artist: 'Tang Gang Studios',
    audioUrl: '/assets/media/audio/rug-pull-blues.mp3',
    duration: 195,
    durationFormatted: '3:15',
    coverArtUrl: '/assets/media/covers/rug-pull-blues.jpg',
    coverArtColors: {
      primary: '#ef4444',
      secondary: '#f87171',
    },
    genre: 'Blues',
    mood: ['melancholy', 'reflective'],
    bpm: 75,
  },
];

// ============ Helper Functions ============

/**
 * Get videos by category
 */
export function getVideosByCategory(category: VideoCategory | 'all'): VideoItem[] {
  if (category === 'all') return MOCK_VIDEOS;
  return MOCK_VIDEOS.filter((video) => video.category === category);
}

/**
 * Get video by ID
 */
export function getVideoById(id: string): VideoItem | undefined {
  return MOCK_VIDEOS.find((video) => video.id === id);
}

/**
 * Get track by ID
 */
export function getTrackById(id: string): MusicTrack | undefined {
  return MOCK_TRACKS.find((track) => track.id === id);
}

/**
 * Get all video categories
 */
export function getVideoCategories(): { value: VideoCategory | 'all'; label: string }[] {
  return [
    { value: 'all', label: 'All' },
    { value: 'music-video', label: 'Music Videos' },
    { value: 'community', label: 'Community' },
    { value: 'tutorial', label: 'Tutorials' },
    { value: 'meme', label: 'Memes' },
    { value: 'event', label: 'Events' },
  ];
}

/**
 * Format duration from seconds to mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format view count
 */
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

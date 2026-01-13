/**
 * Media Types
 *
 * Type definitions for the Media Hub system.
 */

// ============ Games Types ============

export interface MiniGame {
  id: string;
  name: string;
  emoji: string;
  description: string;
  status: GameStatus;

  // Display
  thumbnailUrl?: string;
  accentColor: string;

  // Navigation
  route?: string;

  // Game metadata
  hasHighScores: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedPlayTime?: string;

  // Accessibility
  accessibilityFeatures: GameAccessibility;

  // Instructions
  instructions: GameInstruction[];
  controls: GameControl[];
}

export type GameStatus = 'available' | 'coming-soon' | 'maintenance';

export interface GameAccessibility {
  keyboardPlayable: boolean;
  screenReaderSupport: boolean;
  colorBlindMode: boolean;
  reducedMotionSupport: boolean;
  audioDescriptions: boolean;
  pauseAnytime: boolean;
}

export interface GameInstruction {
  step: number;
  text: string;
  image?: string;
}

export interface GameControl {
  input: string;
  action: string;
  alternatives?: string[];
}

export interface GameSession {
  gameId: string;
  startedAt: Date;
  score: number;
  level?: number;
  isPaused: boolean;
  duration: number;
}

export interface HighScore {
  gameId: string;
  score: number;
  date: Date;
  playerName?: string;
}

// ============ Video Types ============

export interface VideoItem {
  id: string;
  title: string;
  description?: string;

  // Sources
  youtubeId?: string;
  videoUrl?: string;
  thumbnailUrl: string;

  // Metadata
  duration: number;
  durationFormatted: string;
  uploadDate?: Date;
  viewCount?: number;

  // Categorization
  category: VideoCategory;
  tags?: string[];

  // Accessibility
  hasCaptions: boolean;
  hasAudioDescription: boolean;
  captionLanguages?: string[];
}

export type VideoCategory =
  | 'music-video'
  | 'community'
  | 'tutorial'
  | 'meme'
  | 'event';

export interface VideoPlayerState {
  currentVideo: VideoItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Player UI
  isMinimized: boolean;
  isPictureInPicture: boolean;
  position: { x: number; y: number };
  size: PlayerSize;

  // Queue
  queue: VideoItem[];
  queueIndex: number;

  // Playback
  playbackRate: number;
  isLooping: boolean;

  // Captions
  captionsEnabled: boolean;
  captionLanguage: string;
}

export type PlayerSize = 'mini' | 'small' | 'medium' | 'large';

export const PLAYER_SIZES: Record<PlayerSize, { width: number; height: number }> = {
  mini: { width: 280, height: 158 },
  small: { width: 320, height: 180 },
  medium: { width: 480, height: 270 },
  large: { width: 640, height: 360 },
};

// ============ Music Types ============

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;

  // Sources
  audioUrl: string;

  // Metadata
  duration: number;
  durationFormatted: string;

  // Display
  coverArtUrl: string;
  coverArtColors?: {
    primary: string;
    secondary: string;
  };

  // Categorization
  genre?: string;
  mood?: string[];
  bpm?: number;
}

export interface MusicPlayerState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Playlist
  playlist: MusicTrack[];
  playlistIndex: number;

  // Playback modes
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;

  // Cross-page
  persistAcrossNavigation: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';

// ============ Media Context Types ============

export interface MediaContextValue {
  // Video
  videoPlayer: VideoPlayerState;
  playVideo: (video: VideoItem) => void;
  pauseVideo: () => void;
  closeVideoPlayer: () => void;
  setVideoVolume: (volume: number) => void;
  seekVideo: (time: number) => void;
  togglePictureInPicture: () => Promise<void>;
  setVideoPosition: (position: { x: number; y: number }) => void;
  setVideoSize: (size: PlayerSize) => void;
  toggleVideoMinimize: () => void;

  // Music
  musicPlayer: MusicPlayerState;
  playTrack: (track: MusicTrack) => void;
  pauseMusic: () => void;
  resumeMusic: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setMusicVolume: (volume: number) => void;
  seekMusic: (time: number) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setPlaylist: (tracks: MusicTrack[]) => void;

  // Global
  stopAllMedia: () => void;

  // Preferences
  preferences: MediaPreferences;
  updatePreferences: (prefs: Partial<MediaPreferences>) => void;

  // Refs
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export interface MediaPreferences {
  // Volume (0-1)
  videoVolume: number;
  musicVolume: number;
  masterVolume: number;

  // Behavior
  autoplayNext: boolean;
  pauseMusicOnVideo: boolean;
  rememberPosition: boolean;

  // Accessibility
  alwaysShowCaptions: boolean;
  prefersReducedMotion: boolean;
  announceTrackChanges: boolean;
}

// ============ Media Page Types ============

export type MediaSection = 'games' | 'videos' | 'music';

export interface MediaPageState {
  activeSection: MediaSection;
  gameModalOpen: boolean;
  selectedGame: MiniGame | null;
  videoFilter: VideoCategory | 'all';
}

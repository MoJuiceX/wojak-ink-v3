import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { loadSettings, AppSettings } from '../components/Settings';

interface AudioContextType {
  // Background music controls
  isBackgroundMusicEnabled: boolean;
  isBackgroundMusicPlaying: boolean;
  playBackgroundMusic: () => void;
  pauseBackgroundMusic: () => void;
  setBackgroundMusicTrack: (trackUrl: string) => void;

  // Sound effects controls
  isSoundEffectsEnabled: boolean;
  playSound: (soundId: string) => void;

  // Settings sync
  updateFromSettings: (settings: AppSettings) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

// Sound effect paths (will be populated when audio files are added)
const SOUND_EFFECTS: Record<string, string> = {
  bubble_pop: '/assets/audio/sfx/bubble_pop.mp3',
  button_click: '/assets/audio/sfx/button_click.mp3',
  success: '/assets/audio/sfx/success.mp3',
  error: '/assets/audio/sfx/error.mp3',
};

// Background music tracks (will be populated when audio files are added)
const MUSIC_TRACKS: Record<string, string> = {
  default: '/assets/audio/music/background.mp3',
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isBackgroundMusicEnabled, setIsBackgroundMusicEnabled] = useState(true);
  const [isSoundEffectsEnabled, setIsSoundEffectsEnabled] = useState(true);
  const [isBackgroundMusicPlaying, setIsBackgroundMusicPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string>(MUSIC_TRACKS.default);

  // Audio elements
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const soundPoolRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Initialize from saved settings
  useEffect(() => {
    const settings = loadSettings();
    setIsBackgroundMusicEnabled(settings.backgroundMusic);
    setIsSoundEffectsEnabled(settings.soundEffects);
  }, []);

  // Initialize background music audio element
  useEffect(() => {
    bgMusicRef.current = new Audio();
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3; // Default volume

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, []);

  // Update track when currentTrack changes
  useEffect(() => {
    if (bgMusicRef.current && currentTrack) {
      const wasPlaying = isBackgroundMusicPlaying;
      bgMusicRef.current.src = currentTrack;

      if (wasPlaying && isBackgroundMusicEnabled) {
        bgMusicRef.current.play().catch(err => {
          console.log('Auto-play prevented:', err);
        });
      }
    }
  }, [currentTrack]);

  // Handle background music enable/disable
  useEffect(() => {
    if (!bgMusicRef.current) return;

    if (!isBackgroundMusicEnabled && isBackgroundMusicPlaying) {
      bgMusicRef.current.pause();
      setIsBackgroundMusicPlaying(false);
    }
  }, [isBackgroundMusicEnabled]);

  const playBackgroundMusic = () => {
    if (!bgMusicRef.current || !isBackgroundMusicEnabled) return;

    bgMusicRef.current.play()
      .then(() => {
        setIsBackgroundMusicPlaying(true);
      })
      .catch(err => {
        console.log('Failed to play background music:', err);
      });
  };

  const pauseBackgroundMusic = () => {
    if (!bgMusicRef.current) return;

    bgMusicRef.current.pause();
    setIsBackgroundMusicPlaying(false);
  };

  const setBackgroundMusicTrack = (trackUrl: string) => {
    setCurrentTrack(trackUrl);
  };

  const playSound = (soundId: string) => {
    if (!isSoundEffectsEnabled) return;

    const soundPath = SOUND_EFFECTS[soundId];
    if (!soundPath) {
      console.warn(`Sound effect not found: ${soundId}`);
      return;
    }

    // Get or create audio element from pool
    let audio = soundPoolRef.current.get(soundId);
    if (!audio) {
      audio = new Audio(soundPath);
      audio.volume = 0.5;
      soundPoolRef.current.set(soundId, audio);
    }

    // Reset and play
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.log(`Failed to play sound ${soundId}:`, err);
    });
  };

  const updateFromSettings = (settings: AppSettings) => {
    setIsBackgroundMusicEnabled(settings.backgroundMusic);
    setIsSoundEffectsEnabled(settings.soundEffects);
  };

  return (
    <AudioContext.Provider
      value={{
        isBackgroundMusicEnabled,
        isBackgroundMusicPlaying,
        playBackgroundMusic,
        pauseBackgroundMusic,
        setBackgroundMusicTrack,
        isSoundEffectsEnabled,
        playSound,
        updateFromSettings,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export default AudioContext;

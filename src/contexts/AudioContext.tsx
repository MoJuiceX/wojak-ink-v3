// @ts-nocheck
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useSettings } from './SettingsContext';

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
}

const AudioContext = createContext<AudioContextType | null>(null);

// Sound effect paths (will be populated when audio files are added)
const SOUND_EFFECTS: Record<string, string> = {
  bubble_pop: '/assets/audio/sfx/bubble_pop.mp3',
  button_click: '/assets/audio/sfx/button_click.mp3',
  success: '/assets/audio/sfx/success.mp3',
  error: '/assets/audio/sfx/error.mp3',
};

// Background music tracks
const MUSIC_TRACKS: Record<string, string> = {
  default: '/assets/music/wojakmusic1.mp3',
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const { settings } = useSettings();

  // Derive enabled states from SettingsContext
  const isBackgroundMusicEnabled = settings.audio.backgroundMusicEnabled;
  const isSoundEffectsEnabled = settings.audio.soundEffectsEnabled;

  const [isBackgroundMusicPlaying, setIsBackgroundMusicPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string>(MUSIC_TRACKS.default);

  // Audio elements
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const soundPoolRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Compute effective volumes
  const musicVolume = settings.audio.backgroundMusicVolume;
  const sfxVolume = settings.audio.soundEffectsVolume;

  // Initialize background music audio element
  useEffect(() => {
    bgMusicRef.current = new Audio();
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = musicVolume;

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, []);

  // Update music volume when settings change
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

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
      soundPoolRef.current.set(soundId, audio);
    }

    // Update volume and play
    audio.volume = sfxVolume;
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.log(`Failed to play sound ${soundId}:`, err);
    });
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

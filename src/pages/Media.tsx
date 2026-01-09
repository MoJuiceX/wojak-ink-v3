import { useState, useRef, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonModal,
  IonButton,
  IonButtons,
} from '@ionic/react';
import { musicalNotes, videocam, gameController, play, close, pauseCircle, playCircle, volumeLow, volumeHigh } from 'ionicons/icons';
import Game from './Game';
import OrangeStack from './OrangeStack';
import MemoryMatch from './MemoryMatch';
import OrangePong from './OrangePong';
import WojakRunner from './WojakRunner';
import Orange2048 from './Orange2048';
import { useVideoPlayer, MUSIC_VIDEOS, VideoItem } from '../contexts/VideoPlayerContext';
import { useAudio } from '../contexts/AudioContext';
import './Media.css';

// Music tracks for background music
interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  file?: string; // Local file path when available
  duration?: string;
}

// Website music tracks
const MUSIC_TRACKS: MusicTrack[] = [
  { id: '1', title: 'Crash Bandicoot', artist: 'Wojak.ink', file: '/assets/music/wojakmusic1.mp3', duration: '3:45' },
];

// Game definitions
const GAMES = [
  { id: 'slice', name: 'Orange Slice', emoji: '🍊' },
  { id: 'stack', name: 'Orange Stack', emoji: '📦' },
  { id: 'memory', name: 'Memory Match', emoji: '🧠' },
  { id: 'pong', name: 'Orange Pong', emoji: '🏓' },
  { id: 'runner', name: 'Wojak Runner', emoji: '🏃' },
  { id: '2048', name: '2048 Oranges', emoji: '🔢' },
];

const Media: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [musicVolume, setMusicVolume] = useState(0.5); // 0 to 1
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { openVideo, closeVideo, isOpen: isVideoPlaying } = useVideoPlayer();
  const { isBackgroundMusicEnabled } = useAudio();

  const handlePlayTrack = (track: MusicTrack) => {
    if (playingTrack === track.id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingTrack(null);
    } else if (isBackgroundMusicEnabled) {
      // Only play if background music is enabled in settings
      // Stop any playing video first - music and video can't play together
      if (isVideoPlaying) {
        closeVideo();
      }
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (track.file) {
        // Create audio element
        const audio = new Audio(track.file);
        audio.loop = true;
        audio.crossOrigin = 'anonymous';
        audioRef.current = audio;

        // Use Web Audio API for volume control (works on iOS)
        try {
          // Create or reuse AudioContext
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const audioContext = audioContextRef.current;

          // Resume context if suspended (required for iOS)
          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }

          // Create gain node for volume control
          const gainNode = audioContext.createGain();
          gainNode.gain.value = musicVolume;
          gainNodeRef.current = gainNode;

          // Connect audio element to gain node to destination
          const source = audioContext.createMediaElementSource(audio);
          source.connect(gainNode);
          gainNode.connect(audioContext.destination);
        } catch (err) {
          console.log('Web Audio API not available, using fallback:', err);
          // Fallback: try setting volume directly (won't work on iOS but works elsewhere)
          audio.volume = musicVolume;
        }

        audio.play()
          .then(() => setPlayingTrack(track.id))
          .catch(err => console.log('Audio play failed:', err));
      }
    }
  };

  // Set volume and update audio (uses GainNode for iOS compatibility)
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setMusicVolume(clampedVolume);
    // Update gain node (Web Audio API - works on iOS)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clampedVolume;
    }
    // Also try direct volume (fallback for non-iOS)
    if (audioRef.current) {
      try {
        audioRef.current.volume = clampedVolume;
      } catch (e) {
        // iOS throws error when setting volume
      }
    }
  }, []);

  // Mouse handler for desktop
  const handleSliderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const slider = sliderRef.current;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    setVolume(Math.max(0, Math.min(1, percentage)));
  };

  // Native touch event listeners for mobile (more reliable)
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let isDragging = false;

    const updateVolumeFromTouch = (touch: Touch) => {
      const rect = slider.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const percentage = x / rect.width;
      const newVolume = Math.max(0, Math.min(1, percentage));
      setVolume(newVolume);
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      updateVolumeFromTouch(e.touches[0]);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      updateVolumeFromTouch(e.touches[0]);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      isDragging = false;
    };

    slider.addEventListener('touchstart', handleTouchStart, { passive: false });
    slider.addEventListener('touchmove', handleTouchMove, { passive: false });
    slider.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      slider.removeEventListener('touchstart', handleTouchStart);
      slider.removeEventListener('touchmove', handleTouchMove);
      slider.removeEventListener('touchend', handleTouchEnd);
    };
  }, [setVolume]);

  // Sync audio volume when musicVolume state changes
  useEffect(() => {
    // Update gain node (Web Audio API - works on iOS)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = musicVolume;
    }
    // Also try direct volume (fallback)
    if (audioRef.current) {
      try {
        audioRef.current.volume = musicVolume;
      } catch (e) {
        // iOS throws error when setting volume
      }
    }
  }, [musicVolume]);

  // Stop background music when video starts playing
  const stopBackgroundMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingTrack(null);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop music when background music setting is disabled
  useEffect(() => {
    if (!isBackgroundMusicEnabled && playingTrack) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingTrack(null);
    }
  }, [isBackgroundMusicEnabled, playingTrack]);

  const handlePlayVideo = (video: VideoItem) => {
    // Stop background music when video starts
    stopBackgroundMusic();
    // Open in global floating video player
    openVideo(video);
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  return (
    <IonPage>
      <IonContent className="media-content">
        {/* Games Section */}
        <IonCard className="media-section">
          <IonCardHeader>
            <IonCardTitle className="section-title">
              <IonIcon icon={gameController} className="section-icon" />
              Two Grove Gaming
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="games-grid">
              {GAMES.map(game => (
                <div
                  key={game.id}
                  className="game-card-mini"
                  onClick={() => setActiveGame(game.id)}
                >
                  <div className="game-icon-mini">{game.emoji}</div>
                  <span className="game-name-mini">{game.name}</span>
                </div>
              ))}
            </div>
          </IonCardContent>
        </IonCard>

        {/* Music Videos Section */}
        <IonCard className="media-section">
          <IonCardHeader>
            <IonCardTitle className="section-title">
              <IonIcon icon={videocam} className="section-icon" />
              Music Videos
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="video-grid">
              {MUSIC_VIDEOS.map(video => (
                <div
                  key={video.id}
                  className="video-item"
                  onClick={() => handlePlayVideo(video)}
                >
                  <div className="video-thumbnail">
                    {video.thumbnail && <img src={video.thumbnail} alt={video.title} />}
                    <IonIcon icon={play} className="play-overlay" />
                  </div>
                  <span className="video-title">{video.title}</span>
                </div>
              ))}
            </div>
          </IonCardContent>
        </IonCard>

        {/* Website Music Section */}
        <IonCard className="media-section">
          <IonCardHeader>
            <IonCardTitle className="section-title">
              <IonIcon icon={musicalNotes} className="section-icon" />
              Website Music
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="music-list">
              {MUSIC_TRACKS.map(track => (
                <div key={track.id} className="music-item-wrapper">
                  <div
                    className={`music-item ${playingTrack === track.id ? 'playing' : ''}`}
                    onClick={() => handlePlayTrack(track)}
                  >
                    <div className="music-play-btn">
                      <IonIcon icon={playingTrack === track.id ? pauseCircle : playCircle} />
                    </div>
                    <div className="music-info">
                      <span className="music-title">{track.title}</span>
                      <span className="music-artist">{track.artist}</span>
                    </div>
                    <span className="music-duration">{track.duration}</span>
                  </div>
                  <div
                    className="volume-slider-container"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IonIcon icon={volumeLow} className="volume-icon" />
                    <div
                      ref={sliderRef}
                      className="volume-slider-track"
                      onClick={handleSliderClick}
                    >
                      <div
                        className="volume-slider-fill"
                        style={{ width: `${musicVolume * 100}%` }}
                      />
                      <div
                        className="volume-slider-thumb"
                        style={{ left: `${musicVolume * 100}%` }}
                      />
                    </div>
                    <IonIcon icon={volumeHigh} className="volume-icon" />
                  </div>
                </div>
              ))}
            </div>
          </IonCardContent>
        </IonCard>

        {/* Game Modal */}
        <IonModal isOpen={activeGame !== null} onDidDismiss={() => setActiveGame(null)}>
          {activeGame === 'slice' && <Game />}
          {activeGame === 'stack' && <OrangeStack />}
          {activeGame === 'memory' && <MemoryMatch />}
          {activeGame === 'pong' && <OrangePong />}
          {activeGame === 'runner' && <WojakRunner />}
          {activeGame === '2048' && <Orange2048 />}
          <IonButton
            className="close-game-btn"
            fill="clear"
            onClick={() => setActiveGame(null)}
          >
            <IonIcon icon={close} />
          </IonButton>
        </IonModal>

        {/* Video Player Modal */}
        <IonModal
          isOpen={showVideoModal}
          onDidDismiss={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
          }}
          className="video-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selectedVideo?.title}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowVideoModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="video-modal-content">
            {selectedVideo && selectedVideo.platform === 'youtube' && selectedVideo.videoFile && (
              <div className="video-container">
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.videoFile)}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {!selectedVideo?.videoFile && (
              <div className="placeholder-message">
                <p>Video coming soon!</p>
              </div>
            )}
          </IonContent>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default Media;

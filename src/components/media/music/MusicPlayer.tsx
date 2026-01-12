/**
 * Music Player Component
 *
 * Background music player with Media Session support.
 */

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useMedia } from '@/contexts/MediaContext';
import type { MusicTrack } from '@/types/media';
import { formatDuration } from '@/utils/mockMediaData';
import {
  musicPlayerVariants,
  trackItemVariants,
  nowPlayingVariants,
  shuffleVariants,
  repeatVariants,
} from '@/config/mediaAnimations';

interface MusicPlayerProps {
  tracks: MusicTrack[];
  defaultExpanded?: boolean;
  isLoading?: boolean;
}

function TrackSkeleton() {
  return (
    <div
      className="flex items-center gap-3 p-2 rounded-lg animate-pulse"
    >
      <div
        className="w-6 h-4 rounded"
        style={{ background: 'var(--color-border)' }}
      />
      <div className="flex-1 space-y-1">
        <div
          className="h-4 rounded"
          style={{ background: 'var(--color-border)', width: '60%' }}
        />
        <div
          className="h-3 rounded"
          style={{ background: 'var(--color-border)', width: '40%' }}
        />
      </div>
      <div
        className="w-10 h-3 rounded"
        style={{ background: 'var(--color-border)' }}
      />
    </div>
  );
}

export function MusicPlayer({ tracks, defaultExpanded = false, isLoading = false }: MusicPlayerProps) {
  const {
    musicPlayer,
    playTrack,
    pauseMusic,
    resumeMusic,
    nextTrack,
    previousTrack,
    setMusicVolume,
    seekMusic,
    toggleShuffle,
    setRepeatMode,
    setPlaylist,
  } = useMedia();

  const prefersReducedMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffleEnabled,
    repeatMode,
  } = musicPlayer;

  // Initialize playlist if empty
  if (musicPlayer.playlist.length === 0 && tracks.length > 0) {
    setPlaylist(tracks);
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseMusic();
    } else if (currentTrack) {
      resumeMusic();
    } else if (tracks.length > 0) {
      playTrack(tracks[0]);
    }
  };

  const handleTrackClick = (track: MusicTrack) => {
    playTrack(track);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekMusic(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMusicVolume(parseFloat(e.target.value));
  };

  const cycleRepeatMode = () => {
    const modes: typeof repeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <motion.div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
      variants={prefersReducedMotion ? undefined : musicPlayerVariants}
      animate={isExpanded ? 'expanded' : 'collapsed'}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4"
        style={{ borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none' }}
      >
        <div className="flex items-center gap-2">
          <Music size={20} style={{ color: 'var(--color-brand-primary)' }} />
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Background Music
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Shuffle button */}
          <motion.button
            className="p-2 rounded-lg transition-colors"
            style={{
              color: shuffleEnabled
                ? 'var(--color-brand-primary)'
                : 'var(--color-text-muted)',
            }}
            variants={prefersReducedMotion ? undefined : shuffleVariants}
            animate={shuffleEnabled ? 'active' : 'inactive'}
            onClick={toggleShuffle}
            aria-label={shuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'}
            aria-pressed={shuffleEnabled}
          >
            <Shuffle size={18} />
          </motion.button>

          {/* Repeat button */}
          <motion.button
            className="p-2 rounded-lg transition-colors"
            style={{
              color:
                repeatMode !== 'off'
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-text-muted)',
            }}
            variants={prefersReducedMotion ? undefined : repeatVariants}
            animate={repeatMode}
            onClick={cycleRepeatMode}
            aria-label={`Repeat: ${repeatMode}`}
          >
            <RepeatIcon size={18} />
          </motion.button>

          {/* Expand/Collapse button */}
          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Collapsed mini player */}
      {!isExpanded && currentTrack && (
        <div className="flex items-center gap-3 p-3 pt-0">
          <img
            src={currentTrack.coverArtUrl}
            alt={currentTrack.title}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {currentTrack.title}
            </p>
          </div>
          <button
            className="p-2 rounded-lg"
            style={{
              background: 'var(--color-brand-primary)',
              color: 'white',
            }}
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>
      )}

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 pt-0"
          >
            {/* Now playing section */}
            <div className="flex gap-4 mb-4">
              {/* Album art */}
              <AnimatePresence mode="wait">
                {currentTrack && (
                  <motion.img
                    key={currentTrack.id}
                    src={currentTrack.coverArtUrl}
                    alt={currentTrack.title}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover flex-shrink-0"
                    variants={prefersReducedMotion ? undefined : nowPlayingVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  />
                )}
              </AnimatePresence>

              {/* Track info and controls */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                {currentTrack ? (
                  <>
                    <h3
                      className="text-base font-semibold truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {currentTrack.title}
                    </h3>
                    <p
                      className="text-sm truncate mb-3"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {currentTrack.artist}
                    </p>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--color-brand-primary) ${(currentTime / (duration || 1)) * 100}%, var(--color-border) ${(currentTime / (duration || 1)) * 100}%)`,
                        }}
                        aria-label="Music progress"
                      />
                      <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <span>{formatDuration(currentTime)}</span>
                        <span>{formatDuration(duration)}</span>
                      </div>
                    </div>

                    {/* Playback controls */}
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <button
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                        onClick={previousTrack}
                        aria-label="Previous track"
                      >
                        <SkipBack size={20} />
                      </button>
                      <button
                        className="p-3 rounded-full"
                        style={{
                          background: 'var(--color-brand-primary)',
                          color: 'white',
                        }}
                        onClick={handlePlayPause}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                      <button
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                        onClick={nextTrack}
                        aria-label="Next track"
                      >
                        <SkipForward size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    Select a track to play
                  </p>
                )}
              </div>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-2 mb-4">
              <button
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onClick={() => setMusicVolume(isMuted ? 0.7 : 0)}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-brand-primary) ${(isMuted ? 0 : volume) * 100}%, var(--color-border) ${(isMuted ? 0 : volume) * 100}%)`,
                }}
                aria-label="Volume"
              />
            </div>

            {/* Track list */}
            <div>
              <h4
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Track List
              </h4>
              <div
                className="space-y-1 max-h-48 overflow-y-auto rounded-lg"
                role="listbox"
                aria-label="Music tracks"
              >
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TrackSkeleton key={i} />
                  ))
                ) : (
                  tracks.map((track, index) => (
                    <motion.button
                      key={track.id}
                      className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors"
                      style={{
                        background:
                          currentTrack?.id === track.id
                            ? 'var(--color-brand-primary)'
                            : 'transparent',
                        color:
                          currentTrack?.id === track.id
                            ? 'white'
                            : 'var(--color-text-secondary)',
                      }}
                      variants={prefersReducedMotion ? undefined : trackItemVariants}
                      initial="initial"
                      animate="animate"
                      onClick={() => handleTrackClick(track)}
                      role="option"
                      aria-selected={currentTrack?.id === track.id}
                    >
                      {/* Playing indicator or track number */}
                      <div className="w-6 text-center text-sm">
                        {currentTrack?.id === track.id && isPlaying ? (
                          <span className="inline-flex gap-0.5">
                            <span className="w-0.5 h-3 bg-current animate-pulse" />
                            <span className="w-0.5 h-3 bg-current animate-pulse delay-75" />
                            <span className="w-0.5 h-3 bg-current animate-pulse delay-150" />
                          </span>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{track.title}</p>
                        <p
                          className="text-xs truncate"
                          style={{
                            color:
                              currentTrack?.id === track.id
                                ? 'rgba(255,255,255,0.7)'
                                : 'var(--color-text-muted)',
                          }}
                        >
                          {track.artist}
                        </p>
                      </div>
                      <span className="text-xs">{track.durationFormatted}</span>
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default MusicPlayer;

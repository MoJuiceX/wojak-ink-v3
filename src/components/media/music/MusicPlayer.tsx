/**
 * Music Player Component
 *
 * Simple background music player with play/stop toggle.
 */

import { Music, Play, Square } from 'lucide-react';
import { useMedia } from '@/contexts/MediaContext';
import type { MusicTrack } from '@/types/media';

interface MusicPlayerProps {
  tracks: MusicTrack[];
  defaultExpanded?: boolean;
  isLoading?: boolean;
}

export function MusicPlayer({ tracks }: MusicPlayerProps) {
  const {
    musicPlayer,
    playTrack,
    pauseMusic,
    resumeMusic,
    setPlaylist,
  } = useMedia();

  const { currentTrack, isPlaying } = musicPlayer;

  // Initialize playlist if empty
  if (musicPlayer.playlist.length === 0 && tracks.length > 0) {
    setPlaylist(tracks);
  }

  const handleToggle = () => {
    if (isPlaying) {
      pauseMusic();
    } else if (currentTrack) {
      resumeMusic();
    } else if (tracks.length > 0) {
      playTrack(tracks[0]);
    }
  };

  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{
            background: isPlaying ? 'var(--color-brand-primary)' : 'var(--color-bg-secondary)',
          }}
        >
          <Music
            size={20}
            style={{ color: isPlaying ? 'white' : 'var(--color-text-secondary)' }}
          />
        </div>
        <span
          className="font-medium"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Background Music
        </span>
      </div>

      <button
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
        style={{
          background: isPlaying ? 'var(--color-status-error)' : 'var(--color-brand-primary)',
          color: 'white',
        }}
        onClick={handleToggle}
        aria-label={isPlaying ? 'Stop music' : 'Play music'}
      >
        {isPlaying ? (
          <>
            <Square size={16} fill="white" />
            Stop
          </>
        ) : (
          <>
            <Play size={16} fill="white" />
            Play
          </>
        )}
      </button>
    </div>
  );
}

export default MusicPlayer;

/**
 * Audio Settings Component
 *
 * Audio control section with master, music, and SFX controls.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { VolumeSlider } from './VolumeSlider';
import { settingsSectionVariants } from '@/config/settingsAnimations';
import type { AudioSettings as AudioSettingsType } from '@/types/settings';

interface AudioSettingsProps {
  audio: AudioSettingsType;
  onMasterVolumeChange: (volume: number) => void;
  onMasterToggle: () => void;
  onMusicVolumeChange: (volume: number) => void;
  onMusicToggle: () => void;
  onSfxVolumeChange: (volume: number) => void;
  onSfxToggle: () => void;
}

export function AudioSettings({
  audio,
  onMasterVolumeChange,
  onMasterToggle,
  onMusicVolumeChange,
  onMusicToggle,
  onSfxVolumeChange,
  onSfxToggle,
}: AudioSettingsProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      variants={prefersReducedMotion ? undefined : settingsSectionVariants}
      initial="initial"
      animate="animate"
      className="space-y-4"
      aria-labelledby="audio-section-heading"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Volume2 size={20} style={{ color: 'var(--color-brand-primary)' }} />
        <h2
          id="audio-section-heading"
          className="text-lg font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Audio Settings
        </h2>
      </div>

      {/* Audio Controls */}
      <div className="space-y-3">
        <VolumeSlider
          id="master-audio"
          label="Master Audio"
          volume={audio.masterVolume}
          enabled={audio.masterEnabled}
          onVolumeChange={onMasterVolumeChange}
          onToggle={onMasterToggle}
        />

        <VolumeSlider
          id="background-music"
          label="Background Music"
          description="Ambient tracks while browsing"
          volume={audio.backgroundMusicVolume}
          enabled={audio.backgroundMusicEnabled && audio.masterEnabled}
          onVolumeChange={onMusicVolumeChange}
          onToggle={onMusicToggle}
        />

        <VolumeSlider
          id="sound-effects"
          label="Sound Effects"
          description="UI interactions and notifications"
          volume={audio.soundEffectsVolume}
          enabled={audio.soundEffectsEnabled && audio.masterEnabled}
          onVolumeChange={onSfxVolumeChange}
          onToggle={onSfxToggle}
        />
      </div>
    </motion.section>
  );
}

export default AudioSettings;

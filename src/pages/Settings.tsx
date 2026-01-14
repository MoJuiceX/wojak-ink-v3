// @ts-nocheck
/**
 * Settings Page
 *
 * Theme, audio, and app information settings.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { PageTransition } from '@/components/layout/PageTransition';
import { useLayout } from '@/hooks/useLayout';
import { useSettings } from '@/contexts/SettingsContext';
import {
  ThemeSelector,
  AudioSettings,
  AboutSection,
  WalletSettings,
} from '@/components/settings';
import { settingsPageVariants, settingsSectionVariants } from '@/config/settingsAnimations';

export default function Settings() {
  const { contentPadding, isDesktop } = useLayout();
  const prefersReducedMotion = useReducedMotion();
  const {
    settings,
    setTheme,
    setBackgroundMusicVolume,
    toggleBackgroundMusic,
    setSoundEffectsVolume,
    toggleSoundEffects,
  } = useSettings();

  return (
    <PageTransition>
      <motion.div
        className="min-h-full"
        style={{ padding: contentPadding }}
        variants={prefersReducedMotion ? undefined : settingsPageVariants}
        initial="initial"
        animate="animate"
      >
        <div
          className="space-y-8 pb-24"
          style={{ maxWidth: isDesktop ? '1000px' : undefined, margin: '0 auto' }}
        >
          {/* Desktop: Full-width themes, audio below */}
          {isDesktop ? (
            <div className="space-y-8">
              {/* Theme Selection - Full width */}
              <ThemeSelector
                selectedTheme={settings.theme.selected}
                onThemeChange={setTheme}
              />

              {/* Divider */}
              <div
                className="h-px"
                style={{ background: 'var(--color-border)' }}
              />

              {/* Audio - Below themes */}
              <AudioSettings
                audio={settings.audio}
                onMusicVolumeChange={setBackgroundMusicVolume}
                onMusicToggle={toggleBackgroundMusic}
                onSfxVolumeChange={setSoundEffectsVolume}
                onSfxToggle={toggleSoundEffects}
              />
            </div>
          ) : (
            /* Mobile: Single column layout */
            <>
              {/* Wallet Settings - Mobile only */}
              <WalletSettings />

              {/* Divider */}
              <div
                className="h-px"
                style={{ background: 'var(--color-border)' }}
              />

              {/* Theme Selection */}
              <ThemeSelector
                selectedTheme={settings.theme.selected}
                onThemeChange={setTheme}
              />

              {/* Divider */}
              <div
                className="h-px"
                style={{ background: 'var(--color-border)' }}
              />

              {/* Audio */}
              <AudioSettings
                audio={settings.audio}
                onMusicVolumeChange={setBackgroundMusicVolume}
                onMusicToggle={toggleBackgroundMusic}
                onSfxVolumeChange={setSoundEffectsVolume}
                onSfxToggle={toggleSoundEffects}
              />
            </>
          )}

          {/* Divider */}
          <div
            className="h-px"
            style={{ background: 'var(--color-border)' }}
          />

          {/* About Section */}
          <AboutSection />
        </div>
      </motion.div>
    </PageTransition>
  );
}

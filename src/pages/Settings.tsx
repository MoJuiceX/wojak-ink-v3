// @ts-nocheck
/**
 * Settings Page
 *
 * Theme, audio, accessibility, and app information settings.
 */

import { useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PageTransition } from '@/components/layout/PageTransition';
import { useLayout } from '@/hooks/useLayout';
import { useSettings } from '@/contexts/SettingsContext';
import {
  ThemeSelector,
  AudioSettings,
  AccessibilitySettings,
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
    setMasterVolume,
    toggleMasterAudio,
    setBackgroundMusicVolume,
    toggleBackgroundMusic,
    setSoundEffectsVolume,
    toggleSoundEffects,
    setMotionPreference,
    updateAppSettings,
  } = useSettings();

  // Tooltips toggle
  const handleTooltipsChange = useCallback(
    (enabled: boolean) => {
      updateAppSettings({ showTooltips: enabled });
    },
    [updateAppSettings]
  );

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
          {/* Header */}
          <motion.div
            className="pt-4"
            variants={prefersReducedMotion ? undefined : settingsSectionVariants}
          >
            <h1
              className="text-3xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Settings
            </h1>
            <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Customize your Wojak.ink experience
            </p>
          </motion.div>

          {/* Desktop: Two-column layout */}
          {isDesktop ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Theme Selection */}
                <ThemeSelector
                  selectedTheme={settings.theme.selected}
                  onThemeChange={setTheme}
                />

                {/* Accessibility */}
                <AccessibilitySettings
                  motionPreference={settings.motion.preference}
                  reducedMotion={settings.motion.reducedMotion}
                  showTooltips={settings.app.showTooltips}
                  onMotionChange={setMotionPreference}
                  onTooltipsChange={handleTooltipsChange}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Audio */}
                <AudioSettings
                  audio={settings.audio}
                  onMasterVolumeChange={setMasterVolume}
                  onMasterToggle={toggleMasterAudio}
                  onMusicVolumeChange={setBackgroundMusicVolume}
                  onMusicToggle={toggleBackgroundMusic}
                  onSfxVolumeChange={setSoundEffectsVolume}
                  onSfxToggle={toggleSoundEffects}
                />
              </div>
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
                onMasterVolumeChange={setMasterVolume}
                onMasterToggle={toggleMasterAudio}
                onMusicVolumeChange={setBackgroundMusicVolume}
                onMusicToggle={toggleBackgroundMusic}
                onSfxVolumeChange={setSoundEffectsVolume}
                onSfxToggle={toggleSoundEffects}
              />

              {/* Divider */}
              <div
                className="h-px"
                style={{ background: 'var(--color-border)' }}
              />

              {/* Accessibility */}
              <AccessibilitySettings
                motionPreference={settings.motion.preference}
                reducedMotion={settings.motion.reducedMotion}
                showTooltips={settings.app.showTooltips}
                onMotionChange={setMotionPreference}
                onTooltipsChange={handleTooltipsChange}
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

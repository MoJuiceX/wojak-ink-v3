/**
 * Theme Selector Component
 *
 * Grid of theme cards for theme selection.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { ThemeCard } from './ThemeCard';
import { SETTINGS_THEMES } from '@/config/settingsThemes';
import { staggerContainerVariants, settingsSectionVariants } from '@/config/settingsAnimations';
import type { SettingsThemeId } from '@/types/settings';

interface ThemeSelectorProps {
  selectedTheme: SettingsThemeId;
  onThemeChange: (themeId: SettingsThemeId) => void;
}

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      variants={prefersReducedMotion ? undefined : settingsSectionVariants}
      initial="initial"
      animate="animate"
      className="space-y-4"
      aria-labelledby="theme-section-heading"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Palette size={20} style={{ color: 'var(--color-brand-primary)' }} />
        <h2
          id="theme-section-heading"
          className="text-lg font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Choose Your Vibe
        </h2>
      </div>
      <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
        Select a theme that matches your style
      </p>

      {/* Theme Grid */}
      <motion.div
        role="radiogroup"
        aria-label="Theme selection"
        variants={prefersReducedMotion ? undefined : staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        {SETTINGS_THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={selectedTheme === theme.id}
            onSelect={() => onThemeChange(theme.id)}
          />
        ))}
      </motion.div>
    </motion.section>
  );
}

export default ThemeSelector;

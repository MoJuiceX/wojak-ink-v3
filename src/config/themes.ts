/**
 * Wojak.ink Theme Configurations
 *
 * Complete theme definitions for all 4 core themes.
 * Each theme is optimized for its specific use case and audience.
 */

import type { ThemeConfig, ThemeId } from '@/types/theme';

/**
 * VOID THEME - "Pure Black"
 * OLED-optimized pure black for battery saving and true blacks.
 */
export const voidTheme: ThemeConfig = {
  id: 'void',
  name: 'Void',
  description: 'Pure black for OLED displays',
  icon: '💎',
  isDark: true,
  colors: {
    // Background hierarchy - pure black
    bgPrimary: '#000000',
    bgSecondary: '#080808',
    bgTertiary: '#101010',
    bgElevated: '#181818',

    // Text hierarchy
    textPrimary: '#ffffff',
    textSecondary: '#a0a0a0',
    textMuted: '#606060',
    textAccent: '#ff6b00',

    // Brand colors
    brandPrimary: '#ff6b00',
    brandGlow: '#ff8c00',
    brandDeep: '#cc5500',

    // Surface effects
    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassHover: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderGlow: 'rgba(255, 107, 0, 0.3)',

    // Header background
    headerBg: 'rgba(0, 0, 0, 0.9)',
    headerBgScrolled: 'rgba(0, 0, 0, 0.98)',

    // Glow system
    glowPrimary: '0 0 20px rgba(255, 107, 0, 0.5)',
    glowIntense: '0 0 40px rgba(255, 107, 0, 0.4), 0 0 80px rgba(255, 107, 0, 0.2)',
    glowSubtle: '0 0 10px rgba(255, 107, 0, 0.3)',
    glowText: '0 0 30px rgba(255, 107, 0, 0.6)',

    // Gradients
    gradientHero: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
    gradientCard: 'linear-gradient(180deg, rgba(255,107,0,0.05) 0%, transparent 100%)',
    gradientAccent: 'linear-gradient(90deg, #ff6b00 0%, #ff8c00 100%)',
    gradientMesh: 'radial-gradient(ellipse at 20% 50%, rgba(255,107,0,0.08) 0%, transparent 50%)',
  },
};

/**
 * DARK THEME - "Midnight"
 * The flagship experience. Deep, immersive darkness that makes NFT artwork pop.
 */
export const darkTheme: ThemeConfig = {
  id: 'dark',
  name: 'Midnight Void',
  description: 'Deep, immersive darkness that makes NFT artwork pop',
  icon: '🌙',
  isDark: true,
  colors: {
    // Background hierarchy
    bgPrimary: '#0a0a0f',
    bgSecondary: '#12121a',
    bgTertiary: '#1a1a24',
    bgElevated: '#22222e',

    // Text hierarchy
    textPrimary: '#f8f9fa',
    textSecondary: '#a0a0b0',
    textMuted: '#606070',
    textAccent: '#ff6b00',

    // Brand colors
    brandPrimary: '#ff6b00',
    brandGlow: '#ff8c00',
    brandDeep: '#cc5500',

    // Surface effects
    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassHover: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderGlow: 'rgba(255, 107, 0, 0.3)',

    // Header background
    headerBg: 'rgba(10, 10, 15, 0.85)',
    headerBgScrolled: 'rgba(10, 10, 15, 0.95)',

    // Glow system
    glowPrimary: '0 0 20px rgba(255, 107, 0, 0.5)',
    glowIntense: '0 0 40px rgba(255, 107, 0, 0.4), 0 0 80px rgba(255, 107, 0, 0.2)',
    glowSubtle: '0 0 10px rgba(255, 107, 0, 0.3)',
    glowText: '0 0 30px rgba(255, 107, 0, 0.6)',

    // Gradients
    gradientHero: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a05 50%, #0a0a0f 100%)',
    gradientCard: 'linear-gradient(180deg, rgba(255,107,0,0.05) 0%, transparent 100%)',
    gradientAccent: 'linear-gradient(90deg, #ff6b00 0%, #ff8c00 100%)',
    gradientMesh: 'radial-gradient(ellipse at 20% 50%, rgba(255,107,0,0.1) 0%, transparent 50%)',
  },
};

/**
 * TANG-ORANGE THEME - "Cyberpunk Inferno"
 * Maximum brand expression. Intense, aggressive, unapologetically orange.
 */
export const tangOrangeTheme: ThemeConfig = {
  id: 'tang-orange',
  name: 'Cyberpunk Inferno',
  description: 'Maximum brand expression for true Tang Gang members',
  icon: '🍊',
  isDark: true,
  colors: {
    // Background hierarchy
    bgPrimary: '#0d0400',
    bgSecondary: '#1a0a00',
    bgTertiary: '#2d1500',
    bgElevated: '#3d1f00',

    // Text hierarchy
    textPrimary: '#fff5eb',
    textSecondary: '#ffccaa',
    textMuted: '#996644',
    textAccent: '#ffaa00',

    // Brand colors
    brandPrimary: '#ff8c00',
    brandGlow: '#ffaa00',
    brandDeep: '#ff6600',

    // Surface effects
    glassBg: 'rgba(255, 140, 0, 0.08)',
    glassHover: 'rgba(255, 140, 0, 0.12)',
    border: 'rgba(255, 140, 0, 0.2)',
    borderGlow: 'rgba(255, 140, 0, 0.5)',

    // Header background
    headerBg: 'rgba(13, 4, 0, 0.85)',
    headerBgScrolled: 'rgba(13, 4, 0, 0.95)',

    // Glow system (intensified)
    glowPrimary: '0 0 30px rgba(255, 140, 0, 0.6)',
    glowIntense: '0 0 60px rgba(255, 140, 0, 0.5), 0 0 120px rgba(255, 68, 0, 0.3)',
    glowSubtle: '0 0 15px rgba(255, 140, 0, 0.4)',
    glowText: '0 0 40px rgba(255, 140, 0, 0.8)',

    // Gradients
    gradientHero: 'linear-gradient(135deg, #0d0400 0%, #2d1500 40%, #1a0a00 100%)',
    gradientCard: 'linear-gradient(180deg, rgba(255,140,0,0.1) 0%, rgba(255,68,0,0.05) 100%)',
    gradientAccent: 'linear-gradient(90deg, #ff6600 0%, #ffaa00 100%)',
    gradientMesh: 'radial-gradient(ellipse at 30% 30%, rgba(255,140,0,0.15) 0%, transparent 60%)',
  },
};

/**
 * CHIA-GREEN THEME - "Blockchain Matrix"
 * Chia ecosystem integration. Technical, crypto-native, sustainably styled.
 */
export const chiaGreenTheme: ThemeConfig = {
  id: 'chia-green',
  name: 'Blockchain Matrix',
  description: 'Chia ecosystem native with crypto-technical aesthetics',
  icon: '🌱',
  isDark: true,
  colors: {
    // Background hierarchy
    bgPrimary: '#000f08',
    bgSecondary: '#001a0a',
    bgTertiary: '#002812',
    bgElevated: '#003818',

    // Text hierarchy
    textPrimary: '#e8fff0',
    textSecondary: '#88ddaa',
    textMuted: '#447755',
    textAccent: '#22c55e',

    // Brand colors
    brandPrimary: '#22c55e',
    brandGlow: '#4ade80',
    brandDeep: '#16a34a',

    // Surface effects
    glassBg: 'rgba(34, 197, 94, 0.06)',
    glassHover: 'rgba(34, 197, 94, 0.1)',
    border: 'rgba(34, 197, 94, 0.15)',
    borderGlow: 'rgba(34, 197, 94, 0.4)',

    // Header background
    headerBg: 'rgba(0, 15, 8, 0.85)',
    headerBgScrolled: 'rgba(0, 15, 8, 0.95)',

    // Glow system
    glowPrimary: '0 0 20px rgba(34, 197, 94, 0.5)',
    glowIntense: '0 0 40px rgba(34, 197, 94, 0.4), 0 0 80px rgba(74, 222, 128, 0.2)',
    glowSubtle: '0 0 10px rgba(34, 197, 94, 0.3)',
    glowText: '0 0 30px rgba(34, 197, 94, 0.6)',

    // Gradients
    gradientHero: 'linear-gradient(135deg, #000f08 0%, #002812 50%, #000f08 100%)',
    gradientCard: 'linear-gradient(180deg, rgba(34,197,94,0.08) 0%, transparent 100%)',
    gradientAccent: 'linear-gradient(90deg, #16a34a 0%, #4ade80 100%)',
    gradientMesh: 'radial-gradient(ellipse at 70% 20%, rgba(34,197,94,0.12) 0%, transparent 50%)',
  },
};

/**
 * LIGHT THEME - "Clean Canvas"
 * Accessibility-first. Professional, readable, gallery-style presentation.
 */
export const lightTheme: ThemeConfig = {
  id: 'light',
  name: 'Clean Canvas',
  description: 'Professional gallery-style presentation with full accessibility',
  icon: '☀️',
  isDark: false,
  colors: {
    // Background hierarchy
    bgPrimary: '#fafafa',
    bgSecondary: '#f0f0f2',
    bgTertiary: '#ffffff',
    bgElevated: '#e8e8ec',

    // Text hierarchy
    textPrimary: '#1a1a1f',
    textSecondary: '#4a4a55',
    textMuted: '#8a8a95',
    textAccent: '#e55a00', // Darkened for WCAG AA compliance

    // Brand colors
    brandPrimary: '#e55a00',
    brandGlow: '#ff6b00',
    brandDeep: '#cc4d00',

    // Surface effects (shadows instead of glass in light mode)
    glassBg: 'rgba(255, 255, 255, 0.9)',
    glassHover: 'rgba(255, 255, 255, 1)',
    border: 'rgba(0, 0, 0, 0.08)',
    borderGlow: 'rgba(229, 90, 0, 0.3)',

    // Header background (light with transparency for blur)
    headerBg: 'rgba(250, 250, 250, 0.85)',
    headerBgScrolled: 'rgba(250, 250, 250, 0.95)',

    // Shadow system (replaces glow for light theme)
    glowPrimary: '0 4px 12px rgba(0, 0, 0, 0.1)',
    glowIntense: '0 8px 24px rgba(0, 0, 0, 0.12)',
    glowSubtle: '0 1px 3px rgba(0, 0, 0, 0.08)',
    glowText: '0 4px 20px rgba(229, 90, 0, 0.2)',

    // Gradients
    gradientHero: 'linear-gradient(180deg, #fafafa 0%, #f0f0f2 100%)',
    gradientCard: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
    gradientAccent: 'linear-gradient(90deg, #e55a00 0%, #ff6b00 100%)',
    gradientMesh: 'radial-gradient(ellipse at 50% 0%, rgba(229,90,0,0.05) 0%, transparent 70%)',
  },
};

/**
 * All themes indexed by ID
 */
export const themes: Record<ThemeId, ThemeConfig> = {
  dark: darkTheme,
  void: voidTheme,
  light: lightTheme,
  'tang-orange': tangOrangeTheme,
  'chia-green': chiaGreenTheme,
};

/**
 * Theme order for cycling through themes
 */
export const themeOrder: ThemeId[] = ['dark', 'void', 'light', 'tang-orange', 'chia-green'];

/**
 * Get the next theme in the cycle
 */
export function getNextTheme(currentId: ThemeId): ThemeId {
  const currentIndex = themeOrder.indexOf(currentId);
  const nextIndex = (currentIndex + 1) % themeOrder.length;
  return themeOrder[nextIndex];
}

/**
 * Get theme config by ID with fallback to dark
 */
export function getTheme(id: ThemeId | string): ThemeConfig {
  return themes[id as ThemeId] || darkTheme;
}

/**
 * Validate if a string is a valid theme ID
 */
export function isValidThemeId(id: string): id is ThemeId {
  return id in themes;
}

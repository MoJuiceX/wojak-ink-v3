/**
 * Wojak.ink Theme System Types
 *
 * Comprehensive type definitions for the enterprise-grade theming system.
 * Supports 4 core themes with full color token architecture.
 */

export type ThemeId = 'dark' | 'light' | 'tang-orange' | 'chia-green';

export interface ThemeColors {
  // Background hierarchy
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;

  // Text hierarchy
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;

  // Brand colors
  brandPrimary: string;
  brandGlow: string;
  brandDeep: string;

  // Surface effects (glass morphism)
  glassBg: string;
  glassHover: string;
  border: string;
  borderGlow: string;

  // Header background (with transparency for blur effect)
  headerBg: string;
  headerBgScrolled: string;

  // Glow/shadow system (theme-dependent)
  glowPrimary: string;
  glowIntense: string;
  glowSubtle: string;
  glowText: string;

  // Gradients
  gradientHero: string;
  gradientCard: string;
  gradientAccent: string;
  gradientMesh: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  icon: string;
  colors: ThemeColors;
  isDark: boolean;
}

export interface ThemeContextValue {
  /** Current theme configuration */
  theme: ThemeConfig;
  /** Current theme ID */
  themeId: ThemeId;
  /** Set theme by ID */
  setTheme: (id: ThemeId) => void;
  /** Toggle between dark and light themes */
  toggleTheme: () => void;
  /** Whether current theme is dark */
  isDark: boolean;
  /** System color scheme preference */
  systemPreference: 'dark' | 'light';
  /** Whether theme is currently transitioning */
  isTransitioning: boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme if no preference is stored */
  defaultTheme?: ThemeId;
  /** Storage key for persistence */
  storageKey?: string;
  /** Whether to sync with system preference changes */
  syncWithSystem?: boolean;
}

// CSS custom property names for type safety
export type ThemeCSSProperty =
  | '--color-bg-primary'
  | '--color-bg-secondary'
  | '--color-bg-tertiary'
  | '--color-bg-elevated'
  | '--color-text-primary'
  | '--color-text-secondary'
  | '--color-text-muted'
  | '--color-text-accent'
  | '--color-brand-primary'
  | '--color-brand-glow'
  | '--color-brand-deep'
  | '--color-glass-bg'
  | '--color-glass-hover'
  | '--color-border'
  | '--color-border-glow'
  | '--color-header-bg'
  | '--color-header-bg-scrolled'
  | '--glow-primary'
  | '--glow-intense'
  | '--glow-subtle'
  | '--glow-text'
  | '--gradient-hero'
  | '--gradient-card'
  | '--gradient-accent'
  | '--gradient-mesh';

/**
 * Wojak.ink Theme Context
 *
 * Enterprise-grade theme management with:
 * - localStorage persistence
 * - Cross-tab synchronization
 * - System preference detection
 * - Smooth transition handling
 * - Reduced motion support
 */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import type { ThemeContextValue, ThemeId, ThemeProviderProps } from '@/types/theme';
import { getTheme, getNextTheme, isValidThemeId } from '@/config/themes';

const STORAGE_KEY = 'wojak-theme';
const TRANSITION_DURATION = 300;

// Create context with undefined default (will be provided by provider)
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Detect system color scheme preference
 */
function getSystemPreference(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get initial theme from storage or default
 */
function getInitialTheme(defaultTheme: ThemeId): ThemeId {
  if (typeof window === 'undefined') return defaultTheme;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidThemeId(stored)) {
      return stored;
    }
  } catch {
    // localStorage may be unavailable
  }

  // Always fall back to defaultTheme (tang-orange)
  return defaultTheme;
}

/**
 * Apply theme to DOM
 */
function applyThemeToDOM(themeId: ThemeId, enableTransition: boolean): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;
  const theme = getTheme(themeId);

  // Add transition class if enabled and not reduced motion
  if (enableTransition && !prefersReducedMotion()) {
    root.classList.add('theme-transitioning');
    body.classList.add('theme-transitioning');
  }

  // Apply theme attributes
  root.setAttribute('data-theme', themeId);
  body.className = body.className
    .replace(/theme-\w+/g, '')
    .trim() + ` theme-${themeId}`;

  // Set color-scheme for native elements
  root.style.colorScheme = theme.isDark ? 'dark' : 'light';

  // Remove transition class after animation completes
  if (enableTransition && !prefersReducedMotion()) {
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
      body.classList.remove('theme-transitioning');
    }, TRANSITION_DURATION);
  }
}

/**
 * ThemeProvider Component
 *
 * Wraps the application and provides theme context to all children.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = STORAGE_KEY,
  syncWithSystem = false,
}: ThemeProviderProps) {
  const [themeId, setThemeId] = useState<ThemeId>(() => getInitialTheme(defaultTheme));
  const [systemPreference, setSystemPreference] = useState<'dark' | 'light'>(() =>
    getSystemPreference()
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isInitialMount = useRef(true);

  // Get current theme config
  const theme = useMemo(() => getTheme(themeId), [themeId]);

  // Apply theme to DOM on mount and changes
  useEffect(() => {
    const enableTransition = !isInitialMount.current;
    applyThemeToDOM(themeId, enableTransition);

    if (enableTransition) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
      return () => clearTimeout(timer);
    }

    isInitialMount.current = false;
  }, [themeId]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, themeId);
    } catch {
      // localStorage may be unavailable
    }
  }, [themeId, storageKey]);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === storageKey && e.newValue && isValidThemeId(e.newValue)) {
        setThemeId(e.newValue);
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function handleChange(e: MediaQueryListEvent) {
      const newPref = e.matches ? 'dark' : 'light';
      setSystemPreference(newPref);

      if (syncWithSystem) {
        setThemeId(newPref === 'dark' ? 'dark' : 'light');
      }
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [syncWithSystem]);

  // Set theme handler
  const setTheme = useCallback((id: ThemeId) => {
    if (isValidThemeId(id)) {
      setThemeId(id);
    }
  }, []);

  // Toggle between themes (cycles through all 4)
  const toggleTheme = useCallback(() => {
    setThemeId((current) => getNextTheme(current));
  }, []);

  // Context value
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themeId,
      setTheme,
      toggleTheme,
      isDark: theme.isDark,
      systemPreference,
      isTransitioning,
    }),
    [theme, themeId, setTheme, toggleTheme, systemPreference, isTransitioning]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;

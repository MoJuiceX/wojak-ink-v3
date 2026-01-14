/**
 * ThemeSwitcher Component
 *
 * Accessible theme selection with keyboard navigation,
 * animated transitions, and live theme announcements.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { themeOrder, themes } from '@/config/themes';

interface ThemeSwitcherProps {
  /** Display variant */
  variant?: 'dropdown' | 'segmented' | 'icon-only';
  /** Additional CSS classes */
  className?: string;
}

export function ThemeSwitcher({
  variant = 'dropdown',
  className = '',
}: ThemeSwitcherProps) {
  const { theme, themeId, setTheme, isTransitioning } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconControls = useAnimation();
  const prevVariantRef = useRef(variant);

  // Wiggle animation when sidebar variant changes (expand/collapse)
  useEffect(() => {
    if (prevVariantRef.current !== variant) {
      iconControls.start({
        rotate: [0, -20, 18, -15, 12, -8, 5, -3, 0],
        transition: { duration: 0.6, ease: 'easeInOut' }
      });
    }
    prevVariantRef.current = variant;
  }, [variant, iconControls]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (variant === 'dropdown') {
        switch (event.key) {
          case 'Enter':
          case ' ':
            event.preventDefault();
            setIsOpen((prev) => !prev);
            break;
          case 'Escape':
            setIsOpen(false);
            buttonRef.current?.focus();
            break;
          case 'ArrowDown':
            event.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
            } else {
              const currentIndex = themeOrder.indexOf(themeId);
              const nextIndex = (currentIndex + 1) % themeOrder.length;
              setTheme(themeOrder[nextIndex]);
            }
            break;
          case 'ArrowUp':
            event.preventDefault();
            if (isOpen) {
              const currentIndex = themeOrder.indexOf(themeId);
              const prevIndex = (currentIndex - 1 + themeOrder.length) % themeOrder.length;
              setTheme(themeOrder[prevIndex]);
            }
            break;
        }
      } else if (variant === 'segmented') {
        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            event.preventDefault();
            const nextIndex = (themeOrder.indexOf(themeId) + 1) % themeOrder.length;
            setTheme(themeOrder[nextIndex]);
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            event.preventDefault();
            const prevIndex = (themeOrder.indexOf(themeId) - 1 + themeOrder.length) % themeOrder.length;
            setTheme(themeOrder[prevIndex]);
            break;
        }
      }
    },
    [variant, isOpen, themeId, setTheme]
  );

  if (variant === 'icon-only') {
    return (
      <motion.button
        onClick={() => {
          const nextIndex = (themeOrder.indexOf(themeId) + 1) % themeOrder.length;
          setTheme(themeOrder[nextIndex]);
        }}
        whileTap={{ scale: 0.95 }}
        className={`
          p-3 rounded-xl glass-card hover-glow smooth-transition focus-ring
          ${className}
        `}
        aria-label={`Current theme: ${theme.name}. Click to switch theme.`}
        title={`Theme: ${theme.name}`}
      >
        <motion.span
          className="text-2xl block"
          animate={iconControls}
        >
          {theme.icon}
        </motion.span>
      </motion.button>
    );
  }

  if (variant === 'segmented') {
    return (
      <div
        className={`flex justify-between p-1 glass-card rounded-2xl ${className}`}
        role="radiogroup"
        aria-label="Theme selection"
        onKeyDown={handleKeyDown}
      >
        {themeOrder.map((id, index) => {
          const t = themes[id];
          const isActive = id === themeId;

          return (
            <motion.button
              key={id}
              onClick={() => setTheme(id)}
              whileTap={{ scale: 0.95 }}
              className={`
                relative p-2 rounded-xl smooth-transition-fast focus-ring
                ${isActive ? 'text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}
              `}
              role="radio"
              aria-checked={isActive}
              aria-label={t.name}
              tabIndex={isActive ? 0 : -1}
            >
              {isActive && (
                <motion.div
                  layoutId="activeThemeBg"
                  className="absolute inset-0 gradient-accent rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <motion.span
                className="relative z-10 flex items-center justify-center text-lg"
                animate={iconControls}
                transition={{ delay: index * 0.05 }}
              >
                {t.icon}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Default: Dropdown variant
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl glass-card
          hover:bg-[var(--color-glass-hover)] smooth-transition focus-ring
          ${isOpen ? 'glow-border' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Theme: ${theme.name}`}
      >
        <motion.span
          key={themeId}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xl"
        >
          {theme.icon}
        </motion.span>
        <span className="text-[var(--color-text-primary)] font-medium">{theme.name}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-[var(--color-text-muted)] ml-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="
              absolute top-full left-0 right-0 mt-2 py-2
              glass-card-strong rounded-xl overflow-hidden z-50
            "
            role="listbox"
            aria-label="Available themes"
            onKeyDown={handleKeyDown}
          >
            {themeOrder.map((id) => {
              const t = themes[id];
              const isActive = id === themeId;

              return (
                <motion.li
                  key={id}
                  whileHover={{ backgroundColor: 'var(--color-glass-hover)' }}
                  className="relative"
                >
                  <button
                    onClick={() => {
                      setTheme(id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left smooth-transition-fast
                      ${isActive ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-text-primary)]'}
                    `}
                    role="option"
                    aria-selected={isActive}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{t.description}</p>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)]"
                      />
                    )}
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Screen reader announcement for theme changes */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isTransitioning && `Theme changed to ${theme.name}`}
      </div>
    </div>
  );
}

export default ThemeSwitcher;

/**
 * MobileNavigation Component
 *
 * Bottom tab bar navigation for mobile devices.
 * Height: 72px + safe area inset.
 * Features animated underline indicator.
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LAYOUT } from '@/config/layout';
import { NAV_ITEMS, isPathActive } from '@/config/routes';
import { mobileNavTransition } from '@/config/animations';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useHaptic } from '@/hooks/useHaptic';
import { NavItem } from './NavItem';

interface MobileNavigationProps {
  visible?: boolean;
}

export function MobileNavigation({ visible = true }: MobileNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const haptic = useHaptic();

  const activeIndex = useMemo(() => {
    return NAV_ITEMS.findIndex((item) =>
      isPathActive(item.path, location.pathname)
    );
  }, [location.pathname]);

  const handleNavigate = useCallback(
    (path: string) => {
      haptic.tap();
      navigate(path);
    },
    [navigate, haptic]
  );

  if (!visible) {
    return null;
  }

  const navHeight = 60; // Reduced from 72px

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
      style={{
        paddingBottom: LAYOUT.mobileNav.safeAreaBottom,
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid var(--color-border)',
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ duration: 0.2 }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Active underline indicator */}
      {activeIndex >= 0 && (
        <motion.div
          className="absolute top-0"
          style={{
            width: `${100 / NAV_ITEMS.length}%`,
            height: 2,
            background: 'var(--color-brand-primary)',
            boxShadow: 'var(--glow-subtle)',
          }}
          animate={{
            left: `${(activeIndex / NAV_ITEMS.length) * 100}%`,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : mobileNavTransition.underline
          }
        >
          {/* Centered line within the tab */}
          <div
            className="absolute left-1/2 top-0 h-full"
            style={{
              width: 24,
              transform: 'translateX(-50%)',
              background: 'var(--color-brand-primary)',
              boxShadow: 'var(--glow-subtle)',
              borderRadius: '0 0 2px 2px',
            }}
          />
        </motion.div>
      )}

      {/* Tab items - fixed height container for proper centering */}
      <div
        className="flex items-center justify-around"
        style={{ height: navHeight }}
        role="tablist"
        aria-label="Navigation tabs"
      >
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            shortLabel={item.shortLabel}
            isActive={isPathActive(item.path, location.pathname)}
            onClick={() => handleNavigate(item.path)}
            badge={item.badge}
            disabled={item.disabled}
            variant="mobile"
            path={item.path}
          />
        ))}
      </div>
    </motion.nav>
  );
}

export default MobileNavigation;

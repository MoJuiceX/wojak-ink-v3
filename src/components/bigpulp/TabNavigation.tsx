/**
 * TabNavigation Component
 *
 * Tab navigation for the right panel with animated indicator.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, HelpCircle, List } from 'lucide-react';
import type { BigPulpTab } from '@/types/bigpulp';
import { TAB_TRANSITION } from '@/config/bigpulpAnimations';
import { useHaptic } from '@/hooks/useHaptic';

interface TabNavigationProps {
  activeTab: BigPulpTab;
  onTabChange: (tab: BigPulpTab) => void;
}

interface TabConfig {
  id: BigPulpTab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: 'market', label: 'Market', icon: BarChart3 },
  { id: 'ask', label: 'askBigPulp', icon: HelpCircle },
  { id: 'attributes', label: 'Attributes', icon: List },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const prefersReducedMotion = useReducedMotion();
  const haptic = useHaptic();
  const tabsRef = useRef<Map<BigPulpTab, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update indicator position
  useEffect(() => {
    const activeElement = tabsRef.current.get(activeTab);
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowLeft':
          newIndex = currentIndex > 0 ? currentIndex - 1 : TABS.length - 1;
          break;
        case 'ArrowRight':
          newIndex = currentIndex < TABS.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = TABS.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      haptic.selection();
      const newTab = TABS[newIndex];
      onTabChange(newTab.id);
      tabsRef.current.get(newTab.id)?.focus();
    },
    [onTabChange, haptic]
  );

  return (
    <div
      className="relative"
      role="tablist"
      aria-label="Analysis sections"
    >
      {/* Tab buttons */}
      <div className="flex">
        {TABS.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabsRef.current.set(tab.id, el);
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: isActive
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-text-muted)',
              }}
              onClick={() => {
                haptic.tap();
                onTabChange(tab.id);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active indicator */}
      <motion.div
        className="absolute bottom-0 h-0.5 rounded-full"
        style={{
          background: 'var(--color-brand-primary)',
          boxShadow: '0 0 8px var(--color-brand-glow)',
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={prefersReducedMotion ? { duration: 0 } : TAB_TRANSITION}
      />

      {/* Bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'var(--color-border)' }}
      />
    </div>
  );
}

export default TabNavigation;

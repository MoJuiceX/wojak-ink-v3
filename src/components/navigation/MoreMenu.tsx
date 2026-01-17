/**
 * More Menu Component
 *
 * Slide-up sheet for secondary navigation items on mobile.
 */

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  ShoppingBag,
  Users,
  Briefcase,
  Settings,
  User,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  description: string;
  route: string;
}

const menuItems: MenuItem[] = [
  {
    icon: Trophy,
    label: 'Leaderboard',
    description: 'View rankings and compete',
    route: '/leaderboard',
  },
  {
    icon: ShoppingBag,
    label: 'Shop',
    description: 'Spend your oranges and gems',
    route: '/shop',
  },
  {
    icon: Users,
    label: 'Guild',
    description: 'Join or create a guild',
    route: '/guild',
  },
  {
    icon: Briefcase,
    label: 'Treasury',
    description: 'Community wallet',
    route: '/treasury',
  },
  {
    icon: Settings,
    label: 'Settings',
    description: 'Theme, audio, and more',
    route: '/settings',
  },
  {
    icon: User,
    label: 'Account',
    description: 'Your profile',
    route: '/account',
  },
];

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MoreMenu({ isOpen, onClose }: MoreMenuProps) {
  const navigate = useNavigate();

  const handleItemClick = (route: string) => {
    navigate(route);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9998]"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-3xl"
            style={{
              background: 'var(--color-bg-elevated)',
              borderTop: '1px solid var(--color-border-default)',
              paddingBottom: 'env(safe-area-inset-bottom, 32px)',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-3">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'var(--color-text-muted, rgba(0, 0, 0, 0.3))' }}
              />
            </div>

            {/* Menu items */}
            <nav className="px-4 pb-6 flex flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.route}
                    type="button"
                    className="flex items-center gap-4 p-4 rounded-xl w-full text-left transition-colors"
                    style={{
                      background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                    onClick={() => handleItemClick(item.route)}
                  >
                    {/* Icon */}
                    <div
                      className="w-11 h-11 flex items-center justify-center rounded-xl"
                      style={{
                        background: 'rgba(255, 107, 0, 0.15)',
                      }}
                    >
                      <Icon
                        size={22}
                        style={{ color: 'var(--color-brand-primary)' }}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 flex flex-col gap-0.5">
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {item.description}
                      </span>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={18}
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  </button>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MoreMenu;

/**
 * Empty State Component
 *
 * Displays helpful message when content is empty.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeInUpVariants } from '@/config/hoverEffects';

interface EmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();

  const renderActionButton = () => {
    if (!action) return null;

    const buttonClass = `
      px-4 py-2 rounded-lg text-sm font-medium transition-colors
      ${
        action.variant === 'secondary'
          ? 'bg-[var(--color-glass-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)]'
          : 'bg-[var(--color-brand-primary)] text-white'
      }
    `;

    if (action.href) {
      return (
        <Link to={action.href} onClick={action.onClick} className={buttonClass}>
          {action.label}
        </Link>
      );
    }

    return (
      <button type="button" onClick={action.onClick} className={buttonClass}>
        {action.label}
      </button>
    );
  };

  const renderSecondaryButton = () => {
    if (!secondaryAction) return null;

    const buttonStyle = { color: 'var(--color-text-secondary)' };
    const buttonClass = 'px-4 py-2 text-sm font-medium transition-colors';

    if (secondaryAction.href) {
      return (
        <Link
          to={secondaryAction.href}
          onClick={secondaryAction.onClick}
          className={buttonClass}
          style={buttonStyle}
        >
          {secondaryAction.label}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={secondaryAction.onClick}
        className={buttonClass}
        style={buttonStyle}
      >
        {secondaryAction.label}
      </button>
    );
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      variants={prefersReducedMotion ? undefined : fadeInUpVariants}
      initial="initial"
      animate="animate"
    >
      {illustration && (
        <div className="text-5xl mb-4" aria-hidden="true">
          {illustration}
        </div>
      )}

      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>

      <p
        className="text-sm max-w-sm mb-6"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {renderActionButton()}
          {renderSecondaryButton()}
        </div>
      )}
    </motion.div>
  );
}

// Preset empty states
export const EMPTY_STATES = {
  noFavorites: {
    illustration: '💛',
    title: 'No favorites yet',
    description: 'Start exploring and save your favorite Wojaks!',
    action: {
      label: 'Explore Collection',
      href: '/gallery',
    },
  },
  noSearchResults: {
    illustration: '🔍',
    title: 'No results found',
    description: 'Try adjusting your search or filters',
  },
  noListings: {
    illustration: '📦',
    title: 'Nothing listed yet',
    description: 'Be the first to list your Wojak!',
  },
  noWallet: {
    illustration: '👛',
    title: 'Connect your wallet',
    description: 'Connect a Chia wallet to view your NFTs',
  },
  noNFTs: {
    illustration: '🖼️',
    title: 'No NFTs found',
    description: "You don't have any Wojak Farmers Plot NFTs yet",
  },
  offline: {
    illustration: '📡',
    title: "You're offline",
    description: 'Check your internet connection and try again',
  },
} as const;

export default EmptyState;

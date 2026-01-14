/**
 * UserAccountButton Component
 *
 * Shows sign-in button when signed out, user menu when signed in.
 * Uses Clerk for authentication (Google sign-in).
 */

import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/clerk-react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

// Check if Clerk is configured
const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface UserAccountButtonProps {
  showLabel?: boolean;
}

// Inner component that uses Clerk hooks (only rendered when Clerk is available)
function ClerkUserButton({ showLabel }: { showLabel: boolean }) {
  const auth = useAuth();
  const isClerkLoaded = auth.isLoaded;

  // If Clerk isn't loaded yet, show loading state
  if (!isClerkLoaded) {
    return (
      <div
        className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-50"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <User size={20} />
        {showLabel && <span className="text-sm">Loading...</span>}
      </div>
    );
  }

  return (
    <>
      {/* Signed Out: Show sign-in button */}
      <SignedOut>
        <SignInButton mode="modal">
          <motion.button
            className="flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors"
            style={{
              color: 'var(--color-text-secondary)',
            }}
            whileHover={{
              background: 'var(--color-glass-hover)',
              color: 'var(--color-text-primary)',
            }}
            whileTap={{ scale: 0.98 }}
            title="Sign in with Google"
          >
            <User size={20} />
            {showLabel && <span className="text-sm font-medium">Sign In</span>}
          </motion.button>
        </SignInButton>
      </SignedOut>

      {/* Signed In: Show user button */}
      <SignedIn>
        <div
          className="flex items-center gap-3 px-3 py-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
                userButtonPopoverCard: 'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                userButtonPopoverActions: 'bg-[var(--color-bg-secondary)]',
                userButtonPopoverActionButton: 'text-[var(--color-text-primary)] hover:bg-[var(--color-glass-hover)]',
                userButtonPopoverFooter: 'hidden',
              },
            }}
            afterSignOutUrl="/"
          />
          {showLabel && (
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Account
            </span>
          )}
        </div>
      </SignedIn>
    </>
  );
}

export function UserAccountButton({ showLabel = false }: UserAccountButtonProps) {
  // If Clerk isn't configured, show disabled placeholder
  if (!CLERK_ENABLED) {
    return (
      <div
        className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-50 cursor-not-allowed"
        style={{ color: 'var(--color-text-muted)' }}
        title="Auth not configured"
      >
        <User size={20} />
        {showLabel && <span className="text-sm">Sign In</span>}
      </div>
    );
  }

  return <ClerkUserButton showLabel={showLabel} />;
}

export default UserAccountButton;

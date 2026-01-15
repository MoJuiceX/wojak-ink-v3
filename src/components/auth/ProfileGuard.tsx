/**
 * ProfileGuard Component
 *
 * Redirects authenticated users to onboarding if they haven't completed their profile.
 * Uses UserProfileContext for state management.
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserProfileOptional } from '@/contexts/UserProfileContext';

// Check if Clerk is configured
const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface ProfileGuardProps {
  children?: React.ReactNode;
}

export function ProfileGuard({ children }: ProfileGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const userProfile = useUserProfileOptional();

  useEffect(() => {
    // Skip if Clerk not configured or context not available
    if (!CLERK_ENABLED || !userProfile) return;

    // Skip if not signed in or still loading
    if (!userProfile.isSignedIn || !userProfile.isLoaded) return;

    // Don't redirect if already on onboarding page
    if (location.pathname === '/onboarding') return;

    // Redirect to onboarding if profile is incomplete
    if (userProfile.needsOnboarding) {
      console.log('[ProfileGuard] User needs onboarding, redirecting...');
      navigate('/onboarding', { replace: true });
    }
  }, [
    userProfile?.isSignedIn,
    userProfile?.isLoaded,
    userProfile?.needsOnboarding,
    location.pathname,
    navigate,
  ]);

  return <>{children}</>;
}

export default ProfileGuard;

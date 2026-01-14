/**
 * useProfileCheck Hook
 *
 * Checks if the authenticated user has completed their profile.
 * Redirects to onboarding if profile is missing xHandle.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';

// Check if Clerk is configured
const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface ProfileData {
  displayName: string | null;
  xHandle: string | null;
  updatedAt: string;
}

interface UseProfileCheckResult {
  isLoading: boolean;
  profile: ProfileData | null;
  needsOnboarding: boolean;
  refetch: () => Promise<void>;
}

export function useProfileCheck(): UseProfileCheckResult {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = CLERK_ENABLED ? useAuth() : { isSignedIn: false, isLoaded: true };
  const { authenticatedFetch } = useAuthenticatedFetch();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!CLERK_ENABLED || !isSignedIn) {
      setIsLoading(false);
      setNeedsOnboarding(false);
      return;
    }

    try {
      const response = await authenticatedFetch('/api/profile');

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);

        // Check if profile is missing xHandle
        const missingXHandle = !data.profile?.xHandle;
        setNeedsOnboarding(missingXHandle);

        // Redirect to onboarding if needed (and not already there)
        if (missingXHandle && location.pathname !== '/onboarding') {
          navigate('/onboarding', { replace: true });
        }
      }
    } catch (error) {
      console.error('[ProfileCheck] Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, authenticatedFetch, location.pathname, navigate]);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      fetchProfile();
    } else {
      setIsLoading(false);
      setProfile(null);
      setNeedsOnboarding(false);
    }
  }, [isLoaded, isSignedIn, fetchProfile]);

  return {
    isLoading,
    profile,
    needsOnboarding,
    refetch: fetchProfile,
  };
}

export default useProfileCheck;

/**
 * ProfileGuard Component
 *
 * Silently checks if authenticated user needs to complete onboarding.
 * Renders children immediately while checking in background.
 */

import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

// Check if Clerk is configured
const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface ProfileGuardProps {
  children?: React.ReactNode;
}

function ClerkProfileGuard({ children }: ProfileGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const checkedRef = useRef(false);

  useEffect(() => {
    // Only check once per session, and only when signed in
    if (!isLoaded || !isSignedIn || checkedRef.current) return;

    // Don't check if already on onboarding page
    if (location.pathname === '/onboarding') {
      checkedRef.current = true;
      return;
    }

    const checkProfile = async () => {
      try {
        const response = await authenticatedFetch('/api/profile');

        if (response.ok) {
          const data = await response.json();

          // Redirect to onboarding if missing xHandle
          if (!data.profile?.xHandle) {
            navigate('/onboarding', { replace: true });
          }
        }
      } catch (error) {
        console.error('[ProfileGuard] Error checking profile:', error);
      } finally {
        checkedRef.current = true;
      }
    };

    checkProfile();
  }, [isLoaded, isSignedIn, location.pathname, authenticatedFetch, navigate]);

  return <>{children}</>;
}

export function ProfileGuard({ children }: ProfileGuardProps) {
  // If Clerk is not configured, render children directly
  if (!CLERK_ENABLED) {
    return <>{children}</>;
  }

  return <ClerkProfileGuard>{children}</ClerkProfileGuard>;
}

export default ProfileGuard;

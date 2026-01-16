/**
 * UserProfileContext
 *
 * Manages authenticated user profile state across the app.
 * Fetches profile on sign-in, provides update methods, tracks messages.
 */

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

// Check if Clerk is configured
const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export interface UserProfile {
  displayName: string | null;
  xHandle: string | null;
  walletAddress: string | null;
  updatedAt: string | null;
  // Streak tracking
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
}

export interface UserMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}

interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isLoaded: boolean;
  needsOnboarding: boolean;
  unreadMessages: number;
  error: string | null;
}

interface UserProfileContextValue extends UserProfileState {
  // Profile methods
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;

  // Clerk user info
  clerkUser: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string | null;
  } | null;

  // Auth state
  isSignedIn: boolean;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded: authLoaded } = CLERK_ENABLED ? useAuth() : { isSignedIn: false, isLoaded: true };
  const { user } = CLERK_ENABLED ? useUser() : { user: null };
  const { authenticatedFetch } = useAuthenticatedFetch();

  const [state, setState] = useState<UserProfileState>({
    profile: null,
    isLoading: false,
    isLoaded: false,
    needsOnboarding: false,
    unreadMessages: 0,
    error: null,
  });

  const fetchedRef = useRef(false);
  const previousSignedIn = useRef<boolean | null>(null);

  // Fetch profile from API
  const fetchProfile = useCallback(async () => {
    if (!isSignedIn) return;

    setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      const response = await authenticatedFetch('/api/profile');

      if (response.ok) {
        const data = await response.json();
        // Map API response to UserProfile, ensuring streak defaults
        const apiProfile = data.profile;
        const profile: UserProfile | null = apiProfile ? {
          displayName: apiProfile.displayName,
          xHandle: apiProfile.xHandle,
          walletAddress: apiProfile.walletAddress,
          updatedAt: apiProfile.updatedAt,
          currentStreak: apiProfile.currentStreak || 0,
          longestStreak: apiProfile.longestStreak || 0,
          lastPlayedDate: apiProfile.lastPlayedDate || null,
        } : null;
        const needsOnboarding = !profile?.displayName;

        console.log('[UserProfile] Profile loaded:', {
          hasProfile: !!profile,
          displayName: profile?.displayName,
          needsOnboarding,
        });

        setState(s => ({
          ...s,
          profile,
          isLoading: false,
          isLoaded: true,
          needsOnboarding,
          error: null,
        }));
      } else {
        // No profile found or error
        setState(s => ({
          ...s,
          profile: null,
          isLoading: false,
          isLoaded: true,
          needsOnboarding: true,
          error: null,
        }));
      }
    } catch (error) {
      console.error('[UserProfile] Error fetching profile:', error);
      setState(s => ({
        ...s,
        isLoading: false,
        isLoaded: true,
        error: 'Failed to load profile',
      }));
    }
  }, [isSignedIn, authenticatedFetch]);

  // Fetch unread messages count
  const fetchUnreadCount = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      const response = await authenticatedFetch('/api/messages/unread-count');

      if (response.ok) {
        const data = await response.json();
        setState(s => ({ ...s, unreadMessages: data.count || 0 }));
      }
    } catch (error) {
      console.error('[UserProfile] Error fetching unread count:', error);
    }
  }, [isSignedIn, authenticatedFetch]);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    await fetchProfile();
    await fetchUnreadCount();
  }, [fetchProfile, fetchUnreadCount]);

  // Update profile
  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!isSignedIn) return false;

    try {
      const response = await authenticatedFetch('/api/profile', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setState(s => ({
          ...s,
          profile: result.profile,
          needsOnboarding: !result.profile?.displayName,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('[UserProfile] Error updating profile:', error);
      return false;
    }
  }, [isSignedIn, authenticatedFetch]);

  // Store refreshProfile in a ref to avoid dependency issues
  const refreshProfileRef = useRef(refreshProfile);
  refreshProfileRef.current = refreshProfile;

  // Fetch profile when user signs in
  useEffect(() => {
    if (!authLoaded) return;

    // Detect sign-in state change
    const signedInChanged = previousSignedIn.current !== null && previousSignedIn.current !== isSignedIn;
    previousSignedIn.current = isSignedIn;

    // Reset state on sign-out
    if (!isSignedIn) {
      fetchedRef.current = false;
      setState({
        profile: null,
        isLoading: false,
        isLoaded: true,
        needsOnboarding: false,
        unreadMessages: 0,
        error: null,
      });
      return;
    }

    // Fetch profile on sign-in (or if we just signed in)
    if (isSignedIn && (!fetchedRef.current || signedInChanged)) {
      fetchedRef.current = true;
      refreshProfileRef.current();
    }
  }, [authLoaded, isSignedIn]);

  // Clerk user info
  const clerkUser = user ? {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.primaryEmailAddress?.emailAddress || null,
    imageUrl: user.imageUrl,
  } : null;

  const value: UserProfileContextValue = {
    ...state,
    refreshProfile,
    updateProfile,
    clerkUser,
    isSignedIn: isSignedIn ?? false,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}

// Optional hook that returns null if not in provider (for optional use)
export function useUserProfileOptional() {
  return useContext(UserProfileContext);
}

export default UserProfileContext;

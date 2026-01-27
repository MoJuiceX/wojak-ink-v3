/**
 * useAuthenticatedFetch Hook
 *
 * Provides a fetch function that automatically includes the Clerk auth token.
 * Use this for API calls that require authentication.
 */

import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

// Check if Clerk is configured
const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function useAuthenticatedFetch() {
  // Only call Clerk hook if ClerkProvider exists (CLERK_ENABLED is compile-time constant)
  const authResult = CLERK_ENABLED
    ? useAuth()
    : { getToken: () => Promise.resolve(null), isSignedIn: false, isLoaded: true };

  // Use the auth result directly
  const auth = authResult;

  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      // Get the token from Clerk
      const token = await auth.getToken();

      // Merge headers
      const headers = new Headers(options.headers);

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      headers.set('Content-Type', 'application/json');

      return fetch(url, {
        ...options,
        headers,
      });
    },
    [auth]
  );

  return {
    authenticatedFetch,
    isSignedIn: auth.isSignedIn,
    isLoaded: auth.isLoaded, // Whether Clerk has finished initializing
  };
}

export default useAuthenticatedFetch;

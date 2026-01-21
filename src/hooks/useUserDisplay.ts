/**
 * useUserDisplay Hook
 *
 * Fetches and caches user cosmetic display data for rendering
 * emoji rings, frames, name effects, etc.
 */

import { useQuery } from '@tanstack/react-query';

export interface UserDisplay {
  userId: string;
  username: string;
  emojiRing: Record<string, string>;
  frame: {
    id: string;
    css: string;
    name: string;
  } | null;
  title: {
    id: string;
    name: string;
  } | null;
  nameEffect: {
    id: string;
    css: string;
    name: string;
  } | null;
  background: {
    id: string;
    css: string;
    name: string;
  } | null;
  celebration: {
    id: string;
    css: string;
    name: string;
  } | null;
  bigpulp: {
    hat: string | null;
    mood: string;
    accessory: string | null;
  };
}

async function fetchUserDisplay(userId: string): Promise<UserDisplay> {
  const res = await fetch(`/api/shop/display?userId=${userId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch user display');
  }
  return res.json();
}

/**
 * Hook to fetch user display cosmetics
 * @param userId - The user ID to fetch display for
 * @param enabled - Whether to enable the query
 */
export function useUserDisplay(userId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ['userDisplay', userId],
    queryFn: () => fetchUserDisplay(userId!),
    enabled: !!userId && enabled,
    staleTime: 60 * 1000, // Cache for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

/**
 * Hook to batch fetch multiple user displays
 * Useful for leaderboards where we need many users' cosmetics
 */
export function useUserDisplays(userIds: string[]) {
  return useQuery({
    queryKey: ['userDisplays', userIds.sort().join(',')],
    queryFn: async () => {
      const displays = await Promise.all(
        userIds.map(id => fetchUserDisplay(id).catch(() => null))
      );
      const map = new Map<string, UserDisplay>();
      displays.forEach((display, index) => {
        if (display) {
          map.set(userIds[index], display);
        }
      });
      return map;
    },
    enabled: userIds.length > 0,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export default useUserDisplay;

/**
 * Hook for flick voting with backend integration
 *
 * Uses generic targetId and pageType to support voting on any page:
 * - Games page: pageType='games', targetId=gameId
 * - Gallery page: pageType='gallery', targetId=nftId
 * - Media page: pageType='media', targetId=mediaId
 */

import { useState, useCallback, useEffect } from 'react';

// Page types for voting - extend this as you add more pages
export type VotePageType = 'games' | 'gallery' | 'media' | 'shop';

interface VotePosition {
  id: string;
  xPercent: number;
  yPercent: number;
  targetId: string;
  emoji: 'donut' | 'poop';
  createdAt: number;
}

interface VoteCounts {
  donuts: number;
  poops: number;
}

interface VoteStore {
  [targetId: string]: VoteCounts;
}

const API_BASE = '/api/votes';

export function useFlickVoting(pageType: VotePageType) {
  const [activeMode, setActiveMode] = useState<'donut' | 'poop' | null>(null);
  const [votes, setVotes] = useState<VoteStore>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load vote counts on mount
  useEffect(() => {
    fetchVoteCounts();
  }, [pageType]);

  const fetchVoteCounts = async () => {
    try {
      const response = await fetch(`${API_BASE}/counts?pageType=${pageType}`);
      if (response.ok) {
        const data = await response.json();
        setVotes(data.counts || {});
      }
    } catch (error) {
      console.error('Failed to fetch vote counts:', error);
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(`wojak_votes_${pageType}`);
        if (stored) setVotes(JSON.parse(stored));
      } catch {
        // Ignore localStorage errors
      }
    }
  };

  const getVotes = useCallback((targetId: string): VoteCounts => {
    return votes[targetId] || { donuts: 0, poops: 0 };
  }, [votes]);

  // Add a vote with position data
  const addVote = useCallback(async (
    targetId: string,
    type: 'donut' | 'poop',
    xPercent: number,
    yPercent: number
  ) => {
    // Optimistic update
    setVotes(prev => {
      const current = prev[targetId] || { donuts: 0, poops: 0 };
      return {
        ...prev,
        [targetId]: {
          ...current,
          [type === 'donut' ? 'donuts' : 'poops']:
            current[type === 'donut' ? 'donuts' : 'poops'] + 1,
        },
      };
    });

    // Send to backend
    try {
      await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId,
          pageType,
          emoji: type,
          xPercent: Math.round(xPercent * 100) / 100,
          yPercent: Math.round(yPercent * 100) / 100,
        }),
      });
    } catch (error) {
      console.error('Failed to save vote:', error);
      // Store in localStorage as backup
      try {
        const stored = localStorage.getItem('wojak_pending_votes') || '[]';
        const pending = JSON.parse(stored);
        pending.push({ targetId, pageType, emoji: type, xPercent, yPercent, timestamp: Date.now() });
        localStorage.setItem('wojak_pending_votes', JSON.stringify(pending));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [pageType]);

  // Fetch votes with positions for heatmap
  const fetchVotesForHeatmap = useCallback(async (
    type: 'donut' | 'poop'
  ): Promise<VotePosition[]> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/positions?pageType=${pageType}&emoji=${type}&limit=200`);
      if (response.ok) {
        const data = await response.json();
        return data.votes || [];
      }
    } catch (error) {
      console.error('Failed to fetch heatmap votes:', error);
    } finally {
      setIsLoading(false);
    }
    return [];
  }, [pageType]);

  return {
    activeMode,
    setActiveMode,
    getVotes,
    addVote,
    fetchVotesForHeatmap,
    isLoading,
  };
}

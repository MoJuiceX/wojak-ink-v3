/**
 * useTraitRankings Hook
 *
 * React hook for accessing trait ranking data.
 */

import { useState, useEffect } from 'react';
import {
  loadTraitRankings,
  getTraitRank,
  getTooltipData,
  isDataLoaded,
  type TraitRankInfo,
  type TooltipData,
} from '@/services/traitRankings';

export function useTraitRankings() {
  const [isLoaded, setIsLoaded] = useState(isDataLoaded());

  useEffect(() => {
    if (!isLoaded) {
      loadTraitRankings()
        .then(() => setIsLoaded(true))
        .catch((err) => console.error('Failed to load trait rankings:', err));
    }
  }, [isLoaded]);

  return {
    isLoaded,
    getTraitRank,
    getTooltipData,
  };
}

export type { TraitRankInfo, TooltipData };

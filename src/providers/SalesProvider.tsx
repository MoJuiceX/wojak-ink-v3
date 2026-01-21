/**
 * Sales Provider
 *
 * Initializes the sales databank from localStorage cache.
 * Auto-syncs every 4 hours using FREE Dexie direct API.
 * Falls back to Parse.bot (paid) only if Dexie is unavailable.
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { initializeSalesDatabank, getSalesCount, fixSuspiciousSales } from '@/services/salesDatabank';
import { syncDexieSales } from '@/services/dexieSalesService';

interface SalesProviderProps {
  children: React.ReactNode;
}

// Storage key for last sync timestamp
const LAST_SYNC_KEY = 'wojak_sales_last_sync';

// Auto-sync interval in hours (6 hours - uses FREE Dexie API with Parse.bot fallback)
const AUTO_SYNC_INTERVAL_HOURS = 6;

// Get hours since last sync
export function getHoursSinceLastSync(): number {
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  if (!lastSync) return Infinity;
  const hours = (Date.now() - parseInt(lastSync, 10)) / (1000 * 60 * 60);
  return hours;
}

// Mark sync as complete
export function markSyncComplete(): void {
  localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
}

export function SalesProvider({ children }: SalesProviderProps) {
  const hasInitialized = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Initialize databank from localStorage
    initializeSalesDatabank();
    const count = getSalesCount();
    const hoursSinceSync = getHoursSinceLastSync();

    console.log('[SalesProvider] Loaded', count, 'cached sales');

    // Fix any sales with incorrect token conversion rates (one-time migration)
    fixSuspiciousSales().then(fixed => {
      if (fixed > 0) {
        console.log('[SalesProvider] Fixed', fixed, 'sales with incorrect token rates');
      }
    });

    // Check if auto-sync is needed (more than 6 hours since last sync)
    if (hoursSinceSync >= AUTO_SYNC_INTERVAL_HOURS) {
      console.log('[SalesProvider] Last sync was', Math.round(hoursSinceSync), 'hours ago - starting daily sync...');

      // Delay sync to not block initial render
      const timer = setTimeout(async () => {
        console.log('[SalesProvider] Triggering sync now...');
        try {
          const result = await syncDexieSales();
          markSyncComplete();
          console.log('[SalesProvider] Daily sync complete:', result);
          console.log('[SalesProvider] Total sales now:', getSalesCount());

          // Fix any newly imported sales with incorrect token rates
          if (result.imported > 0) {
            const fixed = await fixSuspiciousSales();
            if (fixed > 0) {
              console.log('[SalesProvider] Fixed', fixed, 'newly imported sales');
            }
          }

          // Invalidate BigPulp queries so they refetch with new sales data
          console.log('[SalesProvider] Invalidating BigPulp queries to refresh with new data...');
          queryClient.invalidateQueries({ queryKey: ['bigpulp'] });
        } catch (error) {
          console.error('[SalesProvider] Daily sync failed:', error);
        }
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      console.log('[SalesProvider] Last sync:', Math.round(hoursSinceSync), 'hours ago - skipping (next sync in', Math.round(AUTO_SYNC_INTERVAL_HOURS - hoursSinceSync), 'hours)');
    }
  }, [queryClient]);

  return <>{children}</>;
}

export default SalesProvider;

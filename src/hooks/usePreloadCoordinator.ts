/**
 * Preload Coordinator Hooks
 *
 * React hooks for integrating with the site-wide preload coordinator.
 * Components use these hooks to register their clickable elements and
 * image requirements.
 */

import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  preloadCoordinator,
  type PageId,
  type PreloadTrigger,
  type PageImageRequirements,
} from '@/services/preloadCoordinator';
import type { PreloadPriority } from '@/services/imagePreloader';

// ============ Page Registration ============

/**
 * Hook to register the current page with the coordinator.
 * Call this in each page component.
 */
export function usePagePreload(pageId: PageId) {
  const location = useLocation();

  useEffect(() => {
    preloadCoordinator.setCurrentPage(pageId);
  }, [pageId, location.pathname]);
}

/**
 * Hook to register page image requirements.
 * Call this when page data loads.
 */
export function usePageImageRequirements(
  pageId: PageId,
  criticalImages: string[],
  actionImages?: Record<string, string[]>
) {
  useEffect(() => {
    const requirements: PageImageRequirements = {
      pageId,
      critical: criticalImages,
      actionImages: new Map(Object.entries(actionImages || {})),
    };

    preloadCoordinator.registerPageRequirements(requirements);
  }, [pageId, criticalImages, actionImages]);
}

/**
 * Hook to update action images dynamically (e.g., when filter changes)
 */
export function useUpdateActionImages(pageId: PageId) {
  return useCallback(
    (actionId: string, imageUrls: string[]) => {
      preloadCoordinator.updateActionImages(pageId, actionId, imageUrls);
    },
    [pageId]
  );
}

// ============ Trigger Registration ============

/**
 * Hook to register a clickable element that would load images.
 * Returns handlers to attach to the element.
 */
export function usePreloadTrigger(
  triggerId: string,
  imageUrls: string[],
  options: {
    type?: PreloadTrigger['type'];
    priority?: PreloadPriority;
    isVisible?: boolean;
  } = {}
) {
  const {
    type = 'button',
    priority = 'medium',
    isVisible = true,
  } = options;

  const cleanupRef = useRef<(() => void) | null>(null);

  // Register trigger on mount
  useEffect(() => {
    cleanupRef.current = preloadCoordinator.registerTrigger({
      id: triggerId,
      type,
      imageUrls,
      priority,
      isVisible,
    });

    return () => {
      cleanupRef.current?.();
    };
  }, [triggerId, type, priority, isVisible, imageUrls]);

  // Update images when they change
  useEffect(() => {
    preloadCoordinator.updateTriggerImages(triggerId, imageUrls);
  }, [triggerId, imageUrls]);

  // Update visibility when it changes
  useEffect(() => {
    preloadCoordinator.setTriggerVisibility(triggerId, isVisible);
  }, [triggerId, isVisible]);

  // Return hover handlers for priority boost
  const onMouseEnter = useCallback(() => {
    preloadCoordinator.onTriggerHover(triggerId);
  }, [triggerId]);

  return { onMouseEnter };
}

/**
 * Hook for registering multiple triggers at once (e.g., a list of cards)
 */
export function usePreloadTriggers(
  triggers: Array<{
    id: string;
    imageUrls: string[];
    isVisible?: boolean;
  }>,
  options: {
    type?: PreloadTrigger['type'];
    priority?: PreloadPriority;
  } = {}
) {
  const { type = 'card', priority = 'medium' } = options;

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    for (const trigger of triggers) {
      const cleanup = preloadCoordinator.registerTrigger({
        id: trigger.id,
        type,
        imageUrls: trigger.imageUrls,
        priority,
        isVisible: trigger.isVisible ?? true,
      });
      cleanups.push(cleanup);
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [triggers, type, priority]);

  // Return a function to create hover handler for specific trigger
  const getHoverHandler = useCallback((triggerId: string) => ({
    onMouseEnter: () => preloadCoordinator.onTriggerHover(triggerId),
  }), []);

  return { getHoverHandler };
}

// ============ Navigation Preloading ============

/**
 * Hook to handle navigation link hover preloading.
 * Use this on navigation items (sidebar, mobile nav).
 */
export function useNavigationPreload(path: string) {
  const onMouseEnter = useCallback(() => {
    preloadCoordinator.onNavigationHover(path);
  }, [path]);

  return { onMouseEnter };
}

// ============ Visibility Detection ============

/**
 * Hook to track element visibility with IntersectionObserver
 * and update trigger visibility accordingly.
 */
export function useVisibilityTracking(
  triggerId: string,
  elementRef: React.RefObject<HTMLElement | null>,
  options: {
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  const { rootMargin = '100px', threshold = 0 } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          preloadCoordinator.setTriggerVisibility(triggerId, entry.isIntersecting);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [triggerId, elementRef, rootMargin, threshold]);
}

// ============ Debug Hook ============

/**
 * Hook to get coordinator stats (for debugging)
 */
export function usePreloadStats() {
  return useMemo(() => preloadCoordinator.getStats(), []);
}

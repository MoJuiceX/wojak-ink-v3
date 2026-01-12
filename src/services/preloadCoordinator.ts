/**
 * Preload Coordinator Service
 *
 * Site-wide intelligent image preloading system that:
 * 1. Scans for all clickable UI elements that would trigger image loading
 * 2. Predicts which images will be needed based on user's possible actions
 * 3. Proactively preloads those images before the user clicks
 * 4. Works across all pages (Gallery, Treasury, BigPulp, Generator, Media, Settings)
 */

import { imagePreloader, type PreloadPriority } from './imagePreloader';

// ============ Types ============

export type PageId = 'gallery' | 'treasury' | 'bigpulp' | 'generator' | 'media' | 'settings';

export interface PreloadTrigger {
  id: string;
  type: 'button' | 'link' | 'card' | 'nav' | 'tab';
  imageUrls: string[];
  priority: PreloadPriority;
  isVisible: boolean;
}

export interface PageImageRequirements {
  pageId: PageId;
  // Images needed immediately when page loads
  critical: string[];
  // Images for possible user actions on this page
  actionImages: Map<string, string[]>;
}

interface CoordinatorState {
  currentPage: PageId | null;
  triggers: Map<string, PreloadTrigger>;
  pageRequirements: Map<PageId, PageImageRequirements>;
  navigationTargets: Map<string, PageId>;
}

type StateChangeCallback = (state: CoordinatorState) => void;

// ============ Coordinator ============

class PreloadCoordinatorService {
  private state: CoordinatorState = {
    currentPage: null,
    triggers: new Map(),
    pageRequirements: new Map(),
    navigationTargets: new Map(),
  };

  private listeners: Set<StateChangeCallback> = new Set();
  private scanDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isScanning = false;

  constructor() {
    // Initialize navigation targets (sidebar/bottom nav links)
    this.state.navigationTargets.set('/gallery', 'gallery');
    this.state.navigationTargets.set('/treasury', 'treasury');
    this.state.navigationTargets.set('/bigpulp', 'bigpulp');
    this.state.navigationTargets.set('/generator', 'generator');
    this.state.navigationTargets.set('/media', 'media');
    this.state.navigationTargets.set('/settings', 'settings');
  }

  // ============ Page Management ============

  /**
   * Set the current page and trigger preloading for that page
   */
  setCurrentPage(pageId: PageId): void {
    if (this.state.currentPage === pageId) return;

    this.state.currentPage = pageId;
    this.notifyListeners();

    // Preload for current page
    this.preloadForCurrentPage();

    // Preload for navigation targets (other pages user might click to)
    this.preloadForNavigation();
  }

  /**
   * Register image requirements for a page
   */
  registerPageRequirements(requirements: PageImageRequirements): void {
    this.state.pageRequirements.set(requirements.pageId, requirements);

    // If this is the current page, trigger preloading
    if (this.state.currentPage === requirements.pageId) {
      this.preloadForCurrentPage();
    }
  }

  /**
   * Update action images for current page (e.g., when data loads)
   */
  updateActionImages(pageId: PageId, actionId: string, imageUrls: string[]): void {
    const requirements = this.state.pageRequirements.get(pageId);
    if (requirements) {
      requirements.actionImages.set(actionId, imageUrls);

      // If current page, preload these action images
      if (this.state.currentPage === pageId) {
        imagePreloader.preloadBatch(imageUrls, 'medium');
      }
    }
  }

  // ============ Trigger Management ============

  /**
   * Register a clickable trigger that would load images
   */
  registerTrigger(trigger: PreloadTrigger): () => void {
    this.state.triggers.set(trigger.id, trigger);
    this.schedulePreloadScan();

    // Return cleanup function
    return () => {
      this.state.triggers.delete(trigger.id);
    };
  }

  /**
   * Update a trigger's visibility (e.g., when it scrolls into view)
   */
  setTriggerVisibility(triggerId: string, isVisible: boolean): void {
    const trigger = this.state.triggers.get(triggerId);
    if (trigger && trigger.isVisible !== isVisible) {
      trigger.isVisible = isVisible;
      if (isVisible) {
        this.schedulePreloadScan();
      }
    }
  }

  /**
   * Update trigger's image URLs (e.g., when data changes)
   */
  updateTriggerImages(triggerId: string, imageUrls: string[]): void {
    const trigger = this.state.triggers.get(triggerId);
    if (trigger) {
      trigger.imageUrls = imageUrls;
      if (trigger.isVisible) {
        this.schedulePreloadScan();
      }
    }
  }

  // ============ Preloading Logic ============

  /**
   * Schedule a preload scan (debounced to avoid excessive scanning)
   */
  private schedulePreloadScan(): void {
    if (this.scanDebounceTimer) {
      clearTimeout(this.scanDebounceTimer);
    }

    this.scanDebounceTimer = setTimeout(() => {
      this.performPreloadScan();
    }, 100);
  }

  /**
   * Scan all visible triggers and preload their images
   */
  private performPreloadScan(): void {
    if (this.isScanning) return;
    this.isScanning = true;

    try {
      // Collect images by priority
      const criticalImages: string[] = [];
      const highImages: string[] = [];
      const mediumImages: string[] = [];
      const lowImages: string[] = [];

      for (const trigger of this.state.triggers.values()) {
        if (!trigger.isVisible || trigger.imageUrls.length === 0) continue;

        switch (trigger.priority) {
          case 'critical':
            criticalImages.push(...trigger.imageUrls);
            break;
          case 'high':
            highImages.push(...trigger.imageUrls);
            break;
          case 'medium':
            mediumImages.push(...trigger.imageUrls);
            break;
          case 'low':
            lowImages.push(...trigger.imageUrls);
            break;
        }
      }

      // Preload in priority order
      if (criticalImages.length > 0) {
        imagePreloader.preloadBatch(criticalImages, 'critical');
      }
      if (highImages.length > 0) {
        imagePreloader.preloadBatch(highImages, 'high');
      }
      if (mediumImages.length > 0) {
        imagePreloader.preloadBatch(mediumImages, 'medium');
      }
      if (lowImages.length > 0) {
        imagePreloader.preloadBatch(lowImages, 'low');
      }
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Preload images for the current page
   */
  private preloadForCurrentPage(): void {
    if (!this.state.currentPage) return;

    const requirements = this.state.pageRequirements.get(this.state.currentPage);
    if (!requirements) return;

    // Preload critical images immediately
    if (requirements.critical.length > 0) {
      imagePreloader.preloadBatch(requirements.critical, 'critical');
    }

    // Preload action images with high priority
    for (const imageUrls of requirements.actionImages.values()) {
      imagePreloader.preloadBatch(imageUrls, 'high');
    }
  }

  /**
   * Preload images for pages the user might navigate to
   */
  private preloadForNavigation(): void {
    // Get requirements for all other pages and preload with low priority
    for (const [pageId, requirements] of this.state.pageRequirements) {
      if (pageId === this.state.currentPage) continue;

      // Only preload critical images for other pages (low priority)
      if (requirements.critical.length > 0) {
        imagePreloader.preloadBatch(requirements.critical.slice(0, 20), 'low');
      }
    }
  }

  // ============ Hover Preloading ============

  /**
   * Called when user hovers over a navigation link
   */
  onNavigationHover(path: string): void {
    const pageId = this.state.navigationTargets.get(path);
    if (!pageId || pageId === this.state.currentPage) return;

    const requirements = this.state.pageRequirements.get(pageId);
    if (requirements && requirements.critical.length > 0) {
      // Preload critical images for the hovered page with high priority
      imagePreloader.preloadBatch(requirements.critical, 'high');
    }
  }

  /**
   * Called when user hovers over a trigger
   */
  onTriggerHover(triggerId: string): void {
    const trigger = this.state.triggers.get(triggerId);
    if (trigger && trigger.imageUrls.length > 0) {
      // Upgrade to high priority on hover
      imagePreloader.preloadBatch(trigger.imageUrls, 'high');
    }
  }

  // ============ Listeners ============

  subscribe(callback: StateChangeCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // ============ Debug ============

  getStats(): {
    currentPage: PageId | null;
    triggerCount: number;
    visibleTriggers: number;
    registeredPages: PageId[];
    preloaderStats: ReturnType<typeof imagePreloader.getStats>;
  } {
    let visibleTriggers = 0;
    for (const trigger of this.state.triggers.values()) {
      if (trigger.isVisible) visibleTriggers++;
    }

    return {
      currentPage: this.state.currentPage,
      triggerCount: this.state.triggers.size,
      visibleTriggers,
      registeredPages: Array.from(this.state.pageRequirements.keys()),
      preloaderStats: imagePreloader.getStats(),
    };
  }
}

// Singleton instance
export const preloadCoordinator = new PreloadCoordinatorService();

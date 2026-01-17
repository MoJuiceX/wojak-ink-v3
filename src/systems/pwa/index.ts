/**
 * PWA Install System
 *
 * Provides PWA installation prompts and offline support.
 *
 * Usage:
 *   import { PWAProvider, usePWA, InstallBanner, OfflineIndicator } from '@/systems/pwa';
 *
 *   // Wrap app with provider
 *   <PWAProvider>
 *     <App />
 *     <InstallBanner position="bottom" />
 *     <OfflineIndicator />
 *   </PWAProvider>
 */

// Context and hooks
export { PWAProvider, usePWA } from './PWAContext';

// Components
export { InstallBanner } from './InstallBanner';
export { InstallPrompt } from './InstallPrompt';
export { OfflineIndicator } from './OfflineIndicator';

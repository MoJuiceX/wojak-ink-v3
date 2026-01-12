/**
 * Stores Index
 *
 * Central export for all Zustand stores.
 */

// Wallet Store
export { useWalletStore } from './walletStore';
export type { WalletState, WalletBalance, CATBalance } from './walletStore';

// Favorites Store
export { useFavoritesStore } from './favoritesStore';
export type {
  FavoritesState,
  SavedGeneratorCreation,
  GeneratorSelections,
} from './favoritesStore';

// Settings Store
export { useSettingsStore } from './settingsStore';
export type { SettingsState, Theme } from './settingsStore';

// UI Store
export { useUIStore } from './uiStore';
export type {
  UIState,
  ModalName,
  ModalState,
  LoadingKey,
  ActiveTab,
} from './uiStore';

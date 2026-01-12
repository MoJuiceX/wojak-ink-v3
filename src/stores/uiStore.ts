/**
 * UI Store
 *
 * Zustand store for UI state including modals, loading states, and navigation.
 * NOT persisted - resets on page refresh.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============ Types ============

export type ModalName =
  | 'nftExplorer'
  | 'bigPulpIntelligence'
  | 'generatorFavorites'
  | 'walletConnection'
  | 'settings';

export interface ModalState {
  isOpen: boolean;
  nftId?: string | null;
  [key: string]: unknown;
}

export type LoadingKey = 'nfts' | 'wallet' | 'market' | 'traits' | 'media';

export type ActiveTab = 'gallery' | 'treasury' | 'bigpulp' | 'generator' | 'media';

export interface UIState {
  // Modal state
  modals: Record<ModalName, ModalState>;

  // Loading states
  loading: Record<LoadingKey, boolean>;

  // Active states
  activeTab: ActiveTab;
  activeNFTId: string | null;

  // Toast/notification state
  toast: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
  } | null;

  // Actions
  openModal: (modalName: ModalName, data?: Partial<ModalState>) => void;
  closeModal: (modalName: ModalName) => void;
  closeAllModals: () => void;
  setLoading: (key: LoadingKey, isLoading: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setActiveNFT: (nftId: string | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
}

// ============ Initial State ============

const initialModals: Record<ModalName, ModalState> = {
  nftExplorer: { isOpen: false, nftId: null },
  bigPulpIntelligence: { isOpen: false },
  generatorFavorites: { isOpen: false },
  walletConnection: { isOpen: false },
  settings: { isOpen: false },
};

const initialLoading: Record<LoadingKey, boolean> = {
  nfts: false,
  wallet: false,
  market: false,
  traits: false,
  media: false,
};

// ============ Store ============

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // State
      modals: initialModals,
      loading: initialLoading,
      activeTab: 'gallery',
      activeNFTId: null,
      toast: null,

      // Modal Actions
      openModal: (modalName: ModalName, data: Partial<ModalState> = {}) =>
        set(
          (state) => ({
            modals: {
              ...state.modals,
              [modalName]: { isOpen: true, ...data },
            },
          }),
          false,
          `ui/openModal/${modalName}`
        ),

      closeModal: (modalName: ModalName) =>
        set(
          (state) => ({
            modals: {
              ...state.modals,
              [modalName]: { ...initialModals[modalName], isOpen: false },
            },
          }),
          false,
          `ui/closeModal/${modalName}`
        ),

      closeAllModals: () =>
        set({ modals: initialModals }, false, 'ui/closeAllModals'),

      // Loading Actions
      setLoading: (key: LoadingKey, isLoading: boolean) =>
        set(
          (state) => ({
            loading: {
              ...state.loading,
              [key]: isLoading,
            },
          }),
          false,
          `ui/setLoading/${key}`
        ),

      // Navigation Actions
      setActiveTab: (tab: ActiveTab) =>
        set({ activeTab: tab }, false, 'ui/setActiveTab'),

      setActiveNFT: (nftId: string | null) =>
        set({ activeNFTId: nftId }, false, 'ui/setActiveNFT'),

      // Toast Actions
      showToast: (
        message: string,
        type: 'success' | 'error' | 'info' | 'warning' = 'info'
      ) =>
        set(
          { toast: { message, type, isVisible: true } },
          false,
          'ui/showToast'
        ),

      hideToast: () => set({ toast: null }, false, 'ui/hideToast'),
    }),
    { name: 'UIStore' }
  )
);

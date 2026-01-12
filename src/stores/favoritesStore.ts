/**
 * Favorites Store
 *
 * Zustand store for NFT favorites and saved generator creations.
 * Fully persisted to localStorage.
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { LayerType, MouthSelection } from '@/types/generator';

// ============ Types ============

export type GeneratorSelections = Record<LayerType, string | null>;

export interface SavedGeneratorCreation {
  id: number;
  name: string;
  config: {
    selections: GeneratorSelections;
    mouthSelection: MouthSelection;
  };
  timestamp: number;
}

export interface FavoritesState {
  // State
  favoriteNFTs: string[]; // Array of NFT IDs
  savedGeneratorCreations: SavedGeneratorCreation[];

  // NFT Favorites Actions
  addFavoriteNFT: (nftId: string) => void;
  removeFavoriteNFT: (nftId: string) => void;
  toggleFavoriteNFT: (nftId: string) => void;
  isFavorite: (nftId: string) => boolean;

  // Generator Favorites Actions
  saveGeneratorCreation: (creation: {
    name?: string;
    config: SavedGeneratorCreation['config'];
  }) => void;
  removeGeneratorCreation: (id: number) => void;
  renameGeneratorCreation: (id: number, newName: string) => void;

  // Clear Actions
  clearAllFavorites: () => void;
  clearNFTFavorites: () => void;
  clearGeneratorCreations: () => void;
}

// ============ Store ============

export const useFavoritesStore = create<FavoritesState>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        favoriteNFTs: [],
        savedGeneratorCreations: [],

        // NFT Favorites Actions
        addFavoriteNFT: (nftId: string) =>
          set(
            (state) => ({
              favoriteNFTs: [...new Set([...state.favoriteNFTs, nftId])],
            }),
            false,
            'favorites/addNFT'
          ),

        removeFavoriteNFT: (nftId: string) =>
          set(
            (state) => ({
              favoriteNFTs: state.favoriteNFTs.filter((id) => id !== nftId),
            }),
            false,
            'favorites/removeNFT'
          ),

        toggleFavoriteNFT: (nftId: string) => {
          const { favoriteNFTs, addFavoriteNFT, removeFavoriteNFT } = get();
          if (favoriteNFTs.includes(nftId)) {
            removeFavoriteNFT(nftId);
          } else {
            addFavoriteNFT(nftId);
          }
        },

        isFavorite: (nftId: string) => get().favoriteNFTs.includes(nftId),

        // Generator Favorites Actions
        saveGeneratorCreation: (creation) =>
          set(
            (state) => ({
              savedGeneratorCreations: [
                ...state.savedGeneratorCreations,
                {
                  id: Date.now(),
                  name:
                    creation.name ||
                    `Wojak ${state.savedGeneratorCreations.length + 1}`,
                  config: creation.config,
                  timestamp: Date.now(),
                },
              ],
            }),
            false,
            'favorites/saveGeneratorCreation'
          ),

        removeGeneratorCreation: (id: number) =>
          set(
            (state) => ({
              savedGeneratorCreations: state.savedGeneratorCreations.filter(
                (c) => c.id !== id
              ),
            }),
            false,
            'favorites/removeGeneratorCreation'
          ),

        renameGeneratorCreation: (id: number, newName: string) =>
          set(
            (state) => ({
              savedGeneratorCreations: state.savedGeneratorCreations.map((c) =>
                c.id === id ? { ...c, name: newName } : c
              ),
            }),
            false,
            'favorites/renameGeneratorCreation'
          ),

        // Clear Actions
        clearAllFavorites: () =>
          set(
            { favoriteNFTs: [], savedGeneratorCreations: [] },
            false,
            'favorites/clearAll'
          ),

        clearNFTFavorites: () =>
          set({ favoriteNFTs: [] }, false, 'favorites/clearNFTs'),

        clearGeneratorCreations: () =>
          set(
            { savedGeneratorCreations: [] },
            false,
            'favorites/clearGeneratorCreations'
          ),
      }),
      {
        name: 'favorites-storage',
      }
    ),
    { name: 'FavoritesStore' }
  )
);

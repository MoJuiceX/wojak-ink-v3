/**
 * BigPulp Context
 *
 * State management for the BigPulp Intelligence system.
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  NFTAnalysis,
  BigPulpState,
  BigPulpMood,
  BigPulpTab,
  MarketStats,
  HeatMapCell,
  PriceDistribution,
  AttributeStats,
  NFTSale,
  NFTBasic,
  HeatMapViewMode,
} from '@/types/bigpulp';
import {
  generateBigPulpResponse,
  getSearchingMessage,
  getErrorMessage,
  getWelcomeMessage,
} from '@/config/bigpulpResponses';
import {
  useBigPulpMarketStats,
  useBigPulpHeatMap,
  useBigPulpPriceDistribution,
  useBigPulpAttributes,
  useBigPulpTopSales,
  useBigPulpRarestFinds,
  useSearchNFTMutation,
  useRandomAnalysisMutation,
} from '@/hooks/data/useBigPulpData';

// ============ State Types ============

interface BigPulpContextState {
  // NFT Analysis
  currentAnalysis: NFTAnalysis | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // BigPulp Character
  bigPulp: BigPulpState;

  // Tab State
  activeTab: BigPulpTab;
  isModalOpen: boolean; // Mobile modal

  // Market Data
  marketStats: MarketStats | null;
  heatMapData: HeatMapCell[][] | null;
  heatMapViewMode: HeatMapViewMode;
  priceDistribution: PriceDistribution | null;

  // Attributes Data
  attributes: AttributeStats[];
  selectedCategory: string | null;

  // Ask Tab Data
  topSales: NFTSale[];
  rarestFinds: NFTBasic[];
}

// ============ Action Types ============

type BigPulpAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'START_SEARCH' }
  | { type: 'SEARCH_SUCCESS'; payload: NFTAnalysis }
  | { type: 'SEARCH_ERROR'; payload: string }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'SET_TAB'; payload: BigPulpTab }
  | { type: 'TOGGLE_MODAL'; payload: boolean }
  | { type: 'SET_HEATMAP_VIEW_MODE'; payload: HeatMapViewMode }
  | { type: 'SET_CATEGORY_FILTER'; payload: string | null }
  | { type: 'UPDATE_BIGPULP_MESSAGE'; payload: { message: string; mood: BigPulpMood } }
  | { type: 'SET_BIGPULP_TYPING'; payload: boolean }
  | { type: 'ADVANCE_MESSAGE_QUEUE' }
  | { type: 'SET_BIGPULP_HEAD_VARIANT'; payload: string }
  | { type: 'LOAD_MARKET_DATA'; payload: { stats: MarketStats; heatMap: HeatMapCell[][]; distribution: PriceDistribution } }
  | { type: 'LOAD_ATTRIBUTES'; payload: AttributeStats[] }
  | { type: 'LOAD_ASK_DATA'; payload: { topSales: NFTSale[]; rarestFinds: NFTBasic[] } };

// ============ Initial State ============

const initialBigPulpState: BigPulpState = {
  mood: 'chill',
  headVariant: 'default',
  message: getWelcomeMessage(),
  isTyping: true,
  messageQueue: [],
};

const initialState: BigPulpContextState = {
  currentAnalysis: null,
  searchQuery: '',
  isLoading: false,
  error: null,
  bigPulp: initialBigPulpState,
  activeTab: 'market',
  isModalOpen: false,
  marketStats: null,
  heatMapData: null,
  heatMapViewMode: 'all',
  priceDistribution: null,
  attributes: [],
  selectedCategory: null,
  topSales: [],
  rarestFinds: [],
};

// ============ Reducer ============

function bigPulpReducer(
  state: BigPulpContextState,
  action: BigPulpAction
): BigPulpContextState {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
        error: null,
      };

    case 'START_SEARCH':
      return {
        ...state,
        isLoading: true,
        error: null,
        bigPulp: {
          ...state.bigPulp,
          message: getSearchingMessage(),
          mood: 'thinking',
          isTyping: true,
          messageQueue: [],
        },
      };

    case 'SEARCH_SUCCESS': {
      const response = generateBigPulpResponse(action.payload);
      return {
        ...state,
        isLoading: false,
        currentAnalysis: action.payload,
        error: null,
        bigPulp: {
          mood: response.mood,
          headVariant: response.headVariant || 'default',
          message: response.message,
          isTyping: true,
          messageQueue: response.followUp || [],
        },
      };
    }

    case 'SEARCH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        bigPulp: {
          ...state.bigPulp,
          message: getErrorMessage('notFound'),
          mood: 'neutral',
          isTyping: true,
          messageQueue: [],
        },
      };

    case 'CLEAR_SEARCH':
      return {
        ...state,
        currentAnalysis: null,
        searchQuery: '',
        error: null,
        bigPulp: {
          ...initialBigPulpState,
          message: getWelcomeMessage(),
        },
      };

    case 'SET_TAB':
      return {
        ...state,
        activeTab: action.payload,
      };

    case 'TOGGLE_MODAL':
      return {
        ...state,
        isModalOpen: action.payload,
      };

    case 'SET_HEATMAP_VIEW_MODE':
      return {
        ...state,
        heatMapViewMode: action.payload,
      };

    case 'SET_CATEGORY_FILTER':
      return {
        ...state,
        selectedCategory: action.payload,
      };

    case 'UPDATE_BIGPULP_MESSAGE':
      return {
        ...state,
        bigPulp: {
          ...state.bigPulp,
          message: action.payload.message,
          mood: action.payload.mood,
          isTyping: true,
        },
      };

    case 'SET_BIGPULP_TYPING':
      return {
        ...state,
        bigPulp: {
          ...state.bigPulp,
          isTyping: action.payload,
        },
      };

    case 'ADVANCE_MESSAGE_QUEUE': {
      const [nextMessage, ...remaining] = state.bigPulp.messageQueue;
      if (!nextMessage) return state;
      return {
        ...state,
        bigPulp: {
          ...state.bigPulp,
          message: nextMessage,
          messageQueue: remaining,
          isTyping: true,
        },
      };
    }

    case 'SET_BIGPULP_HEAD_VARIANT':
      return {
        ...state,
        bigPulp: {
          ...state.bigPulp,
          headVariant: action.payload,
        },
      };

    case 'LOAD_MARKET_DATA':
      return {
        ...state,
        marketStats: action.payload.stats,
        heatMapData: action.payload.heatMap,
        priceDistribution: action.payload.distribution,
      };

    case 'LOAD_ATTRIBUTES':
      return {
        ...state,
        attributes: action.payload,
      };

    case 'LOAD_ASK_DATA':
      return {
        ...state,
        topSales: action.payload.topSales,
        rarestFinds: action.payload.rarestFinds,
      };

    default:
      return state;
  }
}

// ============ Context ============

interface BigPulpContextValue extends BigPulpContextState {
  // Search actions
  setSearchQuery: (query: string) => void;
  searchNFT: (id: string) => Promise<void>;
  surpriseMe: () => Promise<void>;
  clearSearch: () => void;

  // Tab actions
  setActiveTab: (tab: BigPulpTab) => void;
  toggleModal: (open: boolean) => void;

  // Heat map actions
  setHeatMapViewMode: (mode: HeatMapViewMode) => void;

  // Attributes actions
  setCategoryFilter: (category: string | null) => void;

  // BigPulp character actions
  onTypingComplete: () => void;
  skipMessage: () => void;

  // Loading states for tabs
  isMarketLoading: boolean;
  isAskLoading: boolean;
  isAttributesLoading: boolean;
}

const BigPulpContext = createContext<BigPulpContextValue | null>(null);

// ============ Provider ============

interface BigPulpProviderProps {
  children: ReactNode;
  mockData?: boolean;
}

export function BigPulpProvider({
  children,
  mockData: _mockData = true,
}: BigPulpProviderProps) {
  const [state, dispatch] = useReducer(bigPulpReducer, initialState);

  // Use TanStack Query hooks for data fetching
  const { data: marketStatsData, isLoading: isMarketStatsLoading } = useBigPulpMarketStats();
  const { data: heatMapData, isLoading: isHeatMapLoading } = useBigPulpHeatMap();
  const { data: priceDistributionData, isLoading: isDistributionLoading } = useBigPulpPriceDistribution();
  const { data: attributesData, isLoading: isAttributesLoading } = useBigPulpAttributes();
  const { data: topSalesData, isLoading: isTopSalesLoading } = useBigPulpTopSales();
  const { data: rarestFindsData, isLoading: isRarestLoading } = useBigPulpRarestFinds();

  // Combined loading states
  const isMarketLoading = isMarketStatsLoading || isHeatMapLoading || isDistributionLoading;
  const isAskLoading = isMarketStatsLoading || isTopSalesLoading || isRarestLoading;

  const searchMutation = useSearchNFTMutation();
  const randomMutation = useRandomAnalysisMutation();

  // Sync market data to context state
  useEffect(() => {
    if (marketStatsData && heatMapData && priceDistributionData) {
      dispatch({
        type: 'LOAD_MARKET_DATA',
        payload: {
          stats: marketStatsData,
          heatMap: heatMapData,
          distribution: priceDistributionData,
        },
      });
    }
  }, [marketStatsData, heatMapData, priceDistributionData]);

  // Sync attributes data
  useEffect(() => {
    if (attributesData) {
      dispatch({
        type: 'LOAD_ATTRIBUTES',
        payload: attributesData,
      });
    }
  }, [attributesData]);

  // Sync ask tab data
  useEffect(() => {
    if (topSalesData && rarestFindsData) {
      dispatch({
        type: 'LOAD_ASK_DATA',
        payload: {
          topSales: topSalesData,
          rarestFinds: rarestFindsData,
        },
      });
    }
  }, [topSalesData, rarestFindsData]);

  // Search actions
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const searchNFT = useCallback(
    async (id: string) => {
      dispatch({ type: 'START_SEARCH' });

      const numId = parseInt(id, 10);
      if (isNaN(numId) || numId < 1 || numId > 4200) {
        dispatch({ type: 'SEARCH_ERROR', payload: 'NFT not found' });
        return;
      }

      try {
        const analysis = await searchMutation.mutateAsync(numId);
        if (analysis) {
          dispatch({ type: 'SEARCH_SUCCESS', payload: analysis });
        } else {
          dispatch({ type: 'SEARCH_ERROR', payload: 'NFT not found' });
        }
      } catch {
        dispatch({ type: 'SEARCH_ERROR', payload: 'NFT not found' });
      }
    },
    [searchMutation]
  );

  const surpriseMe = useCallback(async () => {
    dispatch({ type: 'START_SEARCH' });

    try {
      const analysis = await randomMutation.mutateAsync();
      dispatch({ type: 'SET_SEARCH_QUERY', payload: analysis.nft.id.replace('WFP-', '') });
      dispatch({ type: 'SEARCH_SUCCESS', payload: analysis });
    } catch {
      dispatch({ type: 'SEARCH_ERROR', payload: 'Failed to get random NFT' });
    }
  }, [randomMutation]);

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' });
  }, []);

  // Tab actions
  const setActiveTab = useCallback((tab: BigPulpTab) => {
    dispatch({ type: 'SET_TAB', payload: tab });
  }, []);

  const toggleModal = useCallback((open: boolean) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: open });
  }, []);

  // Heat map actions
  const setHeatMapViewMode = useCallback((mode: HeatMapViewMode) => {
    dispatch({ type: 'SET_HEATMAP_VIEW_MODE', payload: mode });
  }, []);

  // Attributes actions
  const setCategoryFilter = useCallback((category: string | null) => {
    dispatch({ type: 'SET_CATEGORY_FILTER', payload: category });
  }, []);

  // BigPulp character actions
  const onTypingComplete = useCallback(() => {
    dispatch({ type: 'SET_BIGPULP_TYPING', payload: false });
  }, []);

  const skipMessage = useCallback(() => {
    dispatch({ type: 'ADVANCE_MESSAGE_QUEUE' });
  }, []);

  const value = useMemo<BigPulpContextValue>(
    () => ({
      ...state,
      setSearchQuery,
      searchNFT,
      surpriseMe,
      clearSearch,
      setActiveTab,
      toggleModal,
      setHeatMapViewMode,
      setCategoryFilter,
      onTypingComplete,
      skipMessage,
      isMarketLoading,
      isAskLoading,
      isAttributesLoading,
    }),
    [
      state,
      setSearchQuery,
      searchNFT,
      surpriseMe,
      clearSearch,
      setActiveTab,
      toggleModal,
      setHeatMapViewMode,
      setCategoryFilter,
      onTypingComplete,
      skipMessage,
      isMarketLoading,
      isAskLoading,
      isAttributesLoading,
    ]
  );

  return (
    <BigPulpContext.Provider value={value}>{children}</BigPulpContext.Provider>
  );
}

// ============ Hook ============

export function useBigPulp(): BigPulpContextValue {
  const context = useContext(BigPulpContext);
  if (!context) {
    throw new Error('useBigPulp must be used within a BigPulpProvider');
  }
  return context;
}

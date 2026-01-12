/**
 * Wallet Data Hooks
 *
 * Hooks for fetching wallet data using TanStack Query.
 * Uses treasuryService for wallet data.
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { walletKeys } from '@/config/query/queryKeys';
import { DATA_CACHE_MAP } from '@/config/query/cacheConfig';
import { treasuryService } from '@/services';

// Wallet balance
export function useWalletBalance(address: string | undefined) {
  return useQuery({
    queryKey: walletKeys.balance(address!),
    queryFn: async () => {
      const data = await treasuryService.fetchWalletData();
      return {
        xch: data.xchBalance,
        xchUsd: data.xchBalance * data.xchPriceUsd,
        totalUsd: data.xchBalance * data.xchPriceUsd + data.totalTokenValueUsd,
      };
    },
    ...DATA_CACHE_MAP.walletBalance,
    enabled: !!address,
  });
}

// Wallet NFTs
export function useWalletNFTs(address: string | undefined) {
  return useQuery({
    queryKey: walletKeys.nfts(address!),
    queryFn: async () => {
      const data = await treasuryService.fetchWalletData();
      return data.nftCollections.flatMap(c => c.nfts || []);
    },
    ...DATA_CACHE_MAP.walletNFTs,
    enabled: !!address,
  });
}

// Token prices (polling)
export function useTokenPrices() {
  return useQuery({
    queryKey: walletKeys.tokenPrices(),
    queryFn: async () => {
      const xchPrice = await treasuryService.getXchPrice();
      return {
        xch: { usd: xchPrice },
      };
    },
    ...DATA_CACHE_MAP.tokenPrices,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
}

// Combined wallet data
export function useWallet(address: string | undefined) {
  const balance = useWalletBalance(address);
  const nfts = useWalletNFTs(address);
  const prices = useTokenPrices();

  // Calculate portfolio value
  const portfolioValue = useMemo(() => {
    if (!balance.data || !nfts.data || !prices.data) return null;

    const xchValue = balance.data.xch * prices.data.xch.usd;
    // NFTs from treasury service don't have lastSalePrice, use 0 for now
    const nftValue = 0;

    return {
      xch: xchValue,
      tokens: balance.data.totalUsd - balance.data.xchUsd,
      nfts: nftValue,
      total: xchValue + nftValue + (balance.data.totalUsd - balance.data.xchUsd),
    };
  }, [balance.data, nfts.data, prices.data]);

  return {
    balance: balance.data,
    nfts: nfts.data,
    prices: prices.data,
    portfolioValue,
    isLoading: balance.isLoading || nfts.isLoading || prices.isLoading,
    isError: balance.isError || nfts.isError || prices.isError,
    error: balance.error || nfts.error || prices.error,
  };
}

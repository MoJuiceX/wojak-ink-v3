/**
 * NFT Picker Component
 *
 * Displays user's Wojak NFTs for avatar selection.
 * Shows locked state if wallet not connected.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { IonSpinner } from '@ionic/react';
import './AvatarPicker.css';

interface NFT {
  id: string;
  name: string;
  imageUrl: string;
  collection: string;
}

interface NFTPickerProps {
  selectedNftId: string | null;
  onSelect: (nft: NFT) => void;
}

export const NFTPicker: React.FC<NFTPickerProps> = ({
  selectedNftId,
  onSelect
}) => {
  const { user } = useAuth();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.walletAddress) {
      fetchUserNFTs();
    } else {
      setIsLoading(false);
    }
  }, [user?.walletAddress]);

  const fetchUserNFTs = async () => {
    setIsLoading(true);
    try {
      // For now, load from local metadata as a demo
      // In production, this would fetch from the wallet
      const response = await fetch('/assets/nft-data/metadata.json');
      const allNfts = await response.json();

      // Simulate having some NFTs (random selection for demo)
      const userNfts = allNfts
        .slice(0, 12) // Take first 12 as demo
        .map((nft: any) => ({
          id: String(nft.edition),
          name: nft.name || `Wojak #${nft.edition}`,
          imageUrl: nft.image,
          collection: 'Wojak Farmers Plot',
        }));

      setNfts(userNfts);
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      setNfts([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.walletAddress) {
    return (
      <div className="nft-picker-locked">
        <div className="lock-icon">🔒</div>
        <h3>Connect Your Wallet</h3>
        <p>Connect your Sage Wallet to use Wojak NFTs as your avatar and compete on leaderboards!</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="nft-picker-loading">
        <IonSpinner name="crescent" />
        <p>Loading your Wojak NFTs...</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="nft-picker-empty">
        <div className="empty-icon">😢</div>
        <h3>No Wojak NFTs Found</h3>
        <p>You don't have any Wojak NFTs in this wallet. Get one to unlock leaderboard competition!</p>
        <a
          href="https://mintgarden.io/collections/wojak-farmers-plot-col1kfy44w3nlkqq8z3j8z9mhc3nw9pzwvlsmhsyhc0z6a7luvzukfsufegk5"
          target="_blank"
          rel="noopener noreferrer"
          className="get-nft-button"
        >
          Get Wojak NFTs
        </a>
      </div>
    );
  }

  return (
    <div className="nft-picker">
      <h3 className="picker-title">
        Choose Your Wojak NFT Avatar
        <span className="nft-count">{nfts.length} owned</span>
      </h3>
      <p className="picker-subtitle">Using an NFT avatar unlocks leaderboard competition!</p>

      <div className="nft-grid">
        {nfts.map((nft) => (
          <button
            key={nft.id}
            className={`nft-option ${selectedNftId === nft.id ? 'selected' : ''}`}
            onClick={() => onSelect(nft)}
            type="button"
            aria-label={`Select ${nft.name} as avatar`}
            aria-pressed={selectedNftId === nft.id}
          >
            <img src={nft.imageUrl} alt={nft.name} loading="lazy" />
            <span className="nft-name">{nft.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NFTPicker;

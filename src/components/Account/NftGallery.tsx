/**
 * NftGallery Component (Premium Version)
 *
 * Horizontal scrollable row of owned Wojak Farmers Plot NFTs.
 * Compact design showing 4-5 visible items with scroll.
 */

import { useState } from 'react';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { getNftImageUrl } from '@/services/constants';
import type { UserAvatar } from '@/types/avatar';
import './Account.css';

const MINTGARDEN_COLLECTION_URL = 'https://mintgarden.io/collections/wojak-farmers-plot-col1kfy44w3nlkqq8z3j8z9mhc3nw9pzwvlsmhsyhc0z6a7luvzukfsufegk5';

interface NftGalleryProps {
  ownedNftIds: string[];
  currentAvatar: UserAvatar;
  walletConnected: boolean;
  isOwnProfile: boolean;
  onSelectNft?: (nftId: string) => void;
}

export function NftGallery({
  ownedNftIds,
  currentAvatar,
  walletConnected,
  isOwnProfile,
  onSelectNft,
}: NftGalleryProps) {
  const [showAll, setShowAll] = useState(false);
  const currentNftId = currentAvatar.type === 'nft' ? currentAvatar.nftId : null;

  // Don't render if wallet not connected - the CTA is in the header now
  if (!walletConnected && isOwnProfile) {
    return null;
  }

  if (ownedNftIds.length === 0) {
    return (
      <div className="nft-gallery-premium nft-gallery--empty">
        <div className="nft-gallery__header">
          <h2>NFT Collection</h2>
        </div>
        <div className="nft-gallery-empty-state">
          <span className="empty-icon">🖼️</span>
          <p>No Wojak Farmers Plot NFTs found</p>
          <a
            href={MINTGARDEN_COLLECTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="browse-link"
          >
            Browse collection
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  // Show expanded grid view
  if (showAll) {
    return (
      <div className="nft-gallery-premium nft-gallery--expanded">
        <div className="nft-gallery__header">
          <h2>NFT Collection <span className="count">({ownedNftIds.length})</span></h2>
          <button className="see-all-btn" onClick={() => setShowAll(false)}>
            Collapse
          </button>
        </div>
        <div className="nft-gallery__grid">
          {ownedNftIds.map((nftId) => {
            const isCurrentAvatar = nftId === currentNftId;
            return (
              <div
                key={nftId}
                className={`nft-item ${isCurrentAvatar ? 'nft-item--active' : ''}`}
                onClick={() => isOwnProfile && onSelectNft?.(nftId)}
                role={isOwnProfile ? 'button' : undefined}
                tabIndex={isOwnProfile ? 0 : undefined}
                onKeyDown={(e) => e.key === 'Enter' && isOwnProfile && onSelectNft?.(nftId)}
              >
                <img
                  src={getNftImageUrl(nftId)}
                  alt={`Wojak #${nftId}`}
                  loading="lazy"
                />
                <span className="nft-item__id">#{nftId}</span>
                {isCurrentAvatar && <span className="nft-item__badge">Avatar</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="nft-gallery-premium">
      <div className="nft-gallery__header">
        <h2>NFT Collection <span className="count">({ownedNftIds.length})</span></h2>
        {ownedNftIds.length > 5 && (
          <button className="see-all-btn" onClick={() => setShowAll(true)}>
            See All <ChevronRight size={14} />
          </button>
        )}
      </div>
      
      <div className="nft-gallery__scroll">
        {ownedNftIds.map((nftId) => {
          const isCurrentAvatar = nftId === currentNftId;
          return (
            <div
              key={nftId}
              className={`nft-item ${isCurrentAvatar ? 'nft-item--active' : ''}`}
              onClick={() => isOwnProfile && onSelectNft?.(nftId)}
              role={isOwnProfile ? 'button' : undefined}
              tabIndex={isOwnProfile ? 0 : undefined}
              onKeyDown={(e) => e.key === 'Enter' && isOwnProfile && onSelectNft?.(nftId)}
            >
              <img
                src={getNftImageUrl(nftId)}
                alt={`Wojak #${nftId}`}
                loading="lazy"
              />
              <span className="nft-item__id">#{nftId}</span>
              {isCurrentAvatar && <span className="nft-item__badge">Avatar</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

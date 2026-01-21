/**
 * NftGallery Component
 *
 * Mini-gallery of owned Wojak Farmers Plot NFTs.
 * Highlights the one currently set as avatar.
 */

import { ExternalLink } from 'lucide-react';
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
  const currentNftId = currentAvatar.type === 'nft' ? currentAvatar.nftId : null;

  if (!walletConnected && isOwnProfile) {
    return (
      <div className="nft-gallery-section">
        <h2 className="section-title">NFT Collection</h2>
        <div className="nft-gallery-empty">
          <span className="empty-icon">💼</span>
          <p>Connect your wallet to display your NFTs</p>
        </div>
      </div>
    );
  }

  if (ownedNftIds.length === 0) {
    return (
      <div className="nft-gallery-section">
        <h2 className="section-title">NFT Collection</h2>
        <div className="nft-gallery-empty">
          <span className="empty-icon">🖼️</span>
          <p>No Wojak Farmers Plot NFTs</p>
          <a
            href={MINTGARDEN_COLLECTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mint-link"
          >
            Browse collection on MintGarden
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-gallery-section">
      <h2 className="section-title">
        NFT Collection
        <span className="nft-count">({ownedNftIds.length})</span>
      </h2>

      <div className="nft-gallery-grid">
        {ownedNftIds.map((nftId) => {
          const isCurrentAvatar = nftId === currentNftId;

          return (
            <div
              key={nftId}
              className={`nft-gallery-item ${isCurrentAvatar ? 'is-avatar' : ''}`}
              onClick={() => isOwnProfile && onSelectNft?.(nftId)}
              role={isOwnProfile ? 'button' : undefined}
              tabIndex={isOwnProfile ? 0 : undefined}
            >
              <img
                src={getNftImageUrl(nftId)}
                alt={`Wojak #${nftId}`}
                loading="lazy"
              />
              <span className="nft-id">#{nftId}</span>
              {isCurrentAvatar && (
                <span className="avatar-indicator">Avatar</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

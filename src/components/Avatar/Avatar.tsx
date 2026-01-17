/**
 * Avatar Component
 *
 * Displays user avatars with support for emoji and NFT types.
 *
 * Game Theory Design:
 * - Generic emoji avatars look intentionally "meh" with upgrade indicator
 * - NFT avatars get premium glow effects to incentivize wallet connection
 * - Verified badge for NFT holders to show "part of the club" status
 */

import React from 'react';
import { AVATAR_SIZES, type AvatarSize } from '../../constants/avatars';
import './Avatar.css';

interface AvatarProps {
  type: 'emoji' | 'nft';
  value: string;
  size?: AvatarSize;
  showBorder?: boolean;
  isNftHolder?: boolean;
  /** Show the "upgrade" indicator on generic emoji avatars */
  showUpgradeIndicator?: boolean;
  /** Show spinning highlight ring (for featured/top players) */
  highlighted?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  type,
  value,
  size = 'medium',
  showBorder = true,
  isNftHolder = false,
  showUpgradeIndicator = true,
  highlighted = false,
  onClick,
  className = '',
}) => {
  const pixelSize = AVATAR_SIZES[size];

  // Determine the avatar style class
  const isGeneric = type === 'emoji' && !isNftHolder;
  const isNft = type === 'nft' || isNftHolder;

  const classes = [
    'avatar',
    `avatar-${size}`,
    isGeneric && showUpgradeIndicator ? 'avatar-generic' : '',
    isNft ? 'avatar-nft' : '',
    isNftHolder ? 'avatar-nft-holder' : '',
    highlighted ? 'avatar-highlighted' : '',
    showBorder && !isGeneric && !isNft ? 'avatar-bordered' : '',
    onClick ? 'avatar-clickable' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{ width: pixelSize, height: pixelSize }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {type === 'emoji' ? (
        <span className="avatar-emoji" style={{ fontSize: pixelSize * 0.6 }}>
          {value}
        </span>
      ) : (
        <img
          src={value}
          alt="NFT Avatar"
          className="avatar-nft-image"
          loading="lazy"
        />
      )}

      {/* Verified NFT holder badge - green checkmark */}
      {isNftHolder && type === 'nft' && (
        <div className="avatar-nft-badge" title="Verified Wojak NFT Holder">
          <span>✓</span>
        </div>
      )}
    </div>
  );
};

// Convenient wrapper using user data
interface UserAvatarProps {
  user: {
    avatar: { type: 'emoji' | 'nft'; value: string };
    walletAddress?: string | null;
  };
  size?: AvatarSize;
  showBorder?: boolean;
  onClick?: () => void;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'medium',
  showBorder = true,
  onClick,
  className,
}) => {
  return (
    <Avatar
      type={user.avatar.type}
      value={user.avatar.value}
      size={size}
      showBorder={showBorder}
      isNftHolder={!!user.walletAddress}
      onClick={onClick}
      className={className}
    />
  );
};

export default Avatar;

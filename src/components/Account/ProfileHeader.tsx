/**
 * ProfileHeader Component
 *
 * Shows avatar, display name, account age, and status badges.
 * Editable on own profile, read-only on public profiles.
 */

import { useState } from 'react';
import { Edit3, Calendar, Shield } from 'lucide-react';
import { Avatar } from '@/components/Avatar/Avatar';
import { AvatarPickerModal } from '@/components/AvatarPicker/AvatarPickerModal';
import { formatDistanceToNow } from 'date-fns';
import type { UserAvatar } from '@/types/avatar';
import './Account.css';

interface ProfileHeaderProps {
  avatar: UserAvatar;
  displayName: string;
  xHandle?: string | null;
  walletAddress?: string | null;
  createdAt: Date;
  isOwnProfile: boolean;
  onEditName?: () => void;
}

export function ProfileHeader({
  avatar,
  displayName,
  xHandle,
  walletAddress,
  createdAt,
  isOwnProfile,
  onEditName,
}: ProfileHeaderProps) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const accountAge = formatDistanceToNow(createdAt, { addSuffix: false });
  const isNftHolder = avatar.type === 'nft';

  return (
    <div className="profile-header">
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrapper">
          <Avatar
            avatar={avatar}
            size="xlarge"
            showBadge={false}
            onClick={isOwnProfile ? () => setShowAvatarPicker(true) : undefined}
          />
          {isOwnProfile && (
            <button
              className="avatar-edit-button"
              onClick={() => setShowAvatarPicker(true)}
              aria-label="Change avatar"
            >
              <Edit3 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="profile-info">
        <div className="profile-name-row">
          <h1 className="profile-display-name">{displayName}</h1>
          {isOwnProfile && onEditName && (
            <button className="edit-name-button" onClick={onEditName}>
              <Edit3 size={14} />
            </button>
          )}
        </div>

        {xHandle && (
          <a
            href={`https://x.com/${xHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-x-handle"
          >
            @{xHandle}
          </a>
        )}

        <div className="profile-badges">
          <span className="badge badge-age">
            <Calendar size={12} />
            Member for {accountAge}
          </span>

          {isNftHolder && (
            <span className="badge badge-nft">
              <Shield size={12} />
              NFT Holder
            </span>
          )}

          {walletAddress && (
            <span className="badge badge-wallet" title={walletAddress}>
              Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
            </span>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <AvatarPickerModal
          isOpen={showAvatarPicker}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
    </div>
  );
}

/**
 * ProfileHeader Component (Premium Version)
 *
 * Identity hub with avatar, name, streak stats, and wallet integration.
 * Mobile-first design with responsive layout.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Edit3, Calendar, Flame, Trophy, Wallet, RefreshCw, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/Avatar/Avatar';
import { AvatarPickerModal } from '@/components/AvatarPicker/AvatarPickerModal';
import { formatDistanceToNow } from 'date-fns';
import { useSageWallet } from '@/sage-wallet';
import { useUserProfile } from '@/contexts/UserProfileContext';
import type { UserAvatar } from '@/types/avatar';
import './Account.css';

// Wojak Farmers Plot collection ID
const WOJAK_COLLECTION_ID = 'col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

interface ProfileHeaderProps {
  avatar: UserAvatar;
  displayName: string;
  xHandle?: string | null;
  walletAddress?: string | null; // Kept for interface compatibility
  createdAt: Date;
  isOwnProfile: boolean;
  onEditName?: () => void;
  // Streak data
  currentStreak?: number;
  longestStreak?: number;
}

export function ProfileHeader({
  avatar,
  displayName,
  xHandle,
  walletAddress: _walletAddress, // Renamed to indicate intentionally unused
  createdAt,
  isOwnProfile,
  onEditName,
  currentStreak = 0,
  longestStreak = 0,
}: ProfileHeaderProps) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  
  // Wallet integration
  const { profile, updateProfile, isSignedIn } = useUserProfile();
  const { status: walletStatus, address, connect, disconnect, getNFTs } = useSageWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const walletConnected = walletStatus === 'connected' && !!address;
  const nftCount = profile?.nftCount;
  const hasVerified = nftCount !== null && nftCount !== undefined;

  const accountAge = formatDistanceToNow(createdAt, { addSuffix: false });

  // Handle wallet connect
  const handleConnect = useCallback(async () => {
    setWalletError(null);
    try {
      await connect();
    } catch (err) {
      console.error('[ProfileHeader] Connect error:', err);
      setWalletError('Failed to connect wallet');
    }
  }, [connect]);

  // Handle disconnect
  const handleDisconnect = useCallback(async () => {
    setWalletError(null);
    try {
      await disconnect();
      await updateProfile({ walletAddress: null });
    } catch (err) {
      console.error('[ProfileHeader] Disconnect error:', err);
    }
  }, [disconnect, updateProfile]);

  // Fetch and save NFT count
  const refreshNftCount = useCallback(async () => {
    if (!address) return;

    setIsRefreshing(true);
    setWalletError(null);

    try {
      const nfts = await getNFTs(WOJAK_COLLECTION_ID);
      const count = nfts.length;

      await updateProfile({
        nftCount: count,
        nftVerifiedAt: new Date().toISOString(),
        walletAddress: address,
      });

      console.log('[ProfileHeader] NFT count updated:', count);
    } catch (err) {
      console.error('[ProfileHeader] Error fetching NFTs:', err);
      setWalletError('Failed to fetch NFTs');
    } finally {
      setIsRefreshing(false);
    }
  }, [address, getNFTs, updateProfile]);

  // Track previous wallet address to detect new connections
  const prevAddressRef = useRef<string | null>(null);

  // Auto-fetch NFTs when wallet connects
  useEffect(() => {
    const prevAddress = prevAddressRef.current;
    prevAddressRef.current = address || null;

    if (
      walletConnected &&
      address &&
      prevAddress !== address &&
      (profile?.walletAddress !== address || !hasVerified)
    ) {
      console.log('[ProfileHeader] Wallet connected, auto-fetching NFTs');
      refreshNftCount();
    }
  }, [walletConnected, address, profile?.walletAddress, hasVerified, refreshNftCount]);

  return (
    <motion.div 
      className="profile-header-premium"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Identity Section: Avatar + Name + Streak */}
      <div className="profile-header__identity">
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

        <div className="profile-header__info">
          <div className="profile-header__name-row">
            <div className="profile-header__name-group">
              <h1 className="profile-display-name">{displayName}</h1>
              {isOwnProfile && onEditName && (
                <button className="edit-name-button" onClick={onEditName} aria-label="Edit name">
                  <Edit3 size={14} />
                </button>
              )}
            </div>
            
            {/* Streak badges next to name */}
            <div className="profile-header__streak">
              <span className={`streak-badge streak-badge--current ${currentStreak > 0 ? 'active' : ''}`}>
                <Flame size={14} />
                {currentStreak}
              </span>
              <span className={`streak-badge streak-badge--best ${longestStreak > 0 ? 'active' : ''}`}>
                <Trophy size={14} />
                {longestStreak}
              </span>
            </div>
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

          <span className="profile-header__member">
            <Calendar size={12} />
            Member for {accountAge}
          </span>
        </div>
      </div>

      {/* Wallet Section: Integrated into header */}
      {isOwnProfile && isSignedIn && (
        <div className="profile-header__wallet">
          {!walletConnected ? (
            <div className="wallet-cta">
              <p className="wallet-cta__text">
                Connect your Sage wallet to verify NFT holdings, choose your avatar, and enter chat rooms.
              </p>
              <button className="wallet-cta__btn" onClick={handleConnect}>
                <Wallet size={16} />
                Connect Sage Wallet
              </button>
            </div>
          ) : (
            <div className="wallet-status">
              <div className="wallet-status__info">
                <div className={`wallet-status__dot ${hasVerified && nftCount! > 0 ? 'dot--success' : hasVerified && nftCount === 0 ? 'dot--warning' : 'dot--neutral'}`} />
                <span className="wallet-status__address">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <span className="wallet-status__divider">|</span>
                <span className="wallet-status__nfts">
                  {hasVerified ? (
                    <><strong>{nftCount}</strong> NFT{nftCount !== 1 ? 's' : ''}</>
                  ) : (
                    'Verifying...'
                  )}
                </span>
              </div>
              <div className="wallet-status__actions">
                <button
                  className="wallet-icon-btn"
                  onClick={refreshNftCount}
                  disabled={isRefreshing}
                  title="Refresh NFT count"
                  aria-label="Refresh NFT count"
                >
                  <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
                </button>
                <button
                  className="wallet-icon-btn wallet-icon-btn--danger"
                  onClick={handleDisconnect}
                  title="Disconnect wallet"
                  aria-label="Disconnect wallet"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
          {walletError && (
            <div className="wallet-error">
              <AlertCircle size={12} />
              {walletError}
            </div>
          )}
        </div>
      )}

      {isOwnProfile && (
        <AvatarPickerModal
          isOpen={showAvatarPicker}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
    </motion.div>
  );
}

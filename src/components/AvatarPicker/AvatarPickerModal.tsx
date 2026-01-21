/**
 * Avatar Picker Modal
 *
 * Modal for selecting emoji or NFT avatar.
 */

import { useState, useEffect } from 'react';
import { IonModal, IonButton, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import { useSageWallet } from '@/sage-wallet';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Avatar } from '../Avatar/Avatar';
import { EmojiPicker } from './EmojiPicker';
import { NFTPicker, type NFT } from './NFTPicker';
import { getRandomDefaultEmoji, type UserAvatar } from '@/types/avatar';
import './AvatarPicker.css';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarPickerModal({ isOpen, onClose }: AvatarPickerModalProps) {
  const { profile, updateAvatar } = useUserProfile();
  const { status: walletStatus, connect: connectWallet } = useSageWallet();

  const [activeTab, setActiveTab] = useState<'emoji' | 'nft'>('emoji');
  const [selectedEmoji, setSelectedEmoji] = useState(
    profile?.avatar?.type === 'emoji' ? profile.avatar.value : getRandomDefaultEmoji()
  );
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Determine if wallet is connected
  const isWalletConnected = walletStatus === 'connected';

  // Handle emoji selection - auto-save
  const handleEmojiSelect = async (emoji: string) => {
    setSelectedEmoji(emoji);
    setIsSaving(true);
    try {
      const newAvatar: UserAvatar = {
        type: 'emoji',
        value: emoji,
        source: 'user', // User-selected, not default
      };
      await updateAvatar(newAvatar);
      onClose();
    } catch (error) {
      console.error('Failed to save avatar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle NFT selection - auto-save
  const handleNftSelect = async (nft: NFT) => {
    setSelectedNft(nft);
    setIsSaving(true);
    try {
      const newAvatar: UserAvatar = {
        type: 'nft',
        value: nft.imageUrl, // IPFS URL
        source: 'wallet',
        nftId: nft.id,
        nftLauncherId: nft.launcherId,
      };
      await updateAvatar(newAvatar);
      onClose();
    } catch (error) {
      console.error('Failed to save avatar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setActiveTab('nft');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // Update selected emoji when profile changes
  useEffect(() => {
    if (profile?.avatar?.type === 'emoji') {
      setSelectedEmoji(profile.avatar.value);
    }
  }, [profile?.avatar]);

  // Determine preview avatar
  const previewType = activeTab === 'nft' && selectedNft ? 'nft' : 'emoji';
  const previewValue = activeTab === 'nft' && selectedNft ? selectedNft.imageUrl : selectedEmoji;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="avatar-picker-modal">
      <div className="avatar-picker-content">
        <div className="avatar-picker-header">
          <h2>Choose Your Avatar</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Current Avatar Preview */}
        <div className="current-avatar-preview">
          <Avatar
            type={previewType}
            value={previewValue}
            size="xlarge"
            isNftHolder={previewType === 'nft'}
          />
        </div>

        {/* Tab Selector */}
        <IonSegment
          value={activeTab}
          onIonChange={(e) => setActiveTab(e.detail.value as 'emoji' | 'nft')}
          className="avatar-tabs"
        >
          <IonSegmentButton value="emoji">
            <IonLabel>Emoji</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="nft">
            <IonLabel>
              NFT
              {!isWalletConnected && <span className="lock-badge">🔒</span>}
            </IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Tab Content */}
        <div className="avatar-picker-body">
          {activeTab === 'emoji' ? (
            <EmojiPicker
              selectedEmoji={selectedEmoji}
              onSelect={handleEmojiSelect}
            />
          ) : (
            <>
              {!isWalletConnected ? (
                <div className="connect-wallet-prompt">
                  <div className="wallet-icon">👛</div>
                  <h3>Unlock NFT Avatars</h3>
                  <p>Connect your wallet to use Wojak NFTs as your avatar with premium gold styling!</p>
                  <IonButton onClick={handleConnectWallet} className="connect-wallet-button">
                    Connect Wallet
                  </IonButton>
                </div>
              ) : (
                <NFTPicker
                  selectedNftId={selectedNft?.id}
                  onSelect={handleNftSelect}
                />
              )}
            </>
          )}
        </div>

        {/* Loading indicator */}
        {isSaving && (
          <div className="saving-overlay">
            <span>Saving...</span>
          </div>
        )}
      </div>
    </IonModal>
  );
}

export default AvatarPickerModal;

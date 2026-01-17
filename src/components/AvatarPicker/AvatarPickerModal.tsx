/**
 * Avatar Picker Modal
 *
 * Modal for selecting emoji or NFT avatar.
 */

import React, { useState } from 'react';
import { IonModal, IonButton, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../Avatar/Avatar';
import { EmojiPicker } from './EmojiPicker';
import { NFTPicker } from './NFTPicker';
import './AvatarPicker.css';

interface NFT {
  id: string;
  name: string;
  imageUrl: string;
  collection: string;
}

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, updateAvatar, connectWallet } = useAuth();
  const [activeTab, setActiveTab] = useState<'emoji' | 'nft'>('emoji');
  const [selectedEmoji, setSelectedEmoji] = useState(
    user?.avatar.type === 'emoji' ? user.avatar.value : '🍊'
  );
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'emoji') {
        await updateAvatar({
          type: 'emoji',
          value: selectedEmoji
        });
      } else if (selectedNft) {
        await updateAvatar({
          type: 'nft',
          value: selectedNft.imageUrl,
          nftId: selectedNft.id,
          nftCollection: selectedNft.collection
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save avatar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectWallet = async () => {
    const address = await connectWallet();
    if (address) {
      setActiveTab('nft');
    }
  };

  // Update selected emoji when user changes
  React.useEffect(() => {
    if (user?.avatar.type === 'emoji') {
      setSelectedEmoji(user.avatar.value);
    }
  }, [user?.avatar]);

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
            type={activeTab === 'nft' && selectedNft ? 'nft' : 'emoji'}
            value={activeTab === 'nft' && selectedNft ? selectedNft.imageUrl : selectedEmoji}
            size="xlarge"
            isNftHolder={activeTab === 'nft' && !!selectedNft}
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
              {!user?.walletAddress && <span className="lock-badge">🔒</span>}
            </IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Tab Content */}
        <div className="avatar-picker-body">
          {activeTab === 'emoji' ? (
            <EmojiPicker
              selectedEmoji={selectedEmoji}
              onSelect={setSelectedEmoji}
            />
          ) : (
            <>
              {!user?.walletAddress ? (
                <div className="connect-wallet-prompt">
                  <div className="wallet-icon">👛</div>
                  <h3>Unlock NFT Avatars</h3>
                  <p>Connect your wallet to use Wojak NFTs as your avatar and compete on the global leaderboard!</p>
                  <IonButton onClick={handleConnectWallet} className="connect-wallet-button">
                    Connect Wallet
                  </IonButton>
                </div>
              ) : (
                <NFTPicker
                  selectedNftId={selectedNft?.id || null}
                  onSelect={setSelectedNft}
                />
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="avatar-picker-actions">
          <IonButton fill="outline" onClick={onClose}>
            Cancel
          </IonButton>
          <IonButton
            onClick={handleSave}
            disabled={isSaving || (activeTab === 'nft' && !selectedNft)}
          >
            {isSaving ? 'Saving...' : 'Save Avatar'}
          </IonButton>
        </div>
      </div>
    </IonModal>
  );
};

export default AvatarPickerModal;

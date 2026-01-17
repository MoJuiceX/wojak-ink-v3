# IMPLEMENTATION PROMPT 01: Authentication + Avatar System

## Overview
Build a complete authentication system with Google OAuth and wallet connection, featuring a dual-avatar system where users get random emoji avatars by default and can unlock NFT avatars by connecting their Chia wallet.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  NEW USER                                                        │
│  └── Google Sign-In                                             │
│      └── Create Profile                                          │
│          └── Assign Random Emoji Avatar                         │
│          └── Prompt for Username                                │
│          └── Save to Database                                    │
│                                                                  │
│  RETURNING USER                                                  │
│  └── Google Sign-In                                             │
│      └── Load Existing Profile                                  │
│      └── Sync Avatar & Settings                                 │
│                                                                  │
│  WALLET CONNECTION (Optional)                                    │
│  └── Connect Sage Wallet / WalletConnect                        │
│      └── Read Wojak NFT Holdings                                │
│      └── Unlock NFT Avatar Selection                            │
│      └── Enable Leaderboard Competition                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Google OAuth Authentication

### 1.1 Install Dependencies
```bash
npm install @react-oauth/google jwt-decode
```

### 1.2 Create Auth Context
Create `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Types
interface User {
  id: string;
  email: string;
  googleId: string;
  username: string;
  displayName: string;
  avatar: AvatarData;
  walletAddress: string | null;
  createdAt: Date;
  lastLoginAt: Date;
}

interface AvatarData {
  type: 'emoji' | 'nft';
  value: string; // Emoji character OR NFT image URL
  nftId?: string; // If NFT, the token ID
  nftCollection?: string; // Collection name
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: (credential: string) => Promise<void>;
  signOut: () => void;
  updateUsername: (username: string) => Promise<boolean>;
  updateAvatar: (avatar: AvatarData) => Promise<void>;
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google Client ID - store in environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Validate token with backend
        const response = await fetch('/api/auth/validate', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (credential: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });

      if (!response.ok) throw new Error('Authentication failed');

      const { user: userData, token, isNewUser } = await response.json();

      localStorage.setItem('auth_token', token);
      setUser(userData);

      // If new user, trigger onboarding flow
      if (isNewUser) {
        // This will be handled by the UI to show username picker
        return;
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const updateUsername = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ username })
      });

      if (response.status === 409) {
        // Username taken
        return false;
      }

      if (!response.ok) throw new Error('Update failed');

      const updatedUser = await response.json();
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Username update failed:', error);
      return false;
    }
  };

  const updateAvatar = async (avatar: AvatarData) => {
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ avatar })
      });

      if (!response.ok) throw new Error('Avatar update failed');

      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (error) {
      console.error('Avatar update failed:', error);
      throw error;
    }
  };

  const connectWallet = async (): Promise<string | null> => {
    // Implementation depends on Sage Wallet / WalletConnect SDK
    // This is a placeholder for the wallet connection logic
    try {
      // TODO: Implement Sage Wallet connection
      // const wallet = await SageWallet.connect();
      // return wallet.address;
      return null;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return null;
    }
  };

  const disconnectWallet = () => {
    if (user) {
      setUser({ ...user, walletAddress: null });
      // Also update backend
      fetch('/api/user/wallet/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      });
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthContext.Provider
        value={{
          user,
          isLoading,
          isAuthenticated: !!user,
          signInWithGoogle,
          signOut,
          updateUsername,
          updateAvatar,
          connectWallet,
          disconnectWallet
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Part 2: Avatar System

### 2.1 Emoji Avatar Set
Create `src/constants/avatars.ts`:

```typescript
// Curated set of 20 fun, inclusive emojis for random assignment
export const EMOJI_AVATARS = [
  '🍊', // Orange (on-brand)
  '🎯', // Target
  '🚀', // Rocket
  '🔥', // Fire
  '⚡', // Lightning
  '💎', // Diamond
  '🌟', // Star
  '🎪', // Circus tent
  '🎨', // Art palette
  '🎭', // Theater masks
  '👻', // Ghost
  '🤖', // Robot
  '🦊', // Fox
  '🐱', // Cat
  '🎃', // Pumpkin
  '💀', // Skull
  '🌈', // Rainbow
  '🍀', // Clover
  '🎵', // Music note
  '⭐', // Star
] as const;

export type EmojiAvatar = typeof EMOJI_AVATARS[number];

// Get random emoji for new users
export const getRandomEmoji = (): EmojiAvatar => {
  const index = Math.floor(Math.random() * EMOJI_AVATARS.length);
  return EMOJI_AVATARS[index];
};

// Avatar display sizes
export const AVATAR_SIZES = {
  small: 32,   // Leaderboard rows
  medium: 48,  // Navigation, comments
  large: 80,   // Profile page
  xlarge: 120, // Profile edit modal
} as const;
```

### 2.2 Avatar Component
Create `src/components/Avatar/Avatar.tsx`:

```typescript
import React from 'react';
import './Avatar.css';

interface AvatarProps {
  type: 'emoji' | 'nft';
  value: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showBorder?: boolean;
  isNftHolder?: boolean; // Shows special border for NFT holders
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  type,
  value,
  size = 'medium',
  showBorder = true,
  isNftHolder = false,
  onClick
}) => {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 80,
    xlarge: 120
  };

  const pixelSize = sizeMap[size];

  return (
    <div
      className={`avatar avatar-${size} ${showBorder ? 'avatar-bordered' : ''} ${isNftHolder ? 'avatar-nft-holder' : ''} ${onClick ? 'avatar-clickable' : ''}`}
      style={{ width: pixelSize, height: pixelSize }}
      onClick={onClick}
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
        />
      )}

      {/* NFT holder badge */}
      {isNftHolder && (
        <div className="avatar-nft-badge" title="Wojak NFT Holder">
          <span>✓</span>
        </div>
      )}
    </div>
  );
};
```

### 2.3 Avatar Styles
Create `src/components/Avatar/Avatar.css`:

```css
.avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 140, 50, 0.2), rgba(255, 100, 50, 0.1));
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-bordered {
  border: 2px solid rgba(255, 140, 50, 0.5);
  box-shadow: 0 2px 8px rgba(255, 140, 50, 0.2);
}

.avatar-nft-holder {
  border: 2px solid #FFD700;
  box-shadow:
    0 0 10px rgba(255, 215, 0, 0.4),
    0 0 20px rgba(255, 215, 0, 0.2);
  animation: nftGlow 2s ease-in-out infinite;
}

@keyframes nftGlow {
  0%, 100% {
    box-shadow:
      0 0 10px rgba(255, 215, 0, 0.4),
      0 0 20px rgba(255, 215, 0, 0.2);
  }
  50% {
    box-shadow:
      0 0 15px rgba(255, 215, 0, 0.6),
      0 0 30px rgba(255, 215, 0, 0.3);
  }
}

.avatar-clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.avatar-clickable:hover {
  transform: scale(1.05);
}

.avatar-emoji {
  line-height: 1;
  user-select: none;
}

.avatar-nft-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-nft-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #000;
  font-weight: bold;
  border: 2px solid #1a1a2e;
}

/* Size variations */
.avatar-small .avatar-nft-badge {
  width: 14px;
  height: 14px;
  font-size: 8px;
}

.avatar-large .avatar-nft-badge {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.avatar-xlarge .avatar-nft-badge {
  width: 32px;
  height: 32px;
  font-size: 16px;
}
```

---

## Part 3: Avatar Picker Modal

### 3.1 Emoji Picker
Create `src/components/AvatarPicker/EmojiPicker.tsx`:

```typescript
import React from 'react';
import { EMOJI_AVATARS } from '../../constants/avatars';
import './AvatarPicker.css';

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  selectedEmoji,
  onSelect
}) => {
  return (
    <div className="emoji-picker">
      <h3 className="picker-title">Choose Your Emoji Avatar</h3>
      <div className="emoji-grid">
        {EMOJI_AVATARS.map((emoji) => (
          <button
            key={emoji}
            className={`emoji-option ${selectedEmoji === emoji ? 'selected' : ''}`}
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 3.2 NFT Picker (for wallet-connected users)
Create `src/components/AvatarPicker/NFTPicker.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
    }
  }, [user?.walletAddress]);

  const fetchUserNFTs = async () => {
    setIsLoading(true);
    try {
      // Fetch Wojak NFTs owned by the wallet
      const response = await fetch(`/api/nfts/wojak/${user?.walletAddress}`);
      const data = await response.json();
      setNfts(data.nfts);
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
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
        <div className="spinner"></div>
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
        <a href="https://mintgarden.io/collections/wojak" target="_blank" rel="noopener noreferrer" className="get-nft-button">
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
          >
            <img src={nft.imageUrl} alt={nft.name} />
            <span className="nft-name">{nft.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 3.3 Complete Avatar Picker Modal
Create `src/components/AvatarPicker/AvatarPickerModal.tsx`:

```typescript
import React, { useState } from 'react';
import { IonModal, IonButton, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../Avatar/Avatar';
import { EmojiPicker } from './EmojiPicker';
import { NFTPicker } from './NFTPicker';
import './AvatarPicker.css';

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
  const [selectedNft, setSelectedNft] = useState<any>(null);
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

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="avatar-picker-modal">
      <div className="avatar-picker-content">
        <div className="avatar-picker-header">
          <h2>Choose Your Avatar</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {/* Current Avatar Preview */}
        <div className="current-avatar-preview">
          <Avatar
            type={activeTab === 'nft' && selectedNft ? 'nft' : 'emoji'}
            value={activeTab === 'nft' && selectedNft ? selectedNft.imageUrl : selectedEmoji}
            size="xlarge"
            isNftHolder={activeTab === 'nft' && selectedNft}
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
```

---

## Part 4: Username System

### 4.1 Username Validation
Create `src/utils/validation.ts`:

```typescript
export const USERNAME_RULES = {
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9_]+$/, // Alphanumeric and underscore only
};

export interface UsernameValidation {
  isValid: boolean;
  error?: string;
}

export const validateUsername = (username: string): UsernameValidation => {
  if (username.length < USERNAME_RULES.minLength) {
    return {
      isValid: false,
      error: `Username must be at least ${USERNAME_RULES.minLength} characters`
    };
  }

  if (username.length > USERNAME_RULES.maxLength) {
    return {
      isValid: false,
      error: `Username must be ${USERNAME_RULES.maxLength} characters or less`
    };
  }

  if (!USERNAME_RULES.pattern.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores'
    };
  }

  // Check for reserved/inappropriate words
  const reservedWords = ['admin', 'system', 'wojak', 'official', 'mod', 'moderator'];
  if (reservedWords.includes(username.toLowerCase())) {
    return {
      isValid: false,
      error: 'This username is reserved'
    };
  }

  return { isValid: true };
};

// Generate username suggestions when desired name is taken
export const generateUsernameSuggestions = (baseName: string): string[] => {
  const suggestions: string[] = [];
  const cleanBase = baseName.slice(0, 15); // Leave room for suffix

  // Add numbers
  suggestions.push(`${cleanBase}${Math.floor(Math.random() * 100)}`);
  suggestions.push(`${cleanBase}${new Date().getFullYear() % 100}`);

  // Add suffixes
  const suffixes = ['_OG', '_Pro', '_Fan', 'gg', '_x'];
  suffixes.forEach(suffix => {
    if ((cleanBase + suffix).length <= 20) {
      suggestions.push(`${cleanBase}${suffix}`);
    }
  });

  return suggestions.slice(0, 4);
};
```

### 4.2 Username Picker Component
Create `src/components/UsernamePicker/UsernamePicker.tsx`:

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { IonInput, IonButton, IonSpinner } from '@ionic/react';
import { useAuth } from '../../contexts/AuthContext';
import { validateUsername, generateUsernameSuggestions } from '../../utils/validation';
import debounce from 'lodash/debounce';
import './UsernamePicker.css';

interface UsernamePickerProps {
  onComplete: () => void;
  isOnboarding?: boolean;
}

export const UsernamePicker: React.FC<UsernamePickerProps> = ({
  onComplete,
  isOnboarding = false
}) => {
  const { user, updateUsername } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Debounced availability check
  const checkAvailability = useCallback(
    debounce(async (name: string) => {
      if (name.length < 3) {
        setIsAvailable(null);
        return;
      }

      setIsChecking(true);
      try {
        const response = await fetch(`/api/user/username/check?username=${encodeURIComponent(name)}`);
        const { available } = await response.json();
        setIsAvailable(available);

        if (!available) {
          setSuggestions(generateUsernameSuggestions(name));
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Availability check failed:', error);
      } finally {
        setIsChecking(false);
      }
    }, 500),
    []
  );

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);

    const validation = validateUsername(cleaned);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
      setIsAvailable(null);
    } else {
      setValidationError(null);
      checkAvailability(cleaned);
    }
  };

  const handleSave = async () => {
    if (!isAvailable || validationError) return;

    setIsSaving(true);
    const success = await updateUsername(username);
    setIsSaving(false);

    if (success) {
      onComplete();
    } else {
      setIsAvailable(false);
      setSuggestions(generateUsernameSuggestions(username));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUsername(suggestion);
    checkAvailability(suggestion);
  };

  return (
    <div className="username-picker">
      {isOnboarding && (
        <div className="onboarding-header">
          <h2>Welcome to Wojak Games! 🎮</h2>
          <p>Choose a unique username for the leaderboards</p>
        </div>
      )}

      <div className="username-input-container">
        <IonInput
          value={username}
          onIonInput={(e) => handleUsernameChange(e.detail.value || '')}
          placeholder="Enter username..."
          maxlength={20}
          className={`username-input ${
            validationError ? 'invalid' :
            isAvailable === true ? 'valid' :
            isAvailable === false ? 'taken' : ''
          }`}
        />

        <div className="input-status">
          {isChecking && <IonSpinner name="crescent" />}
          {!isChecking && isAvailable === true && <span className="status-available">✓ Available</span>}
          {!isChecking && isAvailable === false && <span className="status-taken">✗ Taken</span>}
        </div>
      </div>

      {validationError && (
        <p className="validation-error">{validationError}</p>
      )}

      {suggestions.length > 0 && (
        <div className="suggestions">
          <p>Try one of these:</p>
          <div className="suggestion-buttons">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <IonButton
        onClick={handleSave}
        disabled={!isAvailable || !!validationError || isSaving}
        expand="block"
        className="save-button"
      >
        {isSaving ? 'Saving...' : isOnboarding ? 'Continue' : 'Save Username'}
      </IonButton>

      {isOnboarding && (
        <button className="skip-button" onClick={onComplete}>
          Skip for now
        </button>
      )}
    </div>
  );
};
```

---

## Part 5: Backend API Endpoints (Reference)

These endpoints need to be implemented on your backend:

```typescript
// POST /api/auth/google
// Handles Google OAuth, creates/returns user
{
  request: { credential: string },
  response: { user: User, token: string, isNewUser: boolean }
}

// GET /api/auth/validate
// Validates JWT token, returns user
{
  headers: { Authorization: 'Bearer <token>' },
  response: User
}

// PUT /api/user/username
// Updates username (checks uniqueness)
{
  request: { username: string },
  response: User | { error: 'username_taken', status: 409 }
}

// GET /api/user/username/check
// Checks username availability
{
  query: { username: string },
  response: { available: boolean }
}

// PUT /api/user/avatar
// Updates user avatar
{
  request: { avatar: AvatarData },
  response: User
}

// GET /api/nfts/wojak/:walletAddress
// Fetches Wojak NFTs owned by wallet
{
  response: { nfts: NFT[] }
}

// POST /api/user/wallet/connect
// Links wallet address to user account
{
  request: { walletAddress: string, signature: string },
  response: User
}

// POST /api/user/wallet/disconnect
// Unlinks wallet from user account
{
  response: { success: boolean }
}
```

---

## Part 6: Database Schema (Reference)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(20) UNIQUE,
  username_lower VARCHAR(20) UNIQUE, -- For case-insensitive checks
  display_name VARCHAR(50),

  -- Avatar
  avatar_type VARCHAR(10) DEFAULT 'emoji', -- 'emoji' or 'nft'
  avatar_value TEXT NOT NULL, -- Emoji char or NFT image URL
  avatar_nft_id VARCHAR(255),
  avatar_nft_collection VARCHAR(255),

  -- Wallet
  wallet_address VARCHAR(255) UNIQUE,
  wallet_connected_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for username lookups
CREATE INDEX idx_users_username_lower ON users(username_lower);
CREATE INDEX idx_users_wallet ON users(wallet_address);
```

---

## Implementation Checklist

- [ ] Set up Google OAuth credentials in Google Cloud Console
- [ ] Add `VITE_GOOGLE_CLIENT_ID` to environment variables
- [ ] Create AuthContext and AuthProvider
- [ ] Implement Avatar component with emoji/NFT support
- [ ] Build AvatarPickerModal with tab switching
- [ ] Create UsernamePicker with real-time validation
- [ ] Style all components with premium glassmorphism theme
- [ ] Implement backend API endpoints
- [ ] Set up database tables
- [ ] Test full authentication flow
- [ ] Test avatar selection (emoji and NFT)
- [ ] Test username uniqueness checking
- [ ] Integrate with existing game screens

---

## Notes for Future: Wallet Integration

The wallet connection implementation will depend on:
1. **Sage Wallet SDK** - For direct Chia wallet integration
2. **WalletConnect** - For broader wallet support

This will be implemented in a separate prompt focused on wallet integration and NFT verification.

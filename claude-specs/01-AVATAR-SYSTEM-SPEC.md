# SPEC 01: Avatar System Refactor

> **For Claude CLI**: This specification contains all the code patterns, file paths, and implementation details you need. Follow this spec exactly.

---

## Overview

Refactor the avatar and leaderboard system:
1. Only Google-authenticated users can submit scores to leaderboards
2. Non-logged-in users can VIEW leaderboards but cannot submit scores
3. New users get a random default emoji avatar + Google first name as display name
4. Users can change their emoji from a curated list of 15 emojis
5. Users who connect wallet and own Wojak Farmers Plot NFTs can select an NFT as avatar
6. NFT avatars get premium visual treatment (gold glow, verified badge)
7. Display name set by user ALWAYS overrides Google name (never show "Anonymous")

---

## Files to Create

### 1. Create Avatar Types
**File: `src/types/avatar.ts`**

```typescript
/**
 * Avatar Type Definitions
 *
 * Tiered avatar system:
 * - Emoji avatars (default or user-selected)
 * - NFT avatars (premium, from Wojak Farmers Plot collection)
 */

export interface UserAvatar {
  type: 'emoji' | 'nft';
  value: string; // Emoji character OR IPFS image URL
  source: 'default' | 'user' | 'wallet';
  // Only for NFT avatars:
  nftId?: string; // e.g., "0042" - the edition number
  nftLauncherId?: string; // MintGarden encoded_id for linking
}

// 15 curated emojis - visually distinct, no conflicts with currencies (no 🍊💎🏆⭐🌟🌈)
export const DEFAULT_EMOJIS = [
  '🎮', // gaming
  '🔥', // fire
  '🚀', // rocket
  '🎯', // target
  '🦊', // fox
  '🐸', // frog
  '👾', // alien/retro
  '🤖', // robot
  '🎪', // circus
  '🌸', // flower
  '🍕', // pizza
  '🎸', // guitar
  '⚡', // lightning
  '🦁', // lion
  '🐙', // octopus
] as const;

export type DefaultEmoji = typeof DEFAULT_EMOJIS[number];

export function getRandomDefaultEmoji(): DefaultEmoji {
  return DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)];
}

export function isValidEmoji(emoji: string): boolean {
  return DEFAULT_EMOJIS.includes(emoji as DefaultEmoji);
}

// Default avatar for new users
export function createDefaultAvatar(): UserAvatar {
  return {
    type: 'emoji',
    value: getRandomDefaultEmoji(),
    source: 'default',
  };
}
```

---

### 2. Create Emoji Picker Component
**File: `src/components/AvatarPicker/EmojiPicker.tsx`**

```typescript
/**
 * EmojiPicker Component
 *
 * Grid of 15 curated emojis for avatar selection.
 * Used in AvatarPickerModal.
 */

import { DEFAULT_EMOJIS } from '@/types/avatar';
import './EmojiPicker.css';

interface EmojiPickerProps {
  selectedEmoji?: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selectedEmoji, onSelect }: EmojiPickerProps) {
  return (
    <div className="emoji-picker">
      <p className="emoji-picker-hint">Choose your avatar emoji</p>
      <div className="emoji-grid">
        {DEFAULT_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={`emoji-option ${selectedEmoji === emoji ? 'selected' : ''}`}
            onClick={() => onSelect(emoji)}
            aria-label={`Select ${emoji} as avatar`}
            aria-pressed={selectedEmoji === emoji}
          >
            <span className="emoji-char">{emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**File: `src/components/AvatarPicker/EmojiPicker.css`**

```css
.emoji-picker {
  padding: 1rem;
}

.emoji-picker-hint {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  max-width: 280px;
  margin: 0 auto;
}

.emoji-option {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid var(--color-border);
  background: var(--color-bg-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.emoji-option:hover {
  border-color: var(--color-brand-primary);
  transform: scale(1.1);
}

.emoji-option.selected {
  border-color: var(--color-brand-primary);
  background: rgba(249, 115, 22, 0.1);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.3);
}

.emoji-char {
  font-size: 1.5rem;
  line-height: 1;
}
```

---

## Files to Modify

### 3. Update UserProfileContext
**File: `src/contexts/UserProfileContext.tsx`**

**Changes needed:**

1. Import new avatar types:
```typescript
import { UserAvatar, createDefaultAvatar, getRandomDefaultEmoji } from '@/types/avatar';
import { getNftImageUrl } from '@/services/constants';
```

2. Update UserProfile interface (add after `lastPlayedDate`):
```typescript
export interface UserProfile {
  displayName: string | null;
  xHandle: string | null;
  walletAddress: string | null;
  updatedAt: string | null;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  // NEW: Avatar fields
  avatar: UserAvatar;
  ownedNftIds: string[]; // List of NFT edition numbers user owns
}
```

3. Update UserProfileContextValue interface:
```typescript
interface UserProfileContextValue extends UserProfileState {
  // Existing methods...
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;

  // NEW: Avatar methods
  updateAvatar: (avatar: UserAvatar) => Promise<boolean>;
  refreshOwnedNfts: () => Promise<void>;

  // NEW: Computed display name (NEVER returns "Anonymous")
  effectiveDisplayName: string;

  // Existing Clerk user info...
  clerkUser: { ... } | null;
  isSignedIn: boolean;
}
```

4. Add effectiveDisplayName computed value in provider:
```typescript
// Inside UserProfileProvider, before the return
const effectiveDisplayName = useMemo(() => {
  // Priority: custom display name > Google first name > email prefix > "Player"
  if (state.profile?.displayName) return state.profile.displayName;
  if (clerkUser?.firstName) return clerkUser.firstName;
  if (clerkUser?.email) return clerkUser.email.split('@')[0];
  return 'Player';
}, [state.profile?.displayName, clerkUser?.firstName, clerkUser?.email]);
```

5. Initialize default avatar on first sign-in. In fetchProfile function, after successful API response:
```typescript
// If no avatar in profile, create default
if (profile && !profile.avatar) {
  profile.avatar = createDefaultAvatar();
}
```

6. Add updateAvatar method:
```typescript
const updateAvatar = useCallback(async (avatar: UserAvatar): Promise<boolean> => {
  return updateProfile({ avatar });
}, [updateProfile]);
```

7. Add refreshOwnedNfts method (requires useSageWallet hook):
```typescript
const { getNFTs, address: walletAddress } = useSageWallet();
const WOJAK_COLLECTION_ID = 'col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

const refreshOwnedNfts = useCallback(async () => {
  if (!walletAddress) {
    // No wallet connected - if avatar is NFT, fall back to emoji
    if (state.profile?.avatar?.type === 'nft') {
      await updateAvatar(createDefaultAvatar());
    }
    await updateProfile({ ownedNftIds: [] });
    return;
  }

  try {
    const nfts = await getNFTs(WOJAK_COLLECTION_ID);
    // Extract edition numbers from NFT names like "Wojak Farmers Plot #0042"
    const ownedIds = nfts.map(nft => {
      const match = nft.name.match(/#(\d+)/);
      return match ? match[1] : null;
    }).filter(Boolean) as string[];

    await updateProfile({ ownedNftIds: ownedIds });

    // If current NFT avatar is no longer owned, fall back
    const currentNftId = state.profile?.avatar?.nftId;
    if (state.profile?.avatar?.type === 'nft' && currentNftId) {
      if (!ownedIds.includes(currentNftId)) {
        // Try another owned NFT, or fall back to emoji
        if (ownedIds.length > 0) {
          const fallbackId = ownedIds[0];
          await updateAvatar({
            type: 'nft',
            value: getNftImageUrl(fallbackId),
            source: 'wallet',
            nftId: fallbackId,
          });
        } else {
          await updateAvatar(createDefaultAvatar());
        }
      }
    }
  } catch (error) {
    console.error('[UserProfile] Failed to refresh owned NFTs:', error);
  }
}, [walletAddress, getNFTs, state.profile?.avatar, updateAvatar, updateProfile]);
```

---

### 4. Update Profile API
**File: `functions/api/profile.ts`**

Add avatar fields to the database operations:

1. Update the SELECT query to include avatar fields:
```typescript
const selectQuery = `
  SELECT
    display_name, x_handle, wallet_address, updated_at,
    current_streak, longest_streak, last_played_date,
    avatar_type, avatar_value, avatar_source, avatar_nft_id, avatar_nft_launcher_id,
    owned_nft_ids
  FROM profiles
  WHERE user_id = ?
`;
```

2. Update the INSERT/UPDATE query:
```typescript
const upsertQuery = `
  INSERT INTO profiles (
    user_id, display_name, x_handle, wallet_address, updated_at,
    avatar_type, avatar_value, avatar_source, avatar_nft_id, avatar_nft_launcher_id,
    owned_nft_ids
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(user_id) DO UPDATE SET
    display_name = COALESCE(excluded.display_name, profiles.display_name),
    x_handle = COALESCE(excluded.x_handle, profiles.x_handle),
    wallet_address = COALESCE(excluded.wallet_address, profiles.wallet_address),
    avatar_type = COALESCE(excluded.avatar_type, profiles.avatar_type),
    avatar_value = COALESCE(excluded.avatar_value, profiles.avatar_value),
    avatar_source = COALESCE(excluded.avatar_source, profiles.avatar_source),
    avatar_nft_id = excluded.avatar_nft_id,
    avatar_nft_launcher_id = excluded.avatar_nft_launcher_id,
    owned_nft_ids = COALESCE(excluded.owned_nft_ids, profiles.owned_nft_ids),
    updated_at = excluded.updated_at
`;
```

3. Add validation for avatar updates in POST handler:
```typescript
// Validate avatar if provided
if (body.avatar) {
  const { type, value, source, nftId } = body.avatar;

  if (type === 'nft') {
    // NFT avatar requires wallet to be connected
    const walletAddress = body.walletAddress || existingProfile?.walletAddress;
    if (!walletAddress) {
      return new Response(JSON.stringify({
        error: 'Wallet must be connected to use NFT avatar'
      }), { status: 400 });
    }
  }

  if (type === 'emoji' && source === 'user') {
    // Validate emoji is in allowed list
    const VALID_EMOJIS = ['🎮', '🔥', '🚀', '🎯', '🦊', '🐸', '👾', '🤖', '🎪', '🌸', '🍕', '🎸', '⚡', '🦁', '🐙'];
    if (!VALID_EMOJIS.includes(value)) {
      return new Response(JSON.stringify({
        error: 'Invalid emoji selection'
      }), { status: 400 });
    }
  }
}
```

4. Map response to include avatar:
```typescript
const profile = {
  displayName: row.display_name,
  xHandle: row.x_handle,
  walletAddress: row.wallet_address,
  updatedAt: row.updated_at,
  currentStreak: row.current_streak || 0,
  longestStreak: row.longest_streak || 0,
  lastPlayedDate: row.last_played_date,
  avatar: {
    type: row.avatar_type || 'emoji',
    value: row.avatar_value || '🎮',
    source: row.avatar_source || 'default',
    nftId: row.avatar_nft_id,
    nftLauncherId: row.avatar_nft_launcher_id,
  },
  ownedNftIds: row.owned_nft_ids ? JSON.parse(row.owned_nft_ids) : [],
};
```

---

### 5. Update NFTPicker Component
**File: `src/components/AvatarPicker/NFTPicker.tsx`**

Replace the demo data loading with real MintGarden API:

```typescript
/**
 * NFTPicker Component
 *
 * Displays user's owned Wojak Farmers Plot NFTs for avatar selection.
 * Uses Sage Wallet to fetch NFTs and IPFS URLs for images.
 */

import { useState, useEffect } from 'react';
import { useSageWallet } from '@/sage-wallet';
import { getNftImageUrl } from '@/services/constants';
import { Loader2 } from 'lucide-react';
import './NFTPicker.css';

const WOJAK_COLLECTION_ID = 'col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';
const MINTGARDEN_COLLECTION_URL = 'https://mintgarden.io/collections/wojak-farmers-plot-col1kfy44w3nlkqq8z3j8z9mhc3nw9pzwvlsmhsyhc0z6a7luvzukfsufegk5';

interface NFT {
  id: string;        // Edition number e.g., "0042"
  name: string;      // Full name e.g., "Wojak Farmers Plot #0042"
  imageUrl: string;  // IPFS URL
  launcherId: string; // MintGarden encoded_id
}

interface NFTPickerProps {
  selectedNftId?: string;
  onSelect: (nft: NFT) => void;
}

export function NFTPicker({ selectedNftId, onSelect }: NFTPickerProps) {
  const { address: walletAddress, getNFTs, status } = useSageWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNfts() {
      if (!walletAddress || status !== 'connected') {
        setNfts([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const mintGardenNfts = await getNFTs(WOJAK_COLLECTION_ID);

        // Map to our NFT format with IPFS URLs
        const mappedNfts: NFT[] = mintGardenNfts.map(nft => {
          // Extract edition number from name like "Wojak Farmers Plot #0042"
          const match = nft.name.match(/#(\d+)/);
          const editionNumber = match ? match[1].padStart(4, '0') : '0000';

          return {
            id: editionNumber,
            name: nft.name,
            imageUrl: getNftImageUrl(editionNumber), // IPFS URL
            launcherId: nft.encoded_id,
          };
        });

        // Sort by edition number
        mappedNfts.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setNfts(mappedNfts);
      } catch (err) {
        console.error('[NFTPicker] Failed to fetch NFTs:', err);
        setError('Failed to load NFTs');
      } finally {
        setIsLoading(false);
      }
    }

    fetchNfts();
  }, [walletAddress, status, getNFTs]);

  if (status !== 'connected' || !walletAddress) {
    return (
      <div className="nft-picker-locked">
        <span className="lock-icon">🔒</span>
        <p>Connect your Sage Wallet to use NFT avatars</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="nft-picker-loading">
        <Loader2 className="spin" size={32} />
        <p>Loading your NFTs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nft-picker-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="nft-picker-empty">
        <span className="empty-icon">🖼️</span>
        <p>No Wojak Farmers Plot NFTs found</p>
        <a
          href={MINTGARDEN_COLLECTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mint-link"
        >
          Get one on MintGarden →
        </a>
      </div>
    );
  }

  return (
    <div className="nft-picker">
      <p className="nft-picker-hint">
        Select an NFT as your avatar ({nfts.length} owned)
      </p>
      <div className="nft-grid">
        {nfts.map((nft) => (
          <button
            key={nft.id}
            type="button"
            className={`nft-option ${selectedNftId === nft.id ? 'selected' : ''}`}
            onClick={() => onSelect(nft)}
            aria-label={`Select ${nft.name} as avatar`}
            aria-pressed={selectedNftId === nft.id}
          >
            <img
              src={nft.imageUrl}
              alt={nft.name}
              loading="lazy"
            />
            <span className="nft-id">#{nft.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**File: `src/components/AvatarPicker/NFTPicker.css`**

```css
.nft-picker {
  padding: 1rem;
}

.nft-picker-hint {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.25rem;
}

.nft-option {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  border: 2px solid var(--color-border);
  background: var(--color-bg-secondary);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.nft-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-option:hover {
  border-color: #FFD700;
  transform: scale(1.05);
}

.nft-option.selected {
  border-color: #FFD700;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);
}

.nft-id {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 0.625rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

/* Empty/Loading/Error states */
.nft-picker-locked,
.nft-picker-loading,
.nft-picker-empty,
.nft-picker-error {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.lock-icon,
.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.nft-picker-loading .spin {
  animation: spin 1s linear infinite;
  color: var(--color-brand-primary);
  margin: 0 auto 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mint-link {
  display: inline-block;
  margin-top: 1rem;
  color: var(--color-brand-primary);
  text-decoration: none;
  font-weight: 500;
}

.mint-link:hover {
  text-decoration: underline;
}
```

---

### 6. Update AvatarPickerModal
**File: `src/components/AvatarPicker/AvatarPickerModal.tsx`**

Update to use new EmojiPicker and pass correct data:

```typescript
// Add imports
import { EmojiPicker } from './EmojiPicker';
import { UserAvatar } from '@/types/avatar';
import { getNftImageUrl } from '@/services/constants';

// Update the onSelect handlers:

// For emoji selection:
const handleEmojiSelect = (emoji: string) => {
  const newAvatar: UserAvatar = {
    type: 'emoji',
    value: emoji,
    source: 'user', // User-selected, not default
  };
  updateAvatar(newAvatar);
  onClose();
};

// For NFT selection:
const handleNftSelect = (nft: { id: string; name: string; imageUrl: string; launcherId: string }) => {
  const newAvatar: UserAvatar = {
    type: 'nft',
    value: nft.imageUrl, // IPFS URL
    source: 'wallet',
    nftId: nft.id,
    nftLauncherId: nft.launcherId,
  };
  updateAvatar(newAvatar);
  onClose();
};
```

---

### 7. Update Avatar Component
**File: `src/components/Avatar/Avatar.tsx`**

Update to handle new avatar source types and styling:

```typescript
// Update props interface
interface AvatarProps {
  avatar?: UserAvatar; // New: accept full avatar object
  // OR legacy props:
  type?: 'emoji' | 'nft';
  value?: string;
  // Common props:
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showBorder?: boolean;
  isNftHolder?: boolean; // Deprecated: use avatar.type === 'nft' instead
  highlighted?: boolean;
  onClick?: () => void;
  className?: string;
}

// Inside component, normalize props:
const avatarType = avatar?.type || type || 'emoji';
const avatarValue = avatar?.value || value || '🎮';
const isNft = avatarType === 'nft';

// Update className logic:
const avatarClass = cn(
  'avatar',
  `avatar-${size}`,
  {
    'avatar-emoji': !isNft,
    'avatar-nft': isNft,
    'avatar-highlighted': highlighted,
    'avatar-clickable': !!onClick,
  },
  className
);
```

**File: `src/components/Avatar/Avatar.css`**

Update/add styles for tiered system:

```css
/* Base avatar styles */
.avatar {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Size variants */
.avatar-small { width: 32px; height: 32px; }
.avatar-medium { width: 48px; height: 48px; }
.avatar-large { width: 80px; height: 80px; }
.avatar-xlarge { width: 120px; height: 120px; }

/* Emoji avatar - standard styling (same for default and user-selected) */
.avatar-emoji {
  border: 2px solid var(--color-brand-primary);
  background: var(--color-bg-secondary);
}

.avatar-emoji .avatar-content {
  font-size: 60%;
  line-height: 1;
}

/* NFT avatar - premium styling */
.avatar-nft {
  border: 2px solid #FFD700;
  box-shadow:
    0 0 12px rgba(255, 215, 0, 0.4),
    0 0 24px rgba(255, 215, 0, 0.2);
}

.avatar-nft img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Verified badge for NFT avatars */
.avatar-nft::after {
  content: '✓';
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: #FFD700;
  color: #000;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-bg-primary);
}

.avatar-small.avatar-nft::after {
  width: 14px;
  height: 14px;
  font-size: 8px;
}

/* Highlighted avatar (for featured players) */
.avatar-highlighted::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #FFD700,
    #FFA500,
    #FFD700,
    #FFA500,
    #FFD700
  );
  animation: avatar-spin 3s linear infinite;
  z-index: -1;
}

@keyframes avatar-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Clickable state */
.avatar-clickable {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-clickable:hover {
  transform: scale(1.05);
}
```

---

### 8. Update LeaderboardContext - Change Gating
**File: `src/contexts/LeaderboardContext.tsx`**

Find the `canUserCompete` function and update it:

```typescript
// OLD CODE (find and replace):
const canUserCompete = useCallback((): boolean => {
  return user?.avatar?.type === 'nft' && !!user?.walletAddress;
}, [user]);

// NEW CODE:
const canUserCompete = useCallback((): boolean => {
  // Only requires Google sign-in - NFT not required for leaderboard participation
  return isSignedIn;
}, [isSignedIn]);
```

Also update any places that block submission based on NFT status.

---

### 9. Update Game Over Screens
**File: `src/systems/game-ui/GameOverScreen.tsx`** (or wherever game over is handled)

Add authentication gate for score submission:

```typescript
import { SignInButton } from '@clerk/clerk-react';
import { useUserProfile } from '@/contexts/UserProfileContext';

// Inside component:
const { isSignedIn } = useUserProfile();

// In render:
{isSignedIn ? (
  // Existing score submission UI
  <div className="score-submission">
    {/* ... */}
  </div>
) : (
  <div className="sign-in-prompt">
    <p className="prompt-text">Sign in to save your score and compete on leaderboards!</p>
    <SignInButton mode="modal">
      <button className="sign-in-button">
        <span>Sign In with Google</span>
      </button>
    </SignInButton>
  </div>
)}
```

Add CSS for the prompt:
```css
.sign-in-prompt {
  text-align: center;
  padding: 2rem;
}

.prompt-text {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.sign-in-button {
  background: linear-gradient(135deg, #F97316, #EA580C);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.sign-in-button:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.3);
}
```

---

### 10. Remove/Repurpose NFT Gate Components
**Files to modify:**
- `src/components/Leaderboard/NFTGatePrompt.tsx`
- `src/components/Avatar/LeaderboardGate.tsx`

Either remove these components OR repurpose as promotional banners:

```typescript
// Convert to promotional banner instead of blocker
export function NftAvatarPromo() {
  const { profile } = useUserProfile();
  const { status } = useSageWallet();

  // Don't show if already has NFT avatar
  if (profile?.avatar?.type === 'nft') return null;

  return (
    <div className="nft-promo-banner">
      <span className="promo-icon">✨</span>
      <div className="promo-text">
        <strong>Upgrade to NFT Avatar</strong>
        <p>Get premium gold styling and a verified badge!</p>
      </div>
      {status === 'connected' ? (
        <button onClick={openAvatarPicker}>Select NFT</button>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
```

---

## Database Migration

**File: `migrations/003_avatar_fields.sql`**

```sql
-- Add avatar columns to profiles table
ALTER TABLE profiles ADD COLUMN avatar_type TEXT DEFAULT 'emoji';
ALTER TABLE profiles ADD COLUMN avatar_value TEXT DEFAULT '🎮';
ALTER TABLE profiles ADD COLUMN avatar_source TEXT DEFAULT 'default';
ALTER TABLE profiles ADD COLUMN avatar_nft_id TEXT;
ALTER TABLE profiles ADD COLUMN avatar_nft_launcher_id TEXT;
ALTER TABLE profiles ADD COLUMN owned_nft_ids TEXT;

-- Set default avatar value for existing rows that have NULL
UPDATE profiles
SET avatar_value = '🎮', avatar_type = 'emoji', avatar_source = 'default'
WHERE avatar_value IS NULL;
```

Run with: `npx wrangler d1 execute wojak-db --file=migrations/003_avatar_fields.sql`

---

## Key Constants Reference

**IPFS URL Generation** (from `src/services/constants.ts`):
```typescript
export const NFT_IPFS_CID = 'bafybeigjkkonjzwwpopo4wn4gwrrvb7z3nwr2edj2554vx3avc5ietfjwq';

export function getNftImageUrl(nftId: string | number): string {
  const paddedId = String(nftId).padStart(4, '0');
  return `https://${NFT_IPFS_CID}.ipfs.w3s.link/${paddedId}.png`;
}
```

**Collection ID**:
```typescript
const WOJAK_COLLECTION_ID = 'col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';
```

---

## Testing Checklist

- [ ] New user signs in → Gets random emoji from list + Google first name
- [ ] User edits display name → Custom name shows everywhere
- [ ] Display name is NEVER "Anonymous" - always Google name or custom name
- [ ] User picks different emoji → Avatar updates, source becomes 'user'
- [ ] Non-signed-in user sees leaderboard but cannot submit scores
- [ ] Game over shows "Sign in to save score" for non-authenticated users
- [ ] User connects wallet → NFT tab becomes available in avatar picker
- [ ] User with no NFTs → NFT tab shows empty state with MintGarden link
- [ ] User selects NFT → Avatar changes to NFT image with gold glow + ✓ badge
- [ ] NFT avatars use IPFS URLs (not MintGarden thumbnail URLs)
- [ ] User disconnects wallet → Avatar falls back to random emoji
- [ ] User sells NFT that was avatar → Falls back to another owned NFT, or emoji
- [ ] Emoji avatars all look the same (no visual difference between default/custom)
- [ ] NFT avatars have premium gold border, glow, and verified badge

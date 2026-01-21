# SPEC 03: Account Dashboard Page

> **For Claude CLI**: This specification contains all the code patterns, file paths, and implementation details you need. Follow this spec exactly.

---

## Overview

Create a comprehensive account dashboard that shows all user data. This page should also be viewable by other users as a public profile.

**Routes:**
- `/account` - Current user's account (editable)
- `/profile/:userId` - Public view of any user's profile (read-only)

---

## Dashboard Layout

Single scrolling page with these sections:

1. **Profile Header** - Avatar, name, account age, badges
2. **Currency & Voting Stats** - Oranges, Gems, Donuts, Poops
3. **Game Scores** - Personal best + rank for each active game
4. **NFT Collection** - Mini-gallery of owned Wojak NFTs
5. **Shop Inventory** - Purchased items with equip/unequip
6. **Recent Activity** - Last 5-10 activities
7. **Play Streak** - Current and longest streak (already exists)

---

## Files to Create

### 1. Account Dashboard Components Folder
**Create folder: `src/components/Account/`**

### 2. Profile Header Component
**File: `src/components/Account/ProfileHeader.tsx`**

```typescript
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
              💼 {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
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
```

### 3. Currency Stats Component
**File: `src/components/Account/CurrencyStats.tsx`**

```typescript
/**
 * CurrencyStats Component
 *
 * Displays oranges, gems, and voting emoji counts.
 */

import './Account.css';

interface CurrencyStatsProps {
  oranges: number;
  gems: number;
  donuts: number;
  poops: number;
  lifetimeOranges?: number;
  lifetimeGems?: number;
}

export function CurrencyStats({
  oranges,
  gems,
  donuts,
  poops,
  lifetimeOranges,
  lifetimeGems,
}: CurrencyStatsProps) {
  return (
    <div className="currency-stats">
      <h2 className="section-title">Currency & Voting</h2>

      <div className="stats-grid">
        <div className="stat-card stat-oranges">
          <span className="stat-icon">🍊</span>
          <div className="stat-content">
            <span className="stat-value">{oranges.toLocaleString()}</span>
            <span className="stat-label">Oranges</span>
            {lifetimeOranges !== undefined && (
              <span className="stat-lifetime">
                {lifetimeOranges.toLocaleString()} lifetime
              </span>
            )}
          </div>
        </div>

        <div className="stat-card stat-gems">
          <span className="stat-icon">💎</span>
          <div className="stat-content">
            <span className="stat-value">{gems.toLocaleString()}</span>
            <span className="stat-label">Gems</span>
            {lifetimeGems !== undefined && (
              <span className="stat-lifetime">
                {lifetimeGems.toLocaleString()} lifetime
              </span>
            )}
          </div>
        </div>

        <div className="stat-card stat-donuts">
          <span className="stat-icon">🍩</span>
          <div className="stat-content">
            <span className="stat-value">{donuts}</span>
            <span className="stat-label">Donuts</span>
            <span className="stat-hint">For game voting</span>
          </div>
        </div>

        <div className="stat-card stat-poops">
          <span className="stat-icon">💩</span>
          <div className="stat-content">
            <span className="stat-value">{poops}</span>
            <span className="stat-label">Poops</span>
            <span className="stat-hint">For game voting</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4. Game Scores Grid Component
**File: `src/components/Account/GameScoresGrid.tsx`**

```typescript
/**
 * GameScoresGrid Component
 *
 * Shows personal best score + rank for each active game.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Hash } from 'lucide-react';
import { MINI_GAMES } from '@/config/games';
import './Account.css';

interface GameScore {
  gameId: string;
  highScore: number;
  rank: number | null;
  lastPlayed: string | null;
}

interface GameScoresGridProps {
  userId: string;
  scores?: GameScore[]; // Pre-fetched scores, or fetch on mount
}

export function GameScoresGrid({ userId, scores: initialScores }: GameScoresGridProps) {
  const [scores, setScores] = useState<GameScore[]>(initialScores || []);
  const [isLoading, setIsLoading] = useState(!initialScores);

  // Get only active games (not disabled or coming soon)
  const activeGames = MINI_GAMES.filter(
    game => game.status === 'available' && !game.disabled
  );

  useEffect(() => {
    if (initialScores) return;

    async function fetchScores() {
      try {
        const response = await fetch(`/api/scores/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setScores(data.scores);
        }
      } catch (error) {
        console.error('Failed to fetch scores:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchScores();
  }, [userId, initialScores]);

  // Create a map for quick lookup
  const scoreMap = new Map(scores.map(s => [s.gameId, s]));

  return (
    <div className="game-scores-section">
      <h2 className="section-title">Game Scores</h2>

      <div className="games-grid">
        {activeGames.map((game) => {
          const score = scoreMap.get(game.id);

          return (
            <Link
              key={game.id}
              to={game.route || `/games/${game.id}`}
              className="game-score-card"
            >
              <span className="game-emoji">{game.emoji}</span>
              <div className="game-info">
                <span className="game-name">{game.name}</span>
                {score ? (
                  <div className="game-stats">
                    <span className="game-high-score">
                      <Trophy size={12} />
                      {score.highScore.toLocaleString()}
                    </span>
                    {score.rank && (
                      <span className="game-rank">
                        <Hash size={12} />
                        {score.rank}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="game-not-played">Not played yet</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

### 5. NFT Gallery Component
**File: `src/components/Account/NftGallery.tsx`**

```typescript
/**
 * NftGallery Component
 *
 * Mini-gallery of owned Wojak Farmers Plot NFTs.
 * Highlights the one currently set as avatar.
 */

import { ExternalLink } from 'lucide-react';
import { getNftImageUrl, getMintGardenNftUrl } from '@/services/constants';
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
```

### 6. Inventory Section Component
**File: `src/components/Account/InventorySection.tsx`**

```typescript
/**
 * InventorySection Component
 *
 * Shows purchased shop items with equip/unequip toggles.
 */

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { ShopItem, ShopCategory } from '@/types/currency';
import './Account.css';

interface InventoryItem extends ShopItem {
  equipped: boolean;
}

interface InventorySectionProps {
  items: InventoryItem[];
  isOwnProfile: boolean;
  onEquip?: (itemId: string, category: ShopCategory) => void;
  onUnequip?: (category: ShopCategory) => void;
}

const CATEGORY_LABELS: Record<ShopCategory, string> = {
  avatar_frame: 'Frames',
  avatar_accessory: 'Accessories',
  game_theme: 'Themes',
  celebration_effect: 'Effects',
  badge: 'Badges',
  title: 'Titles',
  consumable: 'Consumables',
};

const CATEGORY_ORDER: ShopCategory[] = [
  'badge',
  'title',
  'avatar_frame',
  'avatar_accessory',
  'game_theme',
  'celebration_effect',
  'consumable',
];

export function InventorySection({
  items,
  isOwnProfile,
  onEquip,
  onUnequip,
}: InventorySectionProps) {
  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<ShopCategory, InventoryItem[]>);

  if (items.length === 0) {
    return (
      <div className="inventory-section">
        <h2 className="section-title">Inventory</h2>
        <div className="inventory-empty">
          <span className="empty-icon">🛒</span>
          <p>No items purchased yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-section">
      <h2 className="section-title">
        Inventory
        <span className="item-count">({items.length} items)</span>
      </h2>

      {CATEGORY_ORDER.map((category) => {
        const categoryItems = itemsByCategory[category];
        if (!categoryItems?.length) return null;

        return (
          <div key={category} className="inventory-category">
            <h3 className="category-title">{CATEGORY_LABELS[category]}</h3>
            <div className="inventory-items">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className={`inventory-item rarity-${item.rarity} ${item.equipped ? 'equipped' : ''}`}
                >
                  <span className="item-preview">{item.preview}</span>
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-rarity">{item.rarity}</span>
                  </div>

                  {isOwnProfile && category !== 'consumable' && (
                    <button
                      className={`equip-button ${item.equipped ? 'equipped' : ''}`}
                      onClick={() => {
                        if (item.equipped) {
                          onUnequip?.(category);
                        } else {
                          onEquip?.(item.id, category);
                        }
                      }}
                    >
                      {item.equipped ? (
                        <>
                          <Check size={14} /> Equipped
                        </>
                      ) : (
                        'Equip'
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### 7. Recent Activity Component
**File: `src/components/Account/RecentActivity.tsx`**

```typescript
/**
 * RecentActivity Component
 *
 * Shows last 5-10 user activities.
 */

import { formatDistanceToNow } from 'date-fns';
import { Gamepad2, ShoppingBag, Award, Gift } from 'lucide-react';
import './Account.css';

interface Activity {
  id: string;
  type: 'game_played' | 'item_purchased' | 'achievement_earned' | 'daily_reward';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    score?: number;
    itemName?: string;
    reward?: number;
  };
}

interface RecentActivityProps {
  activities: Activity[];
}

const ACTIVITY_ICONS = {
  game_played: Gamepad2,
  item_purchased: ShoppingBag,
  achievement_earned: Award,
  daily_reward: Gift,
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="recent-activity-section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-empty">
          <p>No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-activity-section">
      <h2 className="section-title">Recent Activity</h2>

      <div className="activity-list">
        {activities.slice(0, 10).map((activity) => {
          const Icon = ACTIVITY_ICONS[activity.type];

          return (
            <div key={activity.id} className={`activity-item activity-${activity.type}`}>
              <span className="activity-icon">
                <Icon size={16} />
              </span>
              <div className="activity-content">
                <span className="activity-title">{activity.title}</span>
                <span className="activity-description">{activity.description}</span>
              </div>
              <span className="activity-time">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 8. Account Page Styles
**File: `src/components/Account/Account.css`**

```css
/* ============ Profile Header ============ */
.profile-header {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.profile-avatar-wrapper {
  position: relative;
}

.avatar-edit-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-brand-primary);
  color: white;
  border: 2px solid var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.profile-info {
  flex: 1;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-display-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.edit-name-button {
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 4px;
}

.profile-x-handle {
  color: var(--color-brand-primary);
  text-decoration: none;
  font-size: 0.875rem;
}

.profile-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.badge-nft {
  background: rgba(255, 215, 0, 0.15);
  color: #FFD700;
}

/* ============ Section Styles ============ */
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title .nft-count,
.section-title .item-count {
  font-weight: 400;
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
}

/* ============ Currency Stats ============ */
.currency-stats {
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.stat-lifetime,
.stat-hint {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
}

/* ============ Game Scores ============ */
.game-scores-section {
  margin-bottom: 1.5rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .games-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.game-score-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  text-decoration: none;
  transition: border-color 0.2s;
}

.game-score-card:hover {
  border-color: var(--color-brand-primary);
}

.game-emoji {
  font-size: 1.5rem;
}

.game-info {
  flex: 1;
  min-width: 0;
}

.game-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-stats {
  display: flex;
  gap: 0.75rem;
  margin-top: 2px;
}

.game-high-score,
.game-rank {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.game-high-score {
  color: #FFD700;
}

.game-not-played {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  font-style: italic;
}

/* ============ NFT Gallery ============ */
.nft-gallery-section {
  margin-bottom: 1.5rem;
}

.nft-gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .nft-gallery-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

.nft-gallery-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s;
}

.nft-gallery-item:hover {
  border-color: #FFD700;
  transform: scale(1.05);
}

.nft-gallery-item.is-avatar {
  border-color: #FFD700;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);
}

.nft-gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-id {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.5rem;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.avatar-indicator {
  position: absolute;
  top: 2px;
  left: 2px;
  background: #FFD700;
  color: #000;
  font-size: 0.5rem;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 600;
}

.nft-gallery-empty {
  padding: 2rem;
  text-align: center;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px dashed var(--color-border);
}

.empty-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.mint-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 0.75rem;
  color: var(--color-brand-primary);
  text-decoration: none;
  font-size: 0.875rem;
}

/* ============ Inventory ============ */
.inventory-section {
  margin-bottom: 1.5rem;
}

.inventory-category {
  margin-bottom: 1rem;
}

.category-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0 0 0.5rem 0;
}

.inventory-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.inventory-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--color-border);
}

.inventory-item.equipped {
  border-color: var(--color-brand-primary);
  background: rgba(249, 115, 22, 0.05);
}

/* Rarity colors */
.inventory-item.rarity-legendary { border-left: 3px solid #FFD700; }
.inventory-item.rarity-epic { border-left: 3px solid #9B59B6; }
.inventory-item.rarity-rare { border-left: 3px solid #3498DB; }
.inventory-item.rarity-common { border-left: 3px solid #95A5A6; }

.item-preview {
  font-size: 1.5rem;
}

.item-info {
  flex: 1;
}

.item-name {
  display: block;
  font-weight: 500;
  color: var(--color-text-primary);
}

.item-rarity {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  text-transform: capitalize;
}

.equip-button {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.equip-button.equipped {
  background: var(--color-brand-primary);
  border-color: var(--color-brand-primary);
  color: white;
}

/* ============ Recent Activity ============ */
.recent-activity-section {
  margin-bottom: 1.5rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-bg-secondary);
  border-radius: 10px;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.activity-content {
  flex: 1;
}

.activity-title {
  display: block;
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.activity-description {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.activity-time {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.inventory-empty,
.activity-empty {
  padding: 2rem;
  text-align: center;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  color: var(--color-text-tertiary);
}
```

---

### 9. Update Account Page
**File: `src/pages/Account.tsx`**

Redesign to use new dashboard components:

```typescript
/**
 * Account Page
 *
 * User account dashboard with all profile data.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, useClerk } from '@clerk/clerk-react';
import { LogOut, Settings } from 'lucide-react';

import { useUserProfile } from '@/contexts/UserProfileContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useSageWallet } from '@/sage-wallet';
import { useLayout } from '@/hooks/useLayout';

import { ProfileHeader } from '@/components/Account/ProfileHeader';
import { CurrencyStats } from '@/components/Account/CurrencyStats';
import { GameScoresGrid } from '@/components/Account/GameScoresGrid';
import { NftGallery } from '@/components/Account/NftGallery';
import { InventorySection } from '@/components/Account/InventorySection';
import { RecentActivity } from '@/components/Account/RecentActivity';
import { PageTransition } from '@/components/layout/PageTransition';

import '@/components/Account/Account.css';

// Check if Clerk is configured
const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function Account() {
  const { contentPadding, isDesktop } = useLayout();
  const navigate = useNavigate();
  const clerk = useClerk();

  const {
    profile,
    effectiveDisplayName,
    isSignedIn,
    clerkUser,
    updateAvatar,
  } = useUserProfile();

  const {
    oranges,
    gems,
    lifetimeOranges,
    lifetimeGems,
    ownedItems,
    equippedItems,
    equipItem,
    unequipItem,
  } = useCurrency();

  const { status: walletStatus, address: walletAddress } = useSageWallet();

  // Mock voting counts - replace with actual data from voting context
  const [votingCounts] = useState({ donuts: 10, poops: 10 });

  // Mock activities - replace with actual activity tracking
  const [activities] = useState([]);

  const handleSignOut = async () => {
    if (CLERK_ENABLED && clerk) {
      await clerk.signOut();
      navigate('/');
    }
  };

  const handleSelectNft = async (nftId: string) => {
    const { getNftImageUrl } = await import('@/services/constants');
    await updateAvatar({
      type: 'nft',
      value: getNftImageUrl(nftId),
      source: 'wallet',
      nftId,
    });
  };

  // Not signed in state
  if (!CLERK_ENABLED || !isSignedIn) {
    return (
      <PageTransition>
        <div style={{ padding: contentPadding }}>
          <div className="account-signin-prompt">
            <h1>Account</h1>
            <p>Sign in to view your account dashboard</p>
            {CLERK_ENABLED && (
              <SignInButton mode="modal">
                <button className="signin-button">Sign In with Google</button>
              </SignInButton>
            )}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div
        style={{
          padding: contentPadding,
          maxWidth: isDesktop ? '800px' : undefined,
          margin: '0 auto',
        }}
      >
        <div className="account-dashboard">
          {/* Profile Header */}
          <ProfileHeader
            avatar={profile?.avatar || { type: 'emoji', value: '🎮', source: 'default' }}
            displayName={effectiveDisplayName}
            xHandle={profile?.xHandle}
            walletAddress={profile?.walletAddress}
            createdAt={new Date(profile?.createdAt || Date.now())}
            isOwnProfile={true}
          />

          {/* Currency & Voting Stats */}
          <CurrencyStats
            oranges={oranges}
            gems={gems}
            donuts={votingCounts.donuts}
            poops={votingCounts.poops}
            lifetimeOranges={lifetimeOranges}
            lifetimeGems={lifetimeGems}
          />

          {/* Game Scores */}
          <GameScoresGrid userId={profile?.userId || ''} />

          {/* NFT Collection */}
          <NftGallery
            ownedNftIds={profile?.ownedNftIds || []}
            currentAvatar={profile?.avatar || { type: 'emoji', value: '🎮', source: 'default' }}
            walletConnected={walletStatus === 'connected'}
            isOwnProfile={true}
            onSelectNft={handleSelectNft}
          />

          {/* Shop Inventory */}
          <InventorySection
            items={ownedItems.map(item => ({
              ...item,
              equipped: Object.values(equippedItems).includes(item.id),
            }))}
            isOwnProfile={true}
            onEquip={equipItem}
            onUnequip={unequipItem}
          />

          {/* Recent Activity */}
          <RecentActivity activities={activities} />

          {/* Play Streak (keep existing component if it exists) */}
          {(profile?.currentStreak || profile?.longestStreak) && (
            <div className="streak-section">
              {/* Existing streak display */}
            </div>
          )}

          {/* Account Actions */}
          <div className="account-actions">
            <button
              className="action-button"
              onClick={() => navigate('/settings')}
            >
              <Settings size={18} />
              Settings
            </button>

            <button
              className="action-button action-signout"
              onClick={handleSignOut}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
```

---

### 10. Create Public Profile Page
**File: `src/pages/Profile.tsx`**

```typescript
/**
 * Public Profile Page
 *
 * Read-only view of any user's profile.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { useLayout } from '@/hooks/useLayout';
import { ProfileHeader } from '@/components/Account/ProfileHeader';
import { CurrencyStats } from '@/components/Account/CurrencyStats';
import { GameScoresGrid } from '@/components/Account/GameScoresGrid';
import { NftGallery } from '@/components/Account/NftGallery';
import { InventorySection } from '@/components/Account/InventorySection';
import { PageTransition } from '@/components/layout/PageTransition';

import '@/components/Account/Account.css';

interface PublicProfile {
  userId: string;
  displayName: string;
  avatar: { type: 'emoji' | 'nft'; value: string; source: string };
  xHandle?: string;
  walletAddress?: string;
  createdAt: string;
  oranges: number;
  gems: number;
  ownedNftIds: string[];
  ownedItems: any[];
  gameScores: any[];
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { contentPadding, isDesktop } = useLayout();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return;

      try {
        const response = await fetch(`/api/profile/${userId}`);
        if (!response.ok) {
          throw new Error('Profile not found');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="profile-loading">
          <Loader2 className="spin" size={32} />
          <p>Loading profile...</p>
        </div>
      </PageTransition>
    );
  }

  if (error || !profile) {
    return (
      <PageTransition>
        <div className="profile-error">
          <h2>Profile Not Found</h2>
          <p>{error || 'This user does not exist'}</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div
        style={{
          padding: contentPadding,
          maxWidth: isDesktop ? '800px' : undefined,
          margin: '0 auto',
        }}
      >
        <div className="account-dashboard">
          <ProfileHeader
            avatar={profile.avatar}
            displayName={profile.displayName}
            xHandle={profile.xHandle}
            walletAddress={profile.walletAddress}
            createdAt={new Date(profile.createdAt)}
            isOwnProfile={false}
          />

          <CurrencyStats
            oranges={profile.oranges}
            gems={profile.gems}
            donuts={0} // Don't show voting counts on public profile
            poops={0}
          />

          <GameScoresGrid userId={profile.userId} scores={profile.gameScores} />

          <NftGallery
            ownedNftIds={profile.ownedNftIds}
            currentAvatar={profile.avatar}
            walletConnected={!!profile.walletAddress}
            isOwnProfile={false}
          />

          <InventorySection
            items={profile.ownedItems.map(item => ({ ...item, equipped: false }))}
            isOwnProfile={false}
          />
        </div>
      </div>
    </PageTransition>
  );
}
```

---

### 11. Add Routes
**File: `src/App.tsx`** (or routes config)

Add the profile route:

```typescript
import Profile from '@/pages/Profile';

// In routes:
<Route path="/profile/:userId" element={<Profile />} />
```

---

### 12. Create API Endpoints

**File: `functions/api/profile/[userId].ts`**

```typescript
/**
 * Public Profile API
 *
 * GET /api/profile/:userId - Fetch public profile data
 */

import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env } = context;
  const userId = params.userId as string;

  try {
    // Fetch profile
    const profile = await env.DB.prepare(`
      SELECT
        user_id, display_name, x_handle, wallet_address,
        avatar_type, avatar_value, avatar_source,
        owned_nft_ids, created_at
      FROM profiles
      WHERE user_id = ?
    `).bind(userId).first();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
      });
    }

    // Fetch currency (optional - may want to hide from public)
    const currency = await env.DB.prepare(`
      SELECT oranges, gems FROM user_currency WHERE user_id = ?
    `).bind(userId).first();

    // Fetch game scores
    const scores = await env.DB.prepare(`
      SELECT
        game_id,
        MAX(score) as high_score,
        (SELECT COUNT(*) + 1 FROM leaderboard_scores ls2
         WHERE ls2.game_id = ls.game_id AND ls2.score > MAX(ls.score)) as rank
      FROM leaderboard_scores ls
      WHERE user_id = ?
      GROUP BY game_id
    `).bind(userId).all();

    // Fetch owned items
    const items = await env.DB.prepare(`
      SELECT item_id, purchased_at FROM user_inventory WHERE user_id = ?
    `).bind(userId).all();

    return new Response(JSON.stringify({
      userId: profile.user_id,
      displayName: profile.display_name || 'Player',
      avatar: {
        type: profile.avatar_type || 'emoji',
        value: profile.avatar_value || '🎮',
        source: profile.avatar_source || 'default',
      },
      xHandle: profile.x_handle,
      walletAddress: profile.wallet_address,
      createdAt: profile.created_at,
      oranges: currency?.oranges || 0,
      gems: currency?.gems || 0,
      ownedNftIds: profile.owned_nft_ids ? JSON.parse(profile.owned_nft_ids) : [],
      gameScores: (scores.results || []).map(s => ({
        gameId: s.game_id,
        highScore: s.high_score,
        rank: s.rank,
      })),
      ownedItems: (items.results || []).map(i => i.item_id),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Profile API] Error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
    });
  }
};
```

**File: `functions/api/scores/[userId].ts`**

```typescript
/**
 * User Scores API
 *
 * GET /api/scores/:userId - Fetch all game scores for a user
 */

import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env } = context;
  const userId = params.userId as string;

  try {
    const scores = await env.DB.prepare(`
      SELECT
        ls.game_id,
        MAX(ls.score) as high_score,
        MAX(ls.created_at) as last_played,
        (
          SELECT COUNT(*) + 1
          FROM leaderboard_scores ls2
          WHERE ls2.game_id = ls.game_id AND ls2.score > MAX(ls.score)
        ) as rank
      FROM leaderboard_scores ls
      WHERE ls.user_id = ?
      GROUP BY ls.game_id
    `).bind(userId).all();

    return new Response(JSON.stringify({
      scores: (scores.results || []).map(s => ({
        gameId: s.game_id,
        highScore: s.high_score,
        rank: s.rank,
        lastPlayed: s.last_played,
      })),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Scores API] Error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
    });
  }
};
```

---

## Testing Checklist

- [ ] Own account page shows all sections with real data
- [ ] Profile header shows avatar, name, badges correctly
- [ ] Currency section shows oranges, gems, donuts, poops
- [ ] Game scores show personal best + rank for each active game
- [ ] NFT gallery shows owned NFTs with current avatar highlighted
- [ ] Can click NFT in gallery to set as avatar (own profile only)
- [ ] Inventory shows purchased items organized by category
- [ ] Can equip/unequip items directly from account page
- [ ] Equipped items persist and show in relevant places
- [ ] Public profile (`/profile/:userId`) works for viewing other users
- [ ] Public profile hides edit buttons and sensitive data
- [ ] Account age calculates correctly from createdAt
- [ ] Responsive layout works on mobile and desktop

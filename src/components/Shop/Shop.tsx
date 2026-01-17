/**
 * Shop Component
 *
 * Browse and purchase items with oranges or gems.
 */

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { CurrencyDisplay } from '../Currency/CurrencyDisplay';
import type { ShopItem, ShopCategory } from '../../types/currency';
import './Shop.css';

const CATEGORIES: { value: ShopCategory; label: string }[] = [
  { value: 'avatar_frame', label: 'Frames' },
  { value: 'avatar_accessory', label: 'Accessories' },
  { value: 'game_theme', label: 'Themes' },
  { value: 'celebration_effect', label: 'Effects' },
  { value: 'badge', label: 'Badges' },
  { value: 'title', label: 'Titles' },
];

// Demo shop items - in production, these would come from the backend
const DEMO_SHOP_ITEMS: ShopItem[] = [
  // Avatar Frames
  {
    id: 'frame-golden',
    name: 'Golden Frame',
    description: 'A prestigious golden border',
    category: 'avatar_frame',
    price: { oranges: 1000 },
    preview: '🖼️',
    rarity: 'rare',
  },
  {
    id: 'frame-diamond',
    name: 'Diamond Frame',
    description: 'Sparkling diamond edges',
    category: 'avatar_frame',
    price: { gems: 10 },
    preview: '💎',
    rarity: 'epic',
  },
  {
    id: 'frame-fire',
    name: 'Fire Frame',
    description: 'Blazing hot border',
    category: 'avatar_frame',
    price: { oranges: 2500 },
    preview: '🔥',
    rarity: 'epic',
  },
  {
    id: 'frame-rainbow',
    name: 'Rainbow Frame',
    description: 'Colorful animated border',
    category: 'avatar_frame',
    price: { gems: 25 },
    preview: '🌈',
    rarity: 'legendary',
  },
  // Accessories
  {
    id: 'acc-sunglasses',
    name: 'Cool Shades',
    description: 'Look cool, feel cool',
    category: 'avatar_accessory',
    price: { oranges: 500 },
    preview: '😎',
    rarity: 'common',
  },
  {
    id: 'acc-crown',
    name: 'Royal Crown',
    description: 'Rule the leaderboards',
    category: 'avatar_accessory',
    price: { oranges: 2000, gems: 5 },
    preview: '👑',
    rarity: 'epic',
  },
  {
    id: 'acc-halo',
    name: 'Angel Halo',
    description: 'Heavenly glow',
    category: 'avatar_accessory',
    price: { gems: 15 },
    preview: '😇',
    rarity: 'rare',
  },
  // Game Themes
  {
    id: 'theme-dark',
    name: 'Dark Mode',
    description: 'Easy on the eyes',
    category: 'game_theme',
    price: { oranges: 800 },
    preview: '🌙',
    rarity: 'common',
  },
  {
    id: 'theme-neon',
    name: 'Neon Glow',
    description: 'Cyberpunk vibes',
    category: 'game_theme',
    price: { oranges: 1500 },
    preview: '💜',
    rarity: 'rare',
  },
  {
    id: 'theme-retro',
    name: 'Retro Arcade',
    description: '80s gaming aesthetic',
    category: 'game_theme',
    price: { gems: 8 },
    preview: '🕹️',
    rarity: 'rare',
  },
  // Celebration Effects
  {
    id: 'effect-confetti',
    name: 'Confetti Burst',
    description: 'Celebrate your wins',
    category: 'celebration_effect',
    price: { oranges: 600 },
    preview: '🎊',
    rarity: 'common',
  },
  {
    id: 'effect-fireworks',
    name: 'Fireworks',
    description: 'Light up the sky',
    category: 'celebration_effect',
    price: { oranges: 1200 },
    preview: '🎆',
    rarity: 'rare',
  },
  {
    id: 'effect-stars',
    name: 'Shooting Stars',
    description: 'Wish upon a star',
    category: 'celebration_effect',
    price: { gems: 12 },
    preview: '🌟',
    rarity: 'epic',
  },
  // Badges
  {
    id: 'badge-og',
    name: 'OG Badge',
    description: 'Early supporter badge',
    category: 'badge',
    price: { oranges: 3000 },
    preview: '🏅',
    rarity: 'rare',
    isLimited: true,
  },
  {
    id: 'badge-whale',
    name: 'Whale Badge',
    description: 'Big spender status',
    category: 'badge',
    price: { gems: 50 },
    preview: '🐋',
    rarity: 'legendary',
  },
  // Titles
  {
    id: 'title-champion',
    name: 'Champion',
    description: 'Display "Champion" title',
    category: 'title',
    price: { oranges: 1500 },
    preview: '🏆',
    rarity: 'rare',
  },
  {
    id: 'title-legend',
    name: 'Legend',
    description: 'Display "Legend" title',
    category: 'title',
    price: { gems: 20 },
    preview: '⭐',
    rarity: 'epic',
  },
  {
    id: 'title-goat',
    name: 'G.O.A.T.',
    description: 'The greatest of all time',
    category: 'title',
    price: { gems: 100 },
    preview: '🐐',
    rarity: 'legendary',
  },
];

interface ShopProps {
  onClose?: () => void;
}

export function Shop({ onClose }: ShopProps) {
  const { purchaseItem, canAfford } = useCurrency();
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('avatar_frame');
  const [items] = useState<ShopItem[]>(DEMO_SHOP_ITEMS);
  const [isLoading] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set());
  const [purchaseMessage, setPurchaseMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load owned items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('wojak_owned_items');
    if (stored) {
      setOwnedItems(new Set(JSON.parse(stored)));
    }
  }, []);

  // Save owned items to localStorage
  const saveOwnedItems = (items: Set<string>) => {
    localStorage.setItem('wojak_owned_items', JSON.stringify([...items]));
    setOwnedItems(items);
  };

  const handlePurchase = async (item: ShopItem) => {
    setPurchasingId(item.id);
    setPurchaseMessage(null);

    const result = await purchaseItem(item.id, item.price.oranges, item.price.gems);

    if (result.success) {
      const newOwned = new Set([...ownedItems, item.id]);
      saveOwnedItems(newOwned);
      setPurchaseMessage({ type: 'success', text: `Purchased ${item.name}!` });
    } else {
      setPurchaseMessage({ type: 'error', text: result.error || 'Purchase failed' });
    }

    setPurchasingId(null);

    // Clear message after 3 seconds
    setTimeout(() => setPurchaseMessage(null), 3000);
  };

  const filteredItems = items.filter((item) => item.category === activeCategory);

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary':
        return '#FFD700';
      case 'epic':
        return '#9B59B6';
      case 'rare':
        return '#3498DB';
      default:
        return '#95A5A6';
    }
  };

  return (
    <div className="shop-page">
      {/* Header with Currency */}
      <div className="shop-header">
        <div className="shop-title-row">
          <h1>Shop</h1>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
        <CurrencyDisplay size="medium" />
      </div>

      {/* Purchase Message */}
      {purchaseMessage && (
        <div className={`purchase-message ${purchaseMessage.type}`}>{purchaseMessage.text}</div>
      )}

      {/* Category Tabs */}
      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            className={`category-tab ${activeCategory === cat.value ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => {
            const isOwned = ownedItems.has(item.id);
            const affordable = canAfford(item.price.oranges, item.price.gems);

            return (
              <div
                key={item.id}
                className={`shop-item-card rarity-${item.rarity} ${isOwned ? 'owned' : ''}`}
                style={{ '--rarity-color': getRarityColor(item.rarity) } as React.CSSProperties}
              >
                {/* Rarity Badge */}
                <span className={`rarity-badge rarity-${item.rarity}`}>{item.rarity}</span>

                {/* Limited Badge */}
                {item.isLimited && <span className="limited-badge">Limited!</span>}

                {/* Item Preview */}
                <div className="item-preview">
                  {item.preview.startsWith('http') ? (
                    <img src={item.preview} alt={item.name} />
                  ) : (
                    <span className="preview-emoji">{item.preview}</span>
                  )}
                </div>

                {/* Item Info */}
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-description">{item.description}</span>
                </div>

                {/* Price / Owned */}
                <div className="item-footer">
                  {isOwned ? (
                    <span className="owned-badge">✓ Owned</span>
                  ) : (
                    <>
                      <div className="item-price">
                        {item.price.oranges && (
                          <span className="price oranges">
                            🍊 {item.price.oranges.toLocaleString()}
                          </span>
                        )}
                        {item.price.gems && (
                          <span className="price gems">💎 {item.price.gems}</span>
                        )}
                      </div>
                      <button
                        disabled={!affordable || purchasingId === item.id}
                        onClick={() => handlePurchase(item)}
                        className="buy-button"
                      >
                        {purchasingId === item.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : affordable ? (
                          'Buy'
                        ) : (
                          'Not enough'
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="empty-state">
              <p>No items in this category yet!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Shop;

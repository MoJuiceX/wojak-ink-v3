/**
 * Shop Component (SPEC 12)
 *
 * Browse and purchase Tang Gang collectibles.
 * Categories: Emojis, Frames, Name Effects, Titles, Backgrounds, Celebrations, BigPulp Items
 */

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Sparkles, Crown, Flame, Zap, Star, Package, Target } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { CurrencyDisplay } from '../Currency/CurrencyDisplay';
import { EmojiRing } from './EmojiRing';
import { EmojiFrame, EMOJI_FRAME_MAP } from './EmojiFrame';
import './Shop.css';
import './frames.css';

interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  price_oranges: number;
  price_xch: number | null;
  css_class: string | null;
  emoji: string | null;
  is_active: boolean;
  sort_order: number;
}

interface InventoryItem {
  id: string;
  item_id: string;
  acquired_at: string;
}

interface EquippedState {
  frame_id: string | null;
  title_id: string | null;
  name_effect_id: string | null;
  background_id: string | null;
  celebration_id: string | null;
}

const CATEGORIES = [
  { value: 'consumable', label: 'Ammo', icon: Target },
  { value: 'emoji_badge', label: 'Emojis', icon: Star },
  { value: 'frame', label: 'Frames', icon: Package },
  { value: 'name_effect', label: 'Effects', icon: Sparkles },
  { value: 'title', label: 'Titles', icon: Crown },
  { value: 'background', label: 'Backgrounds', icon: Zap },
  { value: 'celebration', label: 'Celebrations', icon: Flame },
  { value: 'bigpulp', label: 'BigPulp', icon: Star },
];

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// BigPulp item emoji mappings
const BIGPULP_EMOJIS: Record<string, string> = {
  // Hats
  'bigpulp-hat-party': '🎉',
  'bigpulp-hat-cowboy': '🤠',
  'bigpulp-hat-chef': '👨‍🍳',
  'bigpulp-hat-viking': '⚔️',
  'bigpulp-hat-pirate': '🏴‍☠️',
  'bigpulp-hat-beret': '🎨',
  'bigpulp-hat-tophat': '🎩',
  'bigpulp-hat-wizard': '🧙',
  'bigpulp-hat-devil': '😈',
  'bigpulp-hat-crown': '👑',
  'bigpulp-hat-halo': '😇',
  // Moods
  'bigpulp-mood-happy': '😊',
  'bigpulp-mood-chill': '😎',
  'bigpulp-mood-sleepy': '😴',
  'bigpulp-mood-hype': '🤩',
  'bigpulp-mood-grumpy': '😤',
  'bigpulp-mood-sergeant': '🫡',
  'bigpulp-mood-numb': '😐',
  'bigpulp-mood-rekt': '😵',
  // Accessories
  'bigpulp-acc-bowtie': '🎀',
  'bigpulp-acc-bandana': '🧣',
  'bigpulp-acc-earring': '💎',
  'bigpulp-acc-headphones': '🎧',
  'bigpulp-acc-cigar': '🚬',
  'bigpulp-acc-monocle': '🧐',
  'bigpulp-acc-scar': '⚡',
};

// Celebration type extraction from item ID
const CELEBRATION_TYPES: Record<string, string> = {
  'celebration-confetti': 'confetti',
  'celebration-orange-rain': 'orange-rain',
  'celebration-citrus-burst': 'citrus-burst',
  'celebration-fireworks': 'fireworks',
};

interface ShopProps {
  onClose?: () => void;
}

export function Shop({ onClose }: ShopProps) {
  const { getToken } = useAuth();
  const { refreshBalance, currency } = useCurrency();
  const [activeCategory, setActiveCategory] = useState('consumable');
  const [items, setItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equipped, setEquipped] = useState<EquippedState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [equipingId, setEquipingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);

  // Fetch shop items
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/shop/items');
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('[Shop] Failed to fetch items:', err);
    }
  }, []);

  // Fetch user inventory
  const fetchInventory = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch('/api/shop/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.inventory) {
        setInventory(data.inventory);
      }
      if (data.equipped) {
        setEquipped(data.equipped);
      }
    } catch (err) {
      console.error('[Shop] Failed to fetch inventory:', err);
    }
  }, [getToken]);

  // Load data on mount
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchItems(), fetchInventory()]);
      setIsLoading(false);
    };
    load();
  }, [fetchItems, fetchInventory]);

  // Check if item is owned (consumables are never "owned" - they can always be bought)
  const isOwned = (item: ShopItem): boolean => {
    if (item.category === 'consumable') return false;
    return inventory.some(inv => inv.item_id === item.id);
  };

  // Check if item is equipped
  const isEquipped = (item: ShopItem): boolean => {
    if (!equipped) return false;
    switch (item.category) {
      case 'frame': return equipped.frame_id === item.id;
      case 'title': return equipped.title_id === item.id;
      case 'name_effect': return equipped.name_effect_id === item.id;
      case 'background': return equipped.background_id === item.id;
      case 'celebration': return equipped.celebration_id === item.id;
      default: return false;
    }
  };

  // Check affordability
  const canAfford = (item: ShopItem): boolean => {
    if (!currency) return false;
    return item.price_oranges <= currency.oranges;
  };

  // Handle purchase
  const handlePurchase = async (item: ShopItem) => {
    setPurchasingId(item.id);
    setMessage(null);

    try {
      const token = await getToken();
      if (!token) {
        setMessage({ type: 'error', text: 'Please sign in to purchase' });
        setPurchasingId(null);
        return;
      }

      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: item.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `Purchased ${item.name}!` });
        await Promise.all([fetchInventory(), refreshBalance()]);
      } else {
        setMessage({ type: 'error', text: data.error || 'Purchase failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error' });
    }

    setPurchasingId(null);
    setTimeout(() => setMessage(null), 3000);
  };

  // Handle equip/unequip
  const handleEquip = async (item: ShopItem) => {
    const slot = item.category as 'frame' | 'title' | 'name_effect' | 'background' | 'celebration';
    if (!['frame', 'title', 'name_effect', 'background', 'celebration'].includes(slot)) return;

    setEquipingId(item.id);
    setMessage(null);

    try {
      const token = await getToken();
      if (!token) return;

      const isCurrentlyEquipped = isEquipped(item);

      const res = await fetch('/api/shop/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slot,
          itemId: isCurrentlyEquipped ? null : item.id,
        }),
      });

      if (res.ok) {
        setMessage({
          type: 'success',
          text: isCurrentlyEquipped ? `Unequipped ${item.name}` : `Equipped ${item.name}!`,
        });
        await fetchInventory();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to equip item' });
    }

    setEquipingId(null);
    setTimeout(() => setMessage(null), 3000);
  };

  // Filter items by category
  const getFilteredItems = (): ShopItem[] => {
    let filtered: ShopItem[];

    if (activeCategory === 'bigpulp') {
      // Combine all BigPulp categories
      filtered = items.filter(item =>
        item.category === 'bigpulp_hat' ||
        item.category === 'bigpulp_accessory' ||
        item.category === 'bigpulp_mood'
      );
    } else {
      filtered = items.filter(item => item.category === activeCategory);
    }

    // Sort by rarity then price
    return filtered.sort((a, b) => {
      const rarityDiff = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
      if (rarityDiff !== 0) return rarityDiff;
      return a.price_oranges - b.price_oranges;
    });
  };

  const filteredItems = getFilteredItems();

  // Render item preview based on category
  const renderItemPreview = (item: ShopItem, isLarge = false) => {
    // Emoji badges - show the emoji
    if (item.emoji) {
      return <span className="preview-emoji">{item.emoji}</span>;
    }

    // BigPulp items (hats, moods, accessories) - show mapped emoji
    if (item.category === 'bigpulp_hat' || item.category === 'bigpulp_mood' || item.category === 'bigpulp_accessory') {
      const bigpulpEmoji = BIGPULP_EMOJIS[item.id];
      if (bigpulpEmoji) {
        return <span className="preview-emoji">{bigpulpEmoji}</span>;
      }
      // Fallback to orange for BigPulp
      return <span className="preview-emoji">🍊</span>;
    }

    // Titles - show the actual title text
    if (item.category === 'title') {
      return (
        <div className={`title-preview ${item.rarity === 'legendary' ? 'legendary' : ''}`}>
          <span className="title-text">"{item.name}"</span>
        </div>
      );
    }

    // Celebrations - show animated preview
    if (item.category === 'celebration') {
      const celebType = CELEBRATION_TYPES[item.id] || 'confetti';
      return (
        <div className={`celebration-preview celebration-${celebType}`}>
          <span className="celebration-icon">
            {celebType === 'confetti' && '🎊'}
            {celebType === 'orange-rain' && '🍊'}
            {celebType === 'citrus-burst' && '💥'}
            {celebType === 'fireworks' && '🎆'}
          </span>
        </div>
      );
    }

    if (item.css_class) {
      // For frames, show a demo frame with proper styling
      if (item.category === 'frame') {
        // Check if it's an emoji frame
        const frameEmoji = item.css_class ? EMOJI_FRAME_MAP[item.css_class] : null;

        if (frameEmoji) {
          // Use EmojiFrame component for emoji-based frames
          return (
            <EmojiFrame
              emoji={frameEmoji}
              size={isLarge ? 'large' : 'small'}
            >
              <span style={{ fontSize: isLarge ? '2.5rem' : '1.5rem' }}>🍊</span>
            </EmojiFrame>
          );
        }

        // Regular frame with CSS effects
        return (
          <div className={`preview-frame ${item.css_class}`}>
            <span>🍊</span>
          </div>
        );
      }
      // For name effects, show styled text
      if (item.category === 'name_effect') {
        return (
          <span className={`preview-name-effect ${item.css_class}`} data-text="Name">
            Name
          </span>
        );
      }
      // For backgrounds, show a swatch
      if (item.category === 'background') {
        return <div className={`preview-background ${item.css_class}`} />;
      }
    }
    // Fallback
    return <span className="preview-emoji">✨</span>;
  };

  return (
    <div className="shop-page">
      {/* Header */}
      <div className="shop-header">
        <div className="shop-title-row">
          <h1>Tang Gang Shop</h1>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
        <CurrencyDisplay size="medium" />
      </div>

      {/* Message */}
      {message && (
        <div className={`purchase-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Category Tabs */}
      <div className="category-tabs">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              className={`category-tab ${activeCategory === cat.value ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              <Icon size={16} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={32} />
          <span>Loading shop...</span>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => {
            const owned = isOwned(item);
            const equippedItem = isEquipped(item);
            const affordable = canAfford(item);
            const isPurchasing = purchasingId === item.id;
            const isEquiping = equipingId === item.id;
            const canEquip = ['frame', 'title', 'name_effect', 'background', 'celebration'].includes(item.category);

            return (
              <div
                key={item.id}
                className={`shop-item-card rarity-${item.rarity} ${owned ? 'owned' : ''} ${equippedItem ? 'equipped' : ''}`}
                style={{ '--rarity-color': RARITY_COLORS[item.rarity] } as React.CSSProperties}
                onClick={() => setPreviewItem(item)}
              >
                {/* Rarity Badge */}
                <span className={`rarity-badge rarity-${item.rarity}`}>
                  {item.rarity}
                </span>


                {/* Equipped Badge */}
                {equippedItem && <span className="equipped-badge">Equipped</span>}

                {/* Item Preview */}
                <div className="item-preview">
                  {renderItemPreview(item)}
                </div>

                {/* Item Info */}
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  {item.description && (
                    <span className="item-description">{item.description}</span>
                  )}
                </div>

                {/* Footer: Price / Actions */}
                <div className="item-footer" onClick={e => e.stopPropagation()}>
                  {owned ? (
                    canEquip ? (
                      <button
                        className={`equip-button ${equippedItem ? 'unequip' : ''}`}
                        onClick={() => handleEquip(item)}
                        disabled={isEquiping}
                      >
                        {isEquiping ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : equippedItem ? (
                          'Unequip'
                        ) : (
                          'Equip'
                        )}
                      </button>
                    ) : (
                      <span className="owned-badge">✓ Owned</span>
                    )
                  ) : (
                    <>
                      <div className="item-price">
                        {item.price_oranges > 0 && (
                          <span className="price oranges">
                            🍊 {item.price_oranges.toLocaleString()}
                          </span>
                        )}
                        {item.price_xch && item.price_xch > 0 && (
                          <span className="price xch">
                            ◎ {item.price_xch}
                          </span>
                        )}
                      </div>
                      <button
                        className="buy-button"
                        disabled={!affordable || isPurchasing}
                        onClick={() => handlePurchase(item)}
                      >
                        {isPurchasing ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : affordable ? (
                          'Buy'
                        ) : (
                          'Need more'
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

      {/* Preview Modal */}
      {previewItem && (
        <div className="preview-modal" onClick={() => setPreviewItem(null)}>
          <div className="preview-content" onClick={e => e.stopPropagation()}>
            <button className="preview-close" onClick={() => setPreviewItem(null)}>
              ✕
            </button>
            <div className="preview-header">
              <span className={`rarity-badge rarity-${previewItem.rarity}`}>
                {previewItem.rarity}
              </span>
              <h2>{previewItem.name}</h2>
            </div>
            <div className="preview-large">
              {renderItemPreview(previewItem, true)}
            </div>
            {previewItem.description && (
              <p className="preview-description">{previewItem.description}</p>
            )}
            {previewItem.category === 'emoji_badge' && (
              <div className="preview-demo">
                <p className="demo-label">Preview in emoji ring:</p>
                <EmojiRing
                  username="YourName"
                  positions={{
                    left_1: previewItem.emoji,
                    right_1: previewItem.emoji,
                  }}
                  size="large"
                />
              </div>
            )}
            {previewItem.category === 'name_effect' && previewItem.css_class && (
              <div className="preview-demo">
                <p className="demo-label">Preview effect:</p>
                <span className={`demo-name ${previewItem.css_class}`} data-text="YourName">
                  YourName
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;

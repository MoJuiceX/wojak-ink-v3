/**
 * InventorySection Component
 *
 * Shows purchased shop items with equip/unequip toggles.
 * Uses actual database categories from shop_items table.
 */

import { Check, Sparkles } from 'lucide-react';
import './Account.css';

// Database item categories
type ItemCategory =
  | 'frame'
  | 'title'
  | 'name_effect'
  | 'background'
  | 'celebration'
  | 'emoji_badge'
  | 'bigpulp_hat'
  | 'bigpulp_mood'
  | 'bigpulp_accessory'
  | 'consumable';

interface InventoryItem {
  id: string;
  item_id: string;
  name: string;
  category: ItemCategory;
  rarity: string;
  css_class: string | null;
  emoji: string | null;
  acquired_at: string;
  equipped: boolean;
}

interface InventorySectionProps {
  items: InventoryItem[];
  isOwnProfile: boolean;
  onEquip?: (itemId: string, category: string) => void;
  onUnequip?: (category: string) => void;
}

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  emoji_badge: 'Emoji Badges',
  frame: 'Frames',
  title: 'Titles',
  name_effect: 'Name Effects',
  background: 'Backgrounds',
  celebration: 'Celebrations',
  bigpulp_hat: 'BigPulp Hats',
  bigpulp_mood: 'BigPulp Moods',
  bigpulp_accessory: 'BigPulp Accessories',
  consumable: 'Consumables',
};

const CATEGORY_ORDER: ItemCategory[] = [
  'emoji_badge',
  'frame',
  'title',
  'name_effect',
  'background',
  'celebration',
  'bigpulp_hat',
  'bigpulp_mood',
  'bigpulp_accessory',
  'consumable',
];

// Categories that can be equipped
const EQUIPPABLE_CATEGORIES = ['frame', 'title', 'name_effect', 'background', 'celebration'];

export function InventorySection({
  items,
  isOwnProfile,
  onEquip,
  onUnequip,
}: InventorySectionProps) {
  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const cat = item.category as ItemCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<ItemCategory, InventoryItem[]>);

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

  const renderItemPreview = (item: InventoryItem) => {
    if (item.emoji) {
      return <span className="preview-emoji">{item.emoji}</span>;
    }
    if (item.css_class) {
      if (item.category === 'frame') {
        return <div className={`preview-frame ${item.css_class}`}>🍊</div>;
      }
      if (item.category === 'name_effect') {
        return <span className={`preview-effect ${item.css_class}`} data-text="Abc">Abc</span>;
      }
      if (item.category === 'background') {
        return <div className={`preview-bg ${item.css_class}`} />;
      }
    }
    return <Sparkles size={20} />;
  };

  return (
    <div className="inventory-section">
      <h2 className="section-title">
        Inventory
        <span className="item-count">({items.length} items)</span>
      </h2>

      {CATEGORY_ORDER.map((category) => {
        const categoryItems = itemsByCategory[category];
        if (!categoryItems?.length) return null;

        const isEquippable = EQUIPPABLE_CATEGORIES.includes(category);

        return (
          <div key={category} className="inventory-category">
            <h3 className="category-title">{CATEGORY_LABELS[category]}</h3>
            <div className="inventory-items">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className={`inventory-item rarity-${item.rarity} ${item.equipped ? 'equipped' : ''}`}
                >
                  <div className="item-preview">
                    {renderItemPreview(item)}
                  </div>
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-rarity">{item.rarity}</span>
                  </div>

                  {isOwnProfile && isEquippable && (
                    <button
                      className={`equip-button ${item.equipped ? 'equipped' : ''}`}
                      onClick={() => {
                        if (item.equipped) {
                          onUnequip?.(category);
                        } else {
                          onEquip?.(item.item_id, category);
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

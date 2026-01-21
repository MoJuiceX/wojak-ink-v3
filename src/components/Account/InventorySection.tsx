/**
 * InventorySection Component
 *
 * Shows purchased shop items with equip/unequip toggles.
 */

import { Check } from 'lucide-react';
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

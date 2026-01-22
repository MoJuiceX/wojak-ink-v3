-- Migration 012: Add consumable items (donuts and poop emojis for voting)
-- These are ammo for the emoji flick voting system

-- Add donut pack (10 donuts for 50 oranges)
INSERT INTO shop_items (
  id, name, description, category, rarity,
  price_oranges, emoji, css_class,
  is_active, sort_order
) VALUES (
  'consumable-donuts-10',
  'Donut Pack',
  '10 donuts to flick at your favorite NFTs',
  'consumable',
  'common',
  50,
  '🍩',
  NULL,
  1,
  1
);

-- Add poop pack (10 poop emojis for 50 oranges)
INSERT INTO shop_items (
  id, name, description, category, rarity,
  price_oranges, emoji, css_class,
  is_active, sort_order
) VALUES (
  'consumable-poop-10',
  'Poop Pack',
  '10 poop emojis to throw at NFTs you dislike',
  'consumable',
  'common',
  50,
  '💩',
  NULL,
  1,
  2
);

-- Create user_consumables table to track owned consumables
CREATE TABLE IF NOT EXISTS user_consumables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  consumable_type TEXT NOT NULL CHECK (consumable_type IN ('donut', 'poop')),
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, consumable_type)
);

CREATE INDEX IF NOT EXISTS idx_user_consumables_user ON user_consumables(user_id);

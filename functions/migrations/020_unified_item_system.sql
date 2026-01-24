-- =====================================================
-- SPEC 19: Complete Unified Item System
-- Migration 020: Unified tables for shop + drawer customization
-- =====================================================

-- =====================================================
-- 1. MASTER ITEM CATALOG
-- All purchasable items in one table
-- =====================================================
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,  -- 'frame', 'title', 'background', 'name_effect',
                          -- 'celebration', 'emoji_badge', 'bigpulp_hat',
                          -- 'bigpulp_mood', 'bigpulp_accessory', 'consumable',
                          -- 'font_color', 'font_style', 'font_family',
                          -- 'avatar_glow', 'avatar_size', 'page_background',
                          -- 'dialogue_style', 'collection_layout', 'card_style',
                          -- 'entrance_animation', 'stats_style', 'tabs_style',
                          -- 'visitor_counter', 'bigpulp_position', 'bundle'

  -- Pricing
  tier TEXT DEFAULT 'basic',  -- 'free', 'basic', 'premium'
  price_oranges INTEGER DEFAULT 0,
  price_gems INTEGER DEFAULT 0,

  -- Visual
  emoji TEXT,               -- For emoji badges and previews
  css_class TEXT,           -- CSS class to apply
  css_value TEXT,           -- CSS value (for colors, fonts)
  preview_type TEXT,        -- 'color', 'text', 'icon', 'animation'

  -- Availability
  is_active INTEGER DEFAULT 1,
  is_limited INTEGER DEFAULT 0,
  stock_limit INTEGER,          -- NULL = unlimited, number = max available
  stock_remaining INTEGER,      -- Current stock (decremented on purchase)
  available_from TEXT,          -- ISO date - when item becomes available
  available_until TEXT,         -- ISO date - when item stops being available

  -- Bundle info (for bundles)
  bundle_items TEXT,            -- JSON array of item IDs included in bundle
  bundle_discount INTEGER,      -- Percentage discount (e.g., 20 for 20% off)

  -- Consumable info
  is_consumable INTEGER DEFAULT 0,
  consumable_quantity INTEGER,  -- How many uses per purchase

  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_category ON items(category, is_active);
CREATE INDEX IF NOT EXISTS idx_items_tier ON items(tier, is_active);
CREATE INDEX IF NOT EXISTS idx_items_limited ON items(is_limited, available_until);

-- =====================================================
-- 2. USER INVENTORY
-- Tracks all items owned by users
-- =====================================================
CREATE TABLE IF NOT EXISTS user_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,

  -- State
  state TEXT DEFAULT 'owned',  -- 'owned', 'equipped', 'gifted', 'consumed'

  -- Acquisition
  acquisition_type TEXT DEFAULT 'purchase',  -- 'purchase', 'gift', 'achievement', 'admin'
  acquired_from TEXT,          -- user_id if gifted, achievement_id if unlocked
  acquired_at TEXT DEFAULT CURRENT_TIMESTAMP,
  price_paid INTEGER DEFAULT 0,

  -- Consumable tracking
  uses_remaining INTEGER,      -- For consumables: how many uses left

  -- Gifting
  gifted_to TEXT,              -- user_id if gifted away
  gifted_at TEXT,

  UNIQUE(user_id, item_id, acquired_at),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE INDEX IF NOT EXISTS idx_user_items_user ON user_items(user_id, state);
CREATE INDEX IF NOT EXISTS idx_user_items_item ON user_items(item_id);

-- =====================================================
-- 3. USER EQUIPMENT
-- Current equipment per slot (one row per user)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_equipment (
  user_id TEXT PRIMARY KEY,

  -- Equip Slots (one item per slot)
  frame_id TEXT,
  title_id TEXT,
  background_id TEXT,
  name_effect_id TEXT,
  celebration_id TEXT,

  -- BigPulp
  bigpulp_hat_id TEXT,
  bigpulp_mood_id TEXT,
  bigpulp_accessory_id TEXT,

  -- Drawer Customization
  font_color_id TEXT DEFAULT 'font-color-orange',
  font_style_id TEXT DEFAULT 'font-style-normal',
  font_family_id TEXT DEFAULT 'font-family-default',
  page_background_id TEXT DEFAULT 'bg-midnight-black',
  avatar_glow_id TEXT DEFAULT 'avatar-glow-none',
  avatar_size_id TEXT DEFAULT 'avatar-size-normal',
  bigpulp_position_id TEXT DEFAULT 'bigpulp-pos-right',
  dialogue_style_id TEXT DEFAULT 'dialogue-style-default',
  collection_layout_id TEXT DEFAULT 'layout-grid',
  card_style_id TEXT DEFAULT 'card-style-default',
  entrance_animation_id TEXT DEFAULT 'entrance-none',
  stats_style_id TEXT DEFAULT 'stats-style-default',
  tabs_style_id TEXT DEFAULT 'tabs-style-default',
  visitor_counter_id TEXT DEFAULT 'visitor-counter-hidden',

  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- 4. USER GIFT STATS
-- Tracks total gifting activity
-- =====================================================
CREATE TABLE IF NOT EXISTS user_gift_stats (
  user_id TEXT PRIMARY KEY,

  total_oranges_gifted INTEGER DEFAULT 0,
  total_gems_gifted INTEGER DEFAULT 0,
  total_items_gifted INTEGER DEFAULT 0,

  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- 5. GIFT HISTORY
-- Record of all gifts sent/received
-- =====================================================
CREATE TABLE IF NOT EXISTS gift_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,

  gift_type TEXT NOT NULL,  -- 'item', 'oranges', 'gems'
  item_id TEXT,             -- If gift_type = 'item'
  amount INTEGER,           -- If gift_type = 'oranges' or 'gems'

  message TEXT,             -- Optional gift message

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_gift_history_sender ON gift_history(sender_id, created_at);
CREATE INDEX IF NOT EXISTS idx_gift_history_recipient ON gift_history(recipient_id, created_at);

-- =====================================================
-- SEED ITEMS - EMOJI BADGES (from shop_items)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, emoji, sort_order) VALUES
('emoji-orange', 'Orange', 'emoji_badge', 'basic', 250, '🍊', 1),
('emoji-heart', 'Orange Heart', 'emoji_badge', 'basic', 250, '🧡', 2),
('emoji-seedling', 'Seedling', 'emoji_badge', 'basic', 250, '🌱', 3),
('emoji-star', 'Star', 'emoji_badge', 'basic', 375, '⭐', 4),
('emoji-target', 'Target', 'emoji_badge', 'basic', 375, '🎯', 5),
('emoji-lightning', 'Lightning', 'emoji_badge', 'basic', 750, '⚡', 6),
('emoji-rocket', 'Rocket', 'emoji_badge', 'basic', 750, '🚀', 7),
('emoji-skull', 'Skull', 'emoji_badge', 'basic', 1250, '💀', 8),
('emoji-alien', 'Alien', 'emoji_badge', 'basic', 1250, '👽', 9),
('emoji-robot', 'Robot', 'emoji_badge', 'basic', 1250, '🤖', 10),
('emoji-ape', 'Ape', 'emoji_badge', 'basic', 2000, '🦍', 11),
('emoji-glowstar', 'Glowing Star', 'emoji_badge', 'basic', 2000, '🌟', 12),
('emoji-diamond', 'Diamond', 'emoji_badge', 'premium', 2500, '💎', 13),
('emoji-moneybag', 'Money Bag', 'emoji_badge', 'premium', 3750, '💰', 14),
('emoji-fire', 'Fire (TheStakerClass)', 'emoji_badge', 'premium', 7500, '🔥', 15),
('emoji-cookie', 'Cookie (OrangeGooey)', 'emoji_badge', 'premium', 7500, '🍪', 16),
('emoji-frog', 'Frog (Tom Bepe)', 'emoji_badge', 'premium', 10000, '🐸', 17),
('emoji-goose', 'Goose (Foods)', 'emoji_badge', 'premium', 10000, '🪿', 18),
('emoji-trophy', 'Trophy (Papa Tang)', 'emoji_badge', 'premium', 12500, '🏆', 19),
('emoji-tophat', 'Top Hat (DegenWaffle)', 'emoji_badge', 'premium', 12500, '🎩', 20),
('emoji-crown', 'Crown (Bullish0x)', 'emoji_badge', 'premium', 20000, '👑', 21);

-- =====================================================
-- SEED ITEMS - FRAMES (from shop_items)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
-- Grove Tier
('frame-seedling', 'Seedling', 'frame', 'basic', 1250, 'frame-seedling', 1),
('frame-orange', 'Orange', 'frame', 'basic', 1250, 'frame-orange', 2),
-- Orchard Tier (Glow Effects)
('frame-citrus-glow', 'Citrus Glow', 'frame', 'basic', 3750, 'frame-citrus-glow', 3),
('frame-sunset-grove', 'Sunset Grove', 'frame', 'basic', 3750, 'frame-sunset-grove', 4),
('frame-honey-drip', 'Honey Drip', 'frame', 'basic', 3750, 'frame-honey-drip', 5),
('frame-ocean-mist', 'Ocean Mist', 'frame', 'basic', 3750, 'frame-ocean-mist', 6),
('frame-berry-blush', 'Berry Blush', 'frame', 'basic', 3750, 'frame-berry-blush', 7),
('frame-mint-fresh', 'Mint Fresh', 'frame', 'basic', 3750, 'frame-mint-fresh', 8),
('frame-lavender-dream', 'Lavender Dream', 'frame', 'basic', 3750, 'frame-lavender-dream', 9),
('frame-arctic-frost', 'Arctic Frost', 'frame', 'basic', 3750, 'frame-arctic-frost', 10),
-- Harvest Tier (Animated)
('frame-burning-citrus', 'Burning Citrus', 'frame', 'premium', 12500, 'frame-burning-citrus', 11),
('frame-electric-tang', 'Electric Tang', 'frame', 'premium', 12500, 'frame-electric-tang', 12),
('frame-liquid-gold', 'Liquid Gold', 'frame', 'premium', 12500, 'frame-liquid-gold', 13),
('frame-frozen-juice', 'Frozen Juice', 'frame', 'premium', 12500, 'frame-frozen-juice', 14),
-- Legendary Tier
('frame-aurora-grove', 'Aurora Grove', 'frame', 'premium', 37500, 'frame-aurora-grove', 15),
('frame-void-citrus', 'Void Citrus', 'frame', 'premium', 37500, 'frame-void-citrus', 16),
('frame-holographic-tang', 'Holographic Tang', 'frame', 'premium', 37500, 'frame-holographic-tang', 17),
('frame-supernova', 'Supernova', 'frame', 'premium', 37500, 'frame-supernova', 18),
-- Legend Emoji Frames
('frame-emoji-crown', 'Crown Frame', 'frame', 'premium', 37500, 'frame-emoji-crown', 19),
('frame-emoji-tophat', 'Top Hat Frame', 'frame', 'premium', 37500, 'frame-emoji-tophat', 20),
('frame-emoji-cookie', 'Cookie Frame', 'frame', 'premium', 37500, 'frame-emoji-cookie', 21),
('frame-emoji-frog', 'Frog Frame', 'frame', 'premium', 37500, 'frame-emoji-frog', 22),
('frame-emoji-goose', 'Goose Frame', 'frame', 'premium', 37500, 'frame-emoji-goose', 23),
('frame-emoji-trophy', 'Trophy Frame', 'frame', 'premium', 37500, 'frame-emoji-trophy', 24),
('frame-emoji-fire', 'Fire Frame', 'frame', 'premium', 37500, 'frame-emoji-fire', 25);

-- =====================================================
-- SEED ITEMS - NAME EFFECTS (from shop_items)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
-- Basic Tier
('name-citrus-text', 'Citrus Text', 'name_effect', 'basic', 1250, 'name-citrus-text', 1),
('name-bold-grove', 'Bold Grove', 'name_effect', 'basic', 1250, 'name-bold-grove', 2),
('name-shimmer', 'Shimmer', 'name_effect', 'basic', 1250, 'name-shimmer', 3),
('name-pulse', 'Pulse', 'name_effect', 'basic', 1250, 'name-pulse', 4),
('name-gradient-flow', 'Gradient Flow', 'name_effect', 'basic', 1250, 'name-gradient-flow', 5),
-- Animated Tier
('name-rainbow-tang', 'Rainbow Tang', 'name_effect', 'premium', 7500, 'name-rainbow-tang', 6),
('name-glitch', 'Glitch', 'name_effect', 'premium', 7500, 'name-glitch', 7),
('name-fire-text', 'Fire Text', 'name_effect', 'premium', 7500, 'name-fire-text', 8),
('name-neon-sign', 'Neon Sign', 'name_effect', 'premium', 7500, 'name-neon-sign', 9),
('name-matrix', 'Matrix', 'name_effect', 'premium', 7500, 'name-matrix', 10),
-- Legendary Tier
('name-dripping-gold', 'Dripping Gold', 'name_effect', 'premium', 20000, 'name-dripping-gold', 11),
('name-electric-shock', 'Electric Shock', 'name_effect', 'premium', 20000, 'name-electric-shock', 12),
('name-void-whisper', 'Void Whisper', 'name_effect', 'premium', 20000, 'name-void-whisper', 13),
('name-supernova-text', 'Supernova Text', 'name_effect', 'premium', 20000, 'name-supernova-text', 14);

-- =====================================================
-- SEED ITEMS - TITLES (from shop_items)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, sort_order) VALUES
-- Grove Ranks
('title-seedling', 'Seedling', 'title', 'basic', 1250, 1),
('title-grove-keeper', 'Grove Keeper', 'title', 'basic', 1250, 2),
('title-orchard-master', 'Orchard Master', 'title', 'basic', 1250, 3),
('title-citrus-lord', 'Citrus Lord', 'title', 'basic', 1250, 4),
('title-tang-emperor', 'Tang Emperor', 'title', 'basic', 1250, 5),
-- Mood Titles
('title-vibing', 'Vibing', 'title', 'basic', 2500, 6),
('title-wagmi', 'WAGMI', 'title', 'basic', 2500, 7),
('title-ngmi', 'NGMI', 'title', 'basic', 2500, 8),
('title-diamond-hands', 'Diamond Hands', 'title', 'basic', 2500, 9),
('title-smooth-brain', 'Smooth Brain', 'title', 'basic', 2500, 10),
('title-galaxy-brain', 'Galaxy Brain', 'title', 'basic', 2500, 11),
('title-absolute-unit', 'Absolute Unit', 'title', 'basic', 2500, 12),
('title-touch-grass', 'Touch Grass', 'title', 'basic', 2500, 13),
-- Legend Catchphrases
('title-king-grove', 'King of the Grove', 'title', 'premium', 7500, 14),
('title-neckbeard', 'Neckbeard', 'title', 'premium', 7500, 15),
('title-accept-cookies', 'Accept Cookies', 'title', 'premium', 7500, 16),
('title-bepe-army', 'Bepe Army', 'title', 'premium', 7500, 17),
('title-breadsticks', 'Breadsticks', 'title', 'premium', 7500, 18),
('title-winners-win', 'Winners Win!', 'title', 'premium', 7500, 19),
('title-beret-stays-on', 'The Beret Stays On', 'title', 'premium', 7500, 20);

INSERT OR IGNORE INTO items (id, name, description, category, tier, price_oranges, sort_order) VALUES
('title-custom-slot', 'Custom Title Slot', 'Create your own custom title (with moderation)', 'title', 'premium', 25000, 21);

-- =====================================================
-- SEED ITEMS - BIGPULP HATS (from shop_items)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, sort_order) VALUES
('bigpulp-hat-party', 'Party Hat', 'bigpulp_hat', 'basic', 1250, 1),
('bigpulp-hat-cowboy', 'Cowboy Hat', 'bigpulp_hat', 'basic', 2000, 2),
('bigpulp-hat-chef', 'Chef Hat', 'bigpulp_hat', 'basic', 2000, 3),
('bigpulp-hat-viking', 'Viking Helmet', 'bigpulp_hat', 'basic', 3750, 4),
('bigpulp-hat-pirate', 'Pirate Hat', 'bigpulp_hat', 'basic', 3750, 5),
('bigpulp-hat-beret', 'Beret', 'bigpulp_hat', 'basic', 3750, 6),
('bigpulp-hat-tophat', 'Top Hat', 'bigpulp_hat', 'premium', 5000, 7),
('bigpulp-hat-wizard', 'Wizard Hat', 'bigpulp_hat', 'premium', 5000, 8),
('bigpulp-hat-devil', 'Devil Horns', 'bigpulp_hat', 'premium', 6250, 9),
('bigpulp-hat-crown', 'Crown', 'bigpulp_hat', 'premium', 12500, 10),
('bigpulp-hat-halo', 'Halo', 'bigpulp_hat', 'premium', 12500, 11);

-- =====================================================
-- SEED ITEMS - BIGPULP MOODS (from shop_items)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, sort_order) VALUES
('bigpulp-mood-happy', 'Happy', 'bigpulp_mood', 'free', 0, 1),
('bigpulp-mood-chill', 'Chill', 'bigpulp_mood', 'basic', 750, 2),
('bigpulp-mood-sleepy', 'Sleepy', 'bigpulp_mood', 'basic', 1250, 3),
('bigpulp-mood-hype', 'Hype', 'bigpulp_mood', 'basic', 2000, 4),
('bigpulp-mood-grumpy', 'Grumpy', 'bigpulp_mood', 'basic', 2000, 5),
('bigpulp-mood-sergeant', 'Sergeant', 'bigpulp_mood', 'premium', 3750, 6),
('bigpulp-mood-numb', 'Numb', 'bigpulp_mood', 'premium', 5000, 7),
('bigpulp-mood-rekt', 'Rekt', 'bigpulp_mood', 'premium', 7500, 8);

-- =====================================================
-- SEED ITEMS - BIGPULP ACCESSORIES (from shop_items)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, sort_order) VALUES
('bigpulp-acc-bowtie', 'Bowtie', 'bigpulp_accessory', 'basic', 750, 1),
('bigpulp-acc-bandana', 'Bandana', 'bigpulp_accessory', 'basic', 1250, 2),
('bigpulp-acc-earring', 'Earring', 'bigpulp_accessory', 'basic', 1250, 3),
('bigpulp-acc-headphones', 'Headphones', 'bigpulp_accessory', 'basic', 2000, 4),
('bigpulp-acc-cigar', 'Cigar', 'bigpulp_accessory', 'basic', 2500, 5),
('bigpulp-acc-monocle', 'Monocle', 'bigpulp_accessory', 'premium', 3750, 6),
('bigpulp-acc-scar', 'Scar', 'bigpulp_accessory', 'premium', 5000, 7);

-- =====================================================
-- SEED ITEMS - BACKGROUNDS (from shop_items)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
-- Solid Colors
('bg-midnight', 'Midnight', 'background', 'basic', 1250, 'bg-midnight', 1),
('bg-sunset', 'Sunset', 'background', 'basic', 1250, 'bg-sunset', 2),
('bg-honey', 'Honey', 'background', 'basic', 1250, 'bg-honey', 3),
('bg-forest', 'Forest', 'background', 'basic', 1250, 'bg-forest', 4),
('bg-ember', 'Ember', 'background', 'basic', 1250, 'bg-ember', 5),
-- Gradients
('bg-orange-sunrise', 'Orange Sunrise', 'background', 'basic', 3750, 'bg-orange-sunrise', 6),
('bg-twilight-grove', 'Twilight Grove', 'background', 'basic', 3750, 'bg-twilight-grove', 7),
('bg-deep-ocean', 'Deep Ocean', 'background', 'basic', 3750, 'bg-deep-ocean', 8),
('bg-cotton-candy', 'Cotton Candy', 'background', 'basic', 3750, 'bg-cotton-candy', 9),
-- Animated
('bg-citrus-rain', 'Citrus Rain', 'background', 'premium', 12500, 'bg-citrus-rain', 10),
('bg-floating-oranges', 'Floating Oranges', 'background', 'premium', 12500, 'bg-floating-oranges', 11),
-- Premium Animated
('bg-orange-grove', 'Orange Grove', 'background', 'premium', 20000, 'bg-orange-grove', 12),
('bg-starfield', 'Starfield', 'background', 'premium', 20000, 'bg-starfield', 13),
('bg-matrix-tang', 'Matrix Tang', 'background', 'premium', 20000, 'bg-matrix-tang', 14);

-- =====================================================
-- SEED ITEMS - CELEBRATIONS (from shop_items)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
('celebration-confetti', 'Confetti', 'celebration', 'basic', 2500, 'celebration-confetti', 1),
('celebration-orange-rain', 'Orange Rain', 'celebration', 'basic', 5000, 'celebration-orange-rain', 2),
('celebration-citrus-explosion', 'Citrus Explosion', 'celebration', 'premium', 7500, 'celebration-citrus-explosion', 3),
('celebration-fireworks', 'Fireworks', 'celebration', 'premium', 12500, 'celebration-fireworks', 4);

-- =====================================================
-- SEED ITEMS - FONT COLORS (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_value, preview_type, sort_order) VALUES
-- Basic Colors
('font-color-orange', 'Tang Orange', 'font_color', 'free', 0, '#F97316', 'color', 1),
('font-color-white', 'White', 'font_color', 'basic', 100, '#FFFFFF', 'color', 2),
('font-color-red', 'Red', 'font_color', 'basic', 100, '#EF4444', 'color', 3),
('font-color-yellow', 'Yellow', 'font_color', 'basic', 100, '#FBBF24', 'color', 4),
('font-color-green', 'Green', 'font_color', 'basic', 100, '#22C55E', 'color', 5),
('font-color-blue', 'Blue', 'font_color', 'basic', 100, '#3B82F6', 'color', 6),
('font-color-purple', 'Purple', 'font_color', 'basic', 100, '#A855F7', 'color', 7),
('font-color-pink', 'Pink', 'font_color', 'basic', 100, '#EC4899', 'color', 8),
('font-color-cyan', 'Cyan', 'font_color', 'basic', 100, '#06B6D4', 'color', 9),
('font-color-black', 'Black', 'font_color', 'basic', 250, '#1A1A1A', 'color', 10),
('font-color-gold', 'Gold', 'font_color', 'basic', 500, '#FFD700', 'color', 11),
('font-color-silver', 'Silver', 'font_color', 'basic', 500, '#C0C0C0', 'color', 12),
('font-color-bronze', 'Bronze', 'font_color', 'basic', 500, '#CD7F32', 'color', 13),
-- Gradient Colors
('font-color-gradient-sunset', 'Sunset Gradient', 'font_color', 'basic', 750, 'linear-gradient(90deg, #F97316, #EC4899)', 'color', 14),
('font-color-gradient-ocean', 'Ocean Gradient', 'font_color', 'basic', 750, 'linear-gradient(90deg, #3B82F6, #06B6D4)', 'color', 15),
('font-color-gradient-forest', 'Forest Gradient', 'font_color', 'basic', 750, 'linear-gradient(90deg, #22C55E, #FBBF24)', 'color', 16),
('font-color-gradient-fire', 'Fire Gradient', 'font_color', 'premium', 1000, 'linear-gradient(90deg, #EF4444, #F97316, #FBBF24)', 'color', 17),
('font-color-gradient-ice', 'Ice Gradient', 'font_color', 'premium', 1000, 'linear-gradient(90deg, #FFFFFF, #06B6D4, #3B82F6)', 'color', 18),
('font-color-gradient-royal', 'Royal Gradient', 'font_color', 'premium', 1500, 'linear-gradient(90deg, #A855F7, #FFD700)', 'color', 19),
('font-color-gradient-rainbow', 'Rainbow', 'font_color', 'premium', 2500, 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff)', 'color', 20),
('font-color-gradient-tang', 'Tang Gradient', 'font_color', 'premium', 1000, 'linear-gradient(90deg, #F97316, #FFD700, #FFA500)', 'color', 21);

-- =====================================================
-- SEED ITEMS - FONT STYLES (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, preview_type, sort_order) VALUES
('font-style-normal', 'Normal', 'font_style', 'free', 0, 'font-style-normal', 'text', 1),
('font-style-bold', 'Bold', 'font_style', 'basic', 250, 'font-style-bold', 'text', 2),
('font-style-italic', 'Italic', 'font_style', 'basic', 250, 'font-style-italic', 'text', 3),
('font-style-bold-italic', 'Bold Italic', 'font_style', 'basic', 500, 'font-style-bold-italic', 'text', 4),
('font-style-outline', 'Outline', 'font_style', 'basic', 750, 'font-style-outline', 'text', 5),
('font-style-shadow', 'Shadow', 'font_style', 'basic', 750, 'font-style-shadow', 'text', 6),
('font-style-glow', 'Glow', 'font_style', 'premium', 1000, 'font-style-glow', 'text', 7),
('font-style-3d', '3D Effect', 'font_style', 'premium', 1500, 'font-style-3d', 'text', 8);

-- =====================================================
-- SEED ITEMS - FONT FAMILIES (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_value, preview_type, sort_order) VALUES
('font-family-default', 'Default', 'font_family', 'free', 0, 'system-ui, -apple-system, sans-serif', 'text', 1),
('font-family-impact', 'Impact', 'font_family', 'basic', 500, 'Impact, sans-serif', 'text', 2),
('font-family-monospace', 'Monospace', 'font_family', 'basic', 750, '"Fira Code", "Courier New", monospace', 'text', 3),
('font-family-rounded', 'Rounded', 'font_family', 'basic', 750, '"Nunito", "Comic Sans MS", sans-serif', 'text', 4),
('font-family-retro', 'Retro/Pixel', 'font_family', 'premium', 1000, '"Press Start 2P", monospace', 'text', 5),
('font-family-elegant', 'Elegant', 'font_family', 'premium', 1000, '"Playfair Display", Georgia, serif', 'text', 6),
('font-family-handwritten', 'Handwritten', 'font_family', 'premium', 1000, '"Dancing Script", cursive', 'text', 7),
('font-family-graffiti', 'Graffiti', 'font_family', 'premium', 2000, '"Permanent Marker", cursive', 'text', 8);

-- =====================================================
-- SEED ITEMS - PAGE BACKGROUNDS (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
-- Solid Colors
('bg-midnight-black', 'Midnight Black', 'page_background', 'free', 0, 'drawer-bg-midnight-black', 1),
('bg-deep-navy', 'Deep Navy', 'page_background', 'basic', 500, 'drawer-bg-deep-navy', 2),
('bg-forest-green', 'Forest Green', 'page_background', 'basic', 500, 'drawer-bg-forest-green', 3),
('bg-wine-red', 'Wine Red', 'page_background', 'basic', 500, 'drawer-bg-wine-red', 4),
('bg-royal-purple', 'Royal Purple', 'page_background', 'basic', 500, 'drawer-bg-royal-purple', 5),
('bg-charcoal', 'Charcoal', 'page_background', 'basic', 500, 'drawer-bg-charcoal', 6),
-- Gradients
('bg-gradient-sunset', 'Sunset Fade', 'page_background', 'basic', 1500, 'drawer-bg-gradient-sunset', 7),
('bg-gradient-ocean', 'Ocean Depths', 'page_background', 'basic', 1500, 'drawer-bg-gradient-ocean', 8),
('bg-gradient-aurora', 'Northern Lights', 'page_background', 'premium', 2500, 'drawer-bg-gradient-aurora', 9),
('bg-gradient-ember', 'Ember Glow', 'page_background', 'premium', 2500, 'drawer-bg-gradient-ember', 10),
('bg-gradient-golden', 'Golden Hour', 'page_background', 'premium', 2500, 'drawer-bg-gradient-golden', 11),
-- Patterns
('bg-pattern-grid', 'Grid Pattern', 'page_background', 'basic', 1000, 'drawer-bg-pattern-grid', 12),
('bg-pattern-dots', 'Polka Dots', 'page_background', 'basic', 1000, 'drawer-bg-pattern-dots', 13),
('bg-pattern-diagonal', 'Diagonal Stripes', 'page_background', 'basic', 1000, 'drawer-bg-pattern-diagonal', 14),
('bg-pattern-hexagons', 'Hexagons', 'page_background', 'basic', 1500, 'drawer-bg-pattern-hexagons', 15),
('bg-pattern-circuit', 'Circuit Board', 'page_background', 'premium', 2000, 'drawer-bg-pattern-circuit', 16),
('bg-pattern-stars', 'Starfield', 'page_background', 'premium', 2000, 'drawer-bg-pattern-stars', 17),
-- Animated
('bg-anim-floating-oranges', 'Floating Oranges', 'page_background', 'premium', 5000, 'drawer-bg-anim-floating-oranges', 18),
('bg-anim-particles', 'Particle Field', 'page_background', 'premium', 5000, 'drawer-bg-anim-particles', 19),
('bg-anim-matrix', 'Matrix Rain', 'page_background', 'premium', 7500, 'drawer-bg-anim-matrix', 20),
('bg-anim-starfield', 'Moving Stars', 'page_background', 'premium', 7500, 'drawer-bg-anim-starfield', 21),
('bg-anim-aurora', 'Aurora Waves', 'page_background', 'premium', 10000, 'drawer-bg-anim-aurora', 22),
('bg-anim-grove', 'The Grove', 'page_background', 'premium', 15000, 'drawer-bg-anim-grove', 23),
-- Legendary
('bg-legendary-void', 'Void Portal', 'page_background', 'premium', 25000, 'drawer-bg-legendary-void', 24),
('bg-legendary-supernova', 'Supernova', 'page_background', 'premium', 25000, 'drawer-bg-legendary-supernova', 25),
('bg-legendary-holographic', 'Holographic', 'page_background', 'premium', 30000, 'drawer-bg-legendary-holographic', 26);

-- =====================================================
-- SEED ITEMS - AVATAR GLOW (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
('avatar-glow-none', 'None', 'avatar_glow', 'free', 0, '', 1),
('avatar-glow-soft', 'Soft Glow', 'avatar_glow', 'basic', 500, 'avatar-glow-soft', 2),
('avatar-glow-medium', 'Medium Glow', 'avatar_glow', 'basic', 1000, 'avatar-glow-medium', 3),
('avatar-glow-strong', 'Strong Glow', 'avatar_glow', 'basic', 1500, 'avatar-glow-strong', 4),
('avatar-glow-pulsing', 'Pulsing', 'avatar_glow', 'premium', 2500, 'avatar-glow-pulsing', 5),
('avatar-glow-rainbow', 'Rainbow', 'avatar_glow', 'premium', 5000, 'avatar-glow-rainbow', 6);

-- =====================================================
-- SEED ITEMS - AVATAR SIZE (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
('avatar-size-normal', 'Normal', 'avatar_size', 'free', 0, 'avatar-size-normal', 1),
('avatar-size-large', 'Large', 'avatar_size', 'basic', 1000, 'avatar-size-large', 2),
('avatar-size-xlarge', 'Extra Large', 'avatar_size', 'premium', 2500, 'avatar-size-xlarge', 3),
('avatar-size-massive', 'Massive', 'avatar_size', 'premium', 5000, 'avatar-size-massive', 4);

-- =====================================================
-- SEED ITEMS - BIGPULP POSITION (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
('bigpulp-pos-right', 'Right', 'bigpulp_position', 'free', 0, 'bigpulp-right', 1),
('bigpulp-pos-left', 'Left', 'bigpulp_position', 'basic', 500, 'bigpulp-left', 2),
('bigpulp-pos-center', 'Center', 'bigpulp_position', 'basic', 750, 'bigpulp-center', 3),
('bigpulp-pos-hidden', 'Hidden', 'bigpulp_position', 'free', 0, 'bigpulp-hidden', 4);

-- =====================================================
-- SEED ITEMS - DIALOGUE STYLE (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
('dialogue-style-default', 'Default', 'dialogue_style', 'free', 0, 'dialogue-default', 1),
('dialogue-style-pixel', 'Pixel', 'dialogue_style', 'premium', 1000, 'dialogue-pixel', 2),
('dialogue-style-elegant', 'Elegant', 'dialogue_style', 'premium', 1500, 'dialogue-elegant', 3),
('dialogue-style-comic', 'Comic', 'dialogue_style', 'basic', 1000, 'dialogue-comic', 4),
('dialogue-style-minimal', 'Minimal', 'dialogue_style', 'basic', 500, 'dialogue-minimal', 5),
('dialogue-style-none', 'None', 'dialogue_style', 'free', 0, 'dialogue-none', 6);

-- =====================================================
-- SEED ITEMS - COLLECTION LAYOUT (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
('layout-grid', 'Grid', 'collection_layout', 'free', 0, 'layout-grid', 1),
('layout-list', 'List', 'collection_layout', 'basic', 1000, 'layout-list', 2),
('layout-showcase', 'Showcase', 'collection_layout', 'premium', 2000, 'layout-showcase', 3),
('layout-carousel', 'Carousel', 'collection_layout', 'premium', 2500, 'layout-carousel', 4),
('layout-masonry', 'Masonry', 'collection_layout', 'premium', 2000, 'layout-masonry', 5);

-- =====================================================
-- SEED ITEMS - CARD STYLE (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
('card-style-default', 'Default', 'card_style', 'free', 0, 'card-default', 1),
('card-style-minimal', 'Minimal', 'card_style', 'basic', 750, 'card-minimal', 2),
('card-style-fancy', 'Fancy', 'card_style', 'basic', 1500, 'card-fancy', 3),
('card-style-neon', 'Neon', 'card_style', 'premium', 2500, 'card-neon', 4),
('card-style-glass', 'Glass', 'card_style', 'premium', 2000, 'card-glass', 5),
('card-style-pixel', 'Pixel', 'card_style', 'basic', 1500, 'card-pixel', 6);

-- =====================================================
-- SEED ITEMS - ENTRANCE ANIMATIONS (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
('entrance-none', 'None', 'entrance_animation', 'free', 0, '', 1),
('entrance-fade', 'Fade In', 'entrance_animation', 'basic', 500, 'entrance-fade', 2),
('entrance-slide', 'Slide Up', 'entrance_animation', 'basic', 750, 'entrance-slide', 3),
('entrance-zoom', 'Zoom In', 'entrance_animation', 'basic', 750, 'entrance-zoom', 4),
('entrance-bounce', 'Bounce', 'entrance_animation', 'basic', 1000, 'entrance-bounce', 5),
('entrance-dramatic', 'Dramatic', 'entrance_animation', 'premium', 2500, 'entrance-dramatic', 6),
('entrance-glitch', 'Glitch', 'entrance_animation', 'premium', 2500, 'entrance-glitch', 7);

-- =====================================================
-- SEED ITEMS - VISITOR COUNTER (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
('visitor-counter-hidden', 'Hidden', 'visitor_counter', 'free', 0, '', 1),
('visitor-counter-simple', 'Simple', 'visitor_counter', 'basic', 500, 'visitor-simple', 2),
('visitor-counter-styled', 'Styled', 'visitor_counter', 'basic', 1000, 'visitor-styled', 3),
('visitor-counter-animated', 'Animated', 'visitor_counter', 'premium', 2000, 'visitor-animated', 4);

-- =====================================================
-- SEED ITEMS - STATS STYLE (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
('stats-style-default', 'Default', 'stats_style', 'free', 0, 'stats-default', 1),
('stats-style-minimal', 'Minimal', 'stats_style', 'basic', 500, 'stats-minimal', 2),
('stats-style-detailed', 'Detailed', 'stats_style', 'basic', 1000, 'stats-detailed', 3),
('stats-style-fancy', 'Fancy', 'stats_style', 'basic', 1500, 'stats-fancy', 4),
('stats-style-hidden', 'Hidden', 'stats_style', 'free', 0, 'stats-hidden', 5);

-- =====================================================
-- SEED ITEMS - TABS STYLE (from customization_catalog)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, category, tier, price_oranges, css_class, sort_order) VALUES
('tabs-style-default', 'Default', 'tabs_style', 'free', 0, 'tabs-default', 1),
('tabs-style-pills', 'Pills', 'tabs_style', 'basic', 500, 'tabs-pills', 2),
('tabs-style-underline', 'Underline', 'tabs_style', 'basic', 500, 'tabs-underline', 3),
('tabs-style-chips', 'Chips', 'tabs_style', 'basic', 750, 'tabs-chips', 4),
('tabs-style-hidden', 'Hidden', 'tabs_style', 'free', 0, 'tabs-hidden', 5);

-- =====================================================
-- SEED ITEMS - CONSUMABLES (from migration 012)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, description, category, tier, price_oranges, emoji, is_consumable, consumable_quantity, sort_order) VALUES
('consumable-donuts-10', 'Donut Pack', '10 donuts to flick at your favorite NFTs', 'consumable', 'basic', 50, '🍩', 1, 10, 1),
('consumable-poop-10', 'Poop Pack', '10 poop emojis to throw at NFTs you dislike', 'consumable', 'basic', 50, '💩', 1, 10, 2);

-- =====================================================
-- EXAMPLE BUNDLE (Optional - can add more later)
-- =====================================================
INSERT OR IGNORE INTO items (id, name, description, category, tier, price_oranges, emoji, bundle_items, bundle_discount, sort_order) VALUES
('bundle-starter-pack', 'Starter Pack', 'Essential customizations for your drawer', 'bundle', 'basic', 800, '🎁', '["font-color-gold","font-style-bold","bg-deep-navy"]', 20, 1);

-- =====================================================
-- SPEC 12: Tang Gang Shop & Collectibles System
-- Migration 009: Shop items, inventory, emoji rings, BigPulp
-- =====================================================

-- =====================================================
-- SHOP ITEMS TABLE
-- Master catalog of all purchasable items
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,  -- emoji_badge, frame, title, name_effect, background, celebration, bigpulp_hat, bigpulp_mood, bigpulp_accessory
  rarity TEXT NOT NULL,    -- common, uncommon, rare, epic, legendary, founder
  price_oranges INTEGER DEFAULT 0,
  price_xch REAL DEFAULT 0,
  legend_tribute TEXT,     -- Which legend this honors (if any)
  css_class TEXT,          -- CSS class for rendering
  emoji TEXT,              -- For emoji badges
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_items_category ON shop_items(category, is_active);
CREATE INDEX IF NOT EXISTS idx_shop_items_rarity ON shop_items(rarity);

-- =====================================================
-- USER INVENTORY TABLE (Achievement Drawer)
-- Tracks ALL items a user owns - keeps everything
-- =====================================================
CREATE TABLE IF NOT EXISTS user_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  acquired_at TEXT DEFAULT CURRENT_TIMESTAMP,
  acquisition_type TEXT NOT NULL,  -- purchase, reward, founder, gift

  UNIQUE(user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES shop_items(id)
);

CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item ON user_inventory(item_id);

-- =====================================================
-- USER EQUIPPED TABLE
-- Currently equipped items (one per slot)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_equipped (
  user_id TEXT PRIMARY KEY,
  frame_id TEXT,
  title_id TEXT,
  name_effect_id TEXT,
  background_id TEXT,
  celebration_id TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- USER EMOJI RING TABLE
-- 18 slots for emoji positioning around username
-- =====================================================
CREATE TABLE IF NOT EXISTS user_emoji_ring (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  position TEXT NOT NULL,  -- left_1, left_2, left_3, right_1..., top_1..., bottom_1...

  UNIQUE(user_id, position),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_emoji_ring_user ON user_emoji_ring(user_id);

-- =====================================================
-- USER OWNED EMOJIS TABLE
-- All emojis user has purchased (separate from ring positions)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_owned_emojis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  item_id TEXT NOT NULL,  -- Reference to shop_items
  acquired_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, emoji),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES shop_items(id)
);

CREATE INDEX IF NOT EXISTS idx_user_owned_emojis_user ON user_owned_emojis(user_id);

-- =====================================================
-- USER BIGPULP TABLE
-- BigPulp customization state
-- =====================================================
CREATE TABLE IF NOT EXISTS user_bigpulp (
  user_id TEXT PRIMARY KEY,
  current_hat TEXT,
  current_mood TEXT DEFAULT 'happy',
  current_accessory TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- FOUNDER PURCHASES TABLE
-- XCH founder pack purchases
-- =====================================================
CREATE TABLE IF NOT EXISTS founder_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  transaction_hash TEXT NOT NULL,
  amount_xch REAL NOT NULL,
  purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
  nft_airdrop_claimed INTEGER DEFAULT 0,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- PURCHASE HISTORY TABLE
-- For "Total Spent" tracking in Achievement Drawer
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  price_paid INTEGER NOT NULL,
  currency TEXT DEFAULT 'oranges',  -- oranges or xch
  purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES shop_items(id)
);

CREATE INDEX IF NOT EXISTS idx_purchase_history_user ON purchase_history(user_id);

-- =====================================================
-- CUSTOM TITLES TABLE
-- User-created custom titles (with moderation)
-- =====================================================
CREATE TABLE IF NOT EXISTS custom_titles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  title_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, approved, rejected
  submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  reviewed_by TEXT,
  rejection_reason TEXT,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- SEED SHOP ITEMS DATA (50% Reduced Prices)
-- =====================================================

-- EMOJI BADGES
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, emoji, sort_order) VALUES
('emoji-orange', 'Orange', 'emoji_badge', 'common', 250, '🍊', 1),
('emoji-heart', 'Orange Heart', 'emoji_badge', 'common', 250, '🧡', 2),
('emoji-seedling', 'Seedling', 'emoji_badge', 'common', 250, '🌱', 3),
('emoji-star', 'Star', 'emoji_badge', 'common', 375, '⭐', 4),
('emoji-target', 'Target', 'emoji_badge', 'common', 375, '🎯', 5),
('emoji-lightning', 'Lightning', 'emoji_badge', 'uncommon', 750, '⚡', 6),
('emoji-rocket', 'Rocket', 'emoji_badge', 'uncommon', 750, '🚀', 7),
('emoji-skull', 'Skull', 'emoji_badge', 'rare', 1250, '💀', 8),
('emoji-alien', 'Alien', 'emoji_badge', 'rare', 1250, '👽', 9),
('emoji-robot', 'Robot', 'emoji_badge', 'rare', 1250, '🤖', 10),
('emoji-ape', 'Ape', 'emoji_badge', 'rare', 2000, '🦍', 11),
('emoji-glowstar', 'Glowing Star', 'emoji_badge', 'rare', 2000, '🌟', 12),
('emoji-diamond', 'Diamond', 'emoji_badge', 'epic', 2500, '💎', 13),
('emoji-moneybag', 'Money Bag', 'emoji_badge', 'epic', 3750, '💰', 14),
('emoji-fire', 'Fire (TheStakerClass)', 'emoji_badge', 'legendary', 7500, '🔥', 15),
('emoji-cookie', 'Cookie (OrangeGooey)', 'emoji_badge', 'legendary', 7500, '🍪', 16),
('emoji-frog', 'Frog (Tom Bepe)', 'emoji_badge', 'legendary', 10000, '🐸', 17),
('emoji-goose', 'Goose (Foods)', 'emoji_badge', 'legendary', 10000, '🪿', 18),
('emoji-trophy', 'Trophy (Papa Tang)', 'emoji_badge', 'legendary', 12500, '🏆', 19),
('emoji-tophat', 'Top Hat (DegenWaffle)', 'emoji_badge', 'legendary', 12500, '🎩', 20),
('emoji-crown', 'Crown (Bullish0x)', 'emoji_badge', 'legendary', 20000, '👑', 21);

-- FRAMES - Grove Tier
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('frame-seedling', 'Seedling', 'frame', 'common', 1250, 'frame-seedling', 1),
('frame-orange', 'Orange', 'frame', 'common', 1250, 'frame-orange', 2);

-- FRAMES - Orchard Tier (Glow Effects)
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('frame-citrus-glow', 'Citrus Glow', 'frame', 'uncommon', 3750, 'frame-citrus-glow', 3),
('frame-sunset-grove', 'Sunset Grove', 'frame', 'uncommon', 3750, 'frame-sunset-grove', 4),
('frame-honey-drip', 'Honey Drip', 'frame', 'uncommon', 3750, 'frame-honey-drip', 5),
('frame-ocean-mist', 'Ocean Mist', 'frame', 'uncommon', 3750, 'frame-ocean-mist', 6),
('frame-berry-blush', 'Berry Blush', 'frame', 'uncommon', 3750, 'frame-berry-blush', 7),
('frame-mint-fresh', 'Mint Fresh', 'frame', 'uncommon', 3750, 'frame-mint-fresh', 8),
('frame-lavender-dream', 'Lavender Dream', 'frame', 'uncommon', 3750, 'frame-lavender-dream', 9),
('frame-arctic-frost', 'Arctic Frost', 'frame', 'uncommon', 3750, 'frame-arctic-frost', 10);

-- FRAMES - Harvest Tier (Animated)
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('frame-burning-citrus', 'Burning Citrus', 'frame', 'rare', 12500, 'frame-burning-citrus', 11),
('frame-electric-tang', 'Electric Tang', 'frame', 'rare', 12500, 'frame-electric-tang', 12),
('frame-liquid-gold', 'Liquid Gold', 'frame', 'rare', 12500, 'frame-liquid-gold', 13),
('frame-frozen-juice', 'Frozen Juice', 'frame', 'rare', 12500, 'frame-frozen-juice', 14);

-- FRAMES - Legendary Tier
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('frame-aurora-grove', 'Aurora Grove', 'frame', 'legendary', 37500, 'frame-aurora-grove', 15),
('frame-void-citrus', 'Void Citrus', 'frame', 'legendary', 37500, 'frame-void-citrus', 16),
('frame-holographic-tang', 'Holographic Tang', 'frame', 'legendary', 37500, 'frame-holographic-tang', 17),
('frame-supernova', 'Supernova', 'frame', 'legendary', 37500, 'frame-supernova', 18);

-- FRAMES - Legend Emoji Frames
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('frame-emoji-crown', 'Crown Frame', 'frame', 'legendary', 37500, 'frame-emoji-crown', 19),
('frame-emoji-tophat', 'Top Hat Frame', 'frame', 'legendary', 37500, 'frame-emoji-tophat', 20),
('frame-emoji-cookie', 'Cookie Frame', 'frame', 'legendary', 37500, 'frame-emoji-cookie', 21),
('frame-emoji-frog', 'Frog Frame', 'frame', 'legendary', 37500, 'frame-emoji-frog', 22),
('frame-emoji-goose', 'Goose Frame', 'frame', 'legendary', 37500, 'frame-emoji-goose', 23),
('frame-emoji-trophy', 'Trophy Frame', 'frame', 'legendary', 37500, 'frame-emoji-trophy', 24),
('frame-emoji-fire', 'Fire Frame', 'frame', 'legendary', 37500, 'frame-emoji-fire', 25);

-- NAME EFFECTS - Basic Tier
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('name-citrus-text', 'Citrus Text', 'name_effect', 'common', 1250, 'name-citrus-text', 1),
('name-bold-grove', 'Bold Grove', 'name_effect', 'common', 1250, 'name-bold-grove', 2),
('name-shimmer', 'Shimmer', 'name_effect', 'common', 1250, 'name-shimmer', 3),
('name-pulse', 'Pulse', 'name_effect', 'common', 1250, 'name-pulse', 4),
('name-gradient-flow', 'Gradient Flow', 'name_effect', 'common', 1250, 'name-gradient-flow', 5);

-- NAME EFFECTS - Animated Tier
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('name-rainbow-tang', 'Rainbow Tang', 'name_effect', 'rare', 7500, 'name-rainbow-tang', 6),
('name-glitch', 'Glitch', 'name_effect', 'rare', 7500, 'name-glitch', 7),
('name-fire-text', 'Fire Text', 'name_effect', 'rare', 7500, 'name-fire-text', 8),
('name-neon-sign', 'Neon Sign', 'name_effect', 'rare', 7500, 'name-neon-sign', 9),
('name-matrix', 'Matrix', 'name_effect', 'rare', 7500, 'name-matrix', 10);

-- NAME EFFECTS - Legendary Tier
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('name-dripping-gold', 'Dripping Gold', 'name_effect', 'legendary', 20000, 'name-dripping-gold', 11),
('name-electric-shock', 'Electric Shock', 'name_effect', 'legendary', 20000, 'name-electric-shock', 12),
('name-void-whisper', 'Void Whisper', 'name_effect', 'legendary', 20000, 'name-void-whisper', 13),
('name-supernova-text', 'Supernova Text', 'name_effect', 'legendary', 20000, 'name-supernova-text', 14);

-- TITLES - Grove Ranks
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, sort_order) VALUES
('title-seedling', 'Seedling', 'title', 'common', 1250, 1),
('title-grove-keeper', 'Grove Keeper', 'title', 'common', 1250, 2),
('title-orchard-master', 'Orchard Master', 'title', 'common', 1250, 3),
('title-citrus-lord', 'Citrus Lord', 'title', 'common', 1250, 4),
('title-tang-emperor', 'Tang Emperor', 'title', 'common', 1250, 5);

-- TITLES - Mood Titles
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, sort_order) VALUES
('title-vibing', 'Vibing', 'title', 'uncommon', 2500, 6),
('title-wagmi', 'WAGMI', 'title', 'uncommon', 2500, 7),
('title-ngmi', 'NGMI', 'title', 'uncommon', 2500, 8),
('title-diamond-hands', 'Diamond Hands', 'title', 'uncommon', 2500, 9),
('title-smooth-brain', 'Smooth Brain', 'title', 'uncommon', 2500, 10),
('title-galaxy-brain', 'Galaxy Brain', 'title', 'uncommon', 2500, 11),
('title-absolute-unit', 'Absolute Unit', 'title', 'uncommon', 2500, 12),
('title-touch-grass', 'Touch Grass', 'title', 'uncommon', 2500, 13);

-- TITLES - Legend Catchphrases
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, legend_tribute, sort_order) VALUES
('title-king-grove', 'King of the Grove', 'title', 'legendary', 7500, 'Bullish0x', 14),
('title-neckbeard', 'Neckbeard', 'title', 'legendary', 7500, 'DegenWaffle', 15),
('title-accept-cookies', 'Accept Cookies', 'title', 'legendary', 7500, 'OrangeGooey', 16),
('title-bepe-army', 'Bepe Army', 'title', 'legendary', 7500, 'Tom Bepe', 17),
('title-breadsticks', 'Breadsticks', 'title', 'legendary', 7500, 'Foods', 18),
('title-winners-win', 'Winners Win!', 'title', 'legendary', 7500, 'Papa Tang', 19),
('title-beret-stays-on', 'The Beret Stays On', 'title', 'legendary', 7500, 'TheStakerClass', 20);

-- TITLES - Custom Title Slot
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, description, sort_order) VALUES
('title-custom-slot', 'Custom Title Slot', 'title', 'legendary', 25000, 'Create your own custom title (with moderation)', 21);

-- BIGPULP HATS
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, sort_order) VALUES
('bigpulp-hat-party', 'Party Hat', 'bigpulp_hat', 'common', 1250, 1),
('bigpulp-hat-cowboy', 'Cowboy Hat', 'bigpulp_hat', 'common', 2000, 2),
('bigpulp-hat-chef', 'Chef Hat', 'bigpulp_hat', 'common', 2000, 3),
('bigpulp-hat-viking', 'Viking Helmet', 'bigpulp_hat', 'uncommon', 3750, 4),
('bigpulp-hat-pirate', 'Pirate Hat', 'bigpulp_hat', 'uncommon', 3750, 5),
('bigpulp-hat-beret', 'Beret', 'bigpulp_hat', 'uncommon', 3750, 6),
('bigpulp-hat-tophat', 'Top Hat', 'bigpulp_hat', 'rare', 5000, 7),
('bigpulp-hat-wizard', 'Wizard Hat', 'bigpulp_hat', 'rare', 5000, 8),
('bigpulp-hat-devil', 'Devil Horns', 'bigpulp_hat', 'rare', 6250, 9),
('bigpulp-hat-crown', 'Crown', 'bigpulp_hat', 'legendary', 12500, 10),
('bigpulp-hat-halo', 'Halo', 'bigpulp_hat', 'legendary', 12500, 11);

-- BIGPULP MOODS
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, sort_order) VALUES
('bigpulp-mood-happy', 'Happy', 'bigpulp_mood', 'common', 750, 1),
('bigpulp-mood-chill', 'Chill', 'bigpulp_mood', 'common', 750, 2),
('bigpulp-mood-sleepy', 'Sleepy', 'bigpulp_mood', 'common', 1250, 3),
('bigpulp-mood-hype', 'Hype', 'bigpulp_mood', 'uncommon', 2000, 4),
('bigpulp-mood-grumpy', 'Grumpy', 'bigpulp_mood', 'uncommon', 2000, 5),
('bigpulp-mood-sergeant', 'Sergeant', 'bigpulp_mood', 'rare', 3750, 6),
('bigpulp-mood-numb', 'Numb', 'bigpulp_mood', 'rare', 5000, 7),
('bigpulp-mood-rekt', 'Rekt', 'bigpulp_mood', 'legendary', 7500, 8);

-- BIGPULP ACCESSORIES
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, sort_order) VALUES
('bigpulp-acc-bowtie', 'Bowtie', 'bigpulp_accessory', 'common', 750, 1),
('bigpulp-acc-bandana', 'Bandana', 'bigpulp_accessory', 'common', 1250, 2),
('bigpulp-acc-earring', 'Earring', 'bigpulp_accessory', 'common', 1250, 3),
('bigpulp-acc-headphones', 'Headphones', 'bigpulp_accessory', 'uncommon', 2000, 4),
('bigpulp-acc-cigar', 'Cigar', 'bigpulp_accessory', 'uncommon', 2500, 5),
('bigpulp-acc-monocle', 'Monocle', 'bigpulp_accessory', 'rare', 3750, 6),
('bigpulp-acc-scar', 'Scar', 'bigpulp_accessory', 'rare', 5000, 7);

-- BACKGROUNDS - Solid Colors
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('bg-midnight', 'Midnight', 'background', 'common', 1250, 'bg-midnight', 1),
('bg-sunset', 'Sunset', 'background', 'common', 1250, 'bg-sunset', 2),
('bg-honey', 'Honey', 'background', 'common', 1250, 'bg-honey', 3),
('bg-forest', 'Forest', 'background', 'common', 1250, 'bg-forest', 4),
('bg-ember', 'Ember', 'background', 'common', 1250, 'bg-ember', 5);

-- BACKGROUNDS - Gradients
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('bg-orange-sunrise', 'Orange Sunrise', 'background', 'uncommon', 3750, 'bg-orange-sunrise', 6),
('bg-twilight-grove', 'Twilight Grove', 'background', 'uncommon', 3750, 'bg-twilight-grove', 7),
('bg-deep-ocean', 'Deep Ocean', 'background', 'uncommon', 3750, 'bg-deep-ocean', 8),
('bg-cotton-candy', 'Cotton Candy', 'background', 'uncommon', 3750, 'bg-cotton-candy', 9);

-- BACKGROUNDS - Animated
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('bg-citrus-rain', 'Citrus Rain', 'background', 'rare', 12500, 'bg-citrus-rain', 10),
('bg-floating-oranges', 'Floating Oranges', 'background', 'rare', 12500, 'bg-floating-oranges', 11);

-- BACKGROUNDS - Premium Animated
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('bg-orange-grove', 'Orange Grove', 'background', 'legendary', 20000, 'bg-orange-grove', 12),
('bg-starfield', 'Starfield', 'background', 'legendary', 20000, 'bg-starfield', 13),
('bg-matrix-tang', 'Matrix Tang', 'background', 'legendary', 20000, 'bg-matrix-tang', 14);

-- CELEBRATIONS
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_oranges, css_class, sort_order) VALUES
('celebration-confetti', 'Confetti', 'celebration', 'common', 2500, 'celebration-confetti', 1),
('celebration-orange-rain', 'Orange Rain', 'celebration', 'uncommon', 5000, 'celebration-orange-rain', 2),
('celebration-citrus-explosion', 'Citrus Explosion', 'celebration', 'rare', 7500, 'celebration-citrus-explosion', 3),
('celebration-fireworks', 'Fireworks', 'celebration', 'legendary', 12500, 'celebration-fireworks', 4);

-- FOUNDER'S COLLECTION (XCH payment)
INSERT OR IGNORE INTO shop_items (id, name, category, rarity, price_xch, description, css_class, sort_order) VALUES
('founder-collection', 'Founder''s Collection', 'founder', 'founder', 50.0, 'Exclusive founder pack with all premium items + future NFT airdrop', 'founder-collection', 1);

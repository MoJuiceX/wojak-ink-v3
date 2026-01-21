-- =====================================================
-- SPEC 12B: Achievement Drawer & Profile Customization
-- Migration 010: Drawer customization tables and catalog
-- =====================================================

-- =====================================================
-- DRAWER CUSTOMIZATION SETTINGS TABLE
-- Stores user's current customization choices
-- =====================================================
CREATE TABLE IF NOT EXISTS drawer_customization (
  user_id TEXT PRIMARY KEY,

  -- Username styling
  font_color TEXT DEFAULT 'orange',
  font_style TEXT DEFAULT 'normal',
  font_family TEXT DEFAULT 'default',

  -- Page background
  page_background TEXT DEFAULT 'midnight_black',

  -- Avatar enhancements
  avatar_glow TEXT DEFAULT 'none',
  avatar_size TEXT DEFAULT 'normal',

  -- BigPulp
  bigpulp_position TEXT DEFAULT 'right',
  dialogue_style TEXT DEFAULT 'default',
  dialogue_color TEXT DEFAULT 'dark',

  -- Stats panel
  stats_style TEXT DEFAULT 'default',
  stats_color TEXT DEFAULT 'orange',
  stats_visible TEXT DEFAULT '["items","emojis","spent"]',

  -- Collection display
  collection_layout TEXT DEFAULT 'grid',
  card_style TEXT DEFAULT 'default',
  featured_slots INTEGER DEFAULT 0,
  featured_items TEXT,
  category_tabs_style TEXT DEFAULT 'default',

  -- Page options
  page_theme TEXT DEFAULT 'dark',
  page_border TEXT DEFAULT 'none',
  entrance_animation TEXT DEFAULT 'none',
  background_music TEXT,
  visitor_counter_style TEXT DEFAULT 'hidden',

  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- USER CUSTOMIZATION ITEMS TABLE
-- Tracks purchased customization items
-- =====================================================
CREATE TABLE IF NOT EXISTS user_customization_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  item_id TEXT NOT NULL,
  purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, category, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_customization_items_user ON user_customization_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_customization_items_category ON user_customization_items(category);

-- =====================================================
-- DRAWER VISITORS TABLE
-- Tracks profile visits for visitor counter
-- =====================================================
CREATE TABLE IF NOT EXISTS drawer_visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drawer_user_id TEXT NOT NULL,
  visitor_user_id TEXT,
  visited_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (drawer_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_drawer_visitors_drawer ON drawer_visitors(drawer_user_id, visited_at);

-- =====================================================
-- CUSTOMIZATION CATALOG TABLE
-- Master catalog of all customization options with prices
-- =====================================================
CREATE TABLE IF NOT EXISTS customization_catalog (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_oranges INTEGER DEFAULT 0,
  css_class TEXT,
  css_value TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customization_catalog_category ON customization_catalog(category, is_active);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - FONT COLORS
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_value, sort_order) VALUES
-- Basic Colors (CHEAP - 100 oranges)
('font-color-orange', 'font_color', 'Tang Orange', 0, '#F97316', 1),
('font-color-white', 'font_color', 'White', 100, '#FFFFFF', 2),
('font-color-red', 'font_color', 'Red', 100, '#EF4444', 3),
('font-color-yellow', 'font_color', 'Yellow', 100, '#FBBF24', 4),
('font-color-green', 'font_color', 'Green', 100, '#22C55E', 5),
('font-color-blue', 'font_color', 'Blue', 100, '#3B82F6', 6),
('font-color-purple', 'font_color', 'Purple', 100, '#A855F7', 7),
('font-color-pink', 'font_color', 'Pink', 100, '#EC4899', 8),
('font-color-cyan', 'font_color', 'Cyan', 100, '#06B6D4', 9),
('font-color-black', 'font_color', 'Black', 250, '#1A1A1A', 10),
('font-color-gold', 'font_color', 'Gold', 500, '#FFD700', 11),
('font-color-silver', 'font_color', 'Silver', 500, '#C0C0C0', 12),
('font-color-bronze', 'font_color', 'Bronze', 500, '#CD7F32', 13),
-- Gradient Colors
('font-color-gradient-sunset', 'font_color', 'Sunset Gradient', 750, 'linear-gradient(90deg, #F97316, #EC4899)', 14),
('font-color-gradient-ocean', 'font_color', 'Ocean Gradient', 750, 'linear-gradient(90deg, #3B82F6, #06B6D4)', 15),
('font-color-gradient-forest', 'font_color', 'Forest Gradient', 750, 'linear-gradient(90deg, #22C55E, #FBBF24)', 16),
('font-color-gradient-fire', 'font_color', 'Fire Gradient', 1000, 'linear-gradient(90deg, #EF4444, #F97316, #FBBF24)', 17),
('font-color-gradient-ice', 'font_color', 'Ice Gradient', 1000, 'linear-gradient(90deg, #FFFFFF, #06B6D4, #3B82F6)', 18),
('font-color-gradient-royal', 'font_color', 'Royal Gradient', 1500, 'linear-gradient(90deg, #A855F7, #FFD700)', 19),
('font-color-gradient-rainbow', 'font_color', 'Rainbow', 2500, 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff)', 20),
('font-color-gradient-tang', 'font_color', 'Tang Gradient', 1000, 'linear-gradient(90deg, #F97316, #FFD700, #FFA500)', 21);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - FONT STYLES
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_class, sort_order) VALUES
('font-style-normal', 'font_style', 'Normal', 0, 'font-style-normal', 1),
('font-style-bold', 'font_style', 'Bold', 250, 'font-style-bold', 2),
('font-style-italic', 'font_style', 'Italic', 250, 'font-style-italic', 3),
('font-style-bold-italic', 'font_style', 'Bold Italic', 500, 'font-style-bold-italic', 4),
('font-style-outline', 'font_style', 'Outline', 750, 'font-style-outline', 5),
('font-style-shadow', 'font_style', 'Shadow', 750, 'font-style-shadow', 6),
('font-style-glow', 'font_style', 'Glow', 1000, 'font-style-glow', 7),
('font-style-3d', 'font_style', '3D Effect', 1500, 'font-style-3d', 8);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - FONT FAMILIES
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_value, sort_order) VALUES
('font-family-default', 'font_family', 'Default', 0, 'system-ui, -apple-system, sans-serif', 1),
('font-family-impact', 'font_family', 'Impact', 500, 'Impact, sans-serif', 2),
('font-family-monospace', 'font_family', 'Monospace', 750, '"Fira Code", "Courier New", monospace', 3),
('font-family-rounded', 'font_family', 'Rounded', 750, '"Nunito", "Comic Sans MS", sans-serif', 4),
('font-family-retro', 'font_family', 'Retro/Pixel', 1000, '"Press Start 2P", monospace', 5),
('font-family-elegant', 'font_family', 'Elegant', 1000, '"Playfair Display", Georgia, serif', 6),
('font-family-handwritten', 'font_family', 'Handwritten', 1000, '"Dancing Script", cursive', 7),
('font-family-graffiti', 'font_family', 'Graffiti', 2000, '"Permanent Marker", cursive', 8);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - PAGE BACKGROUNDS
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_class, sort_order) VALUES
-- Solid Colors
('bg-midnight-black', 'page_background', 'Midnight Black', 0, 'drawer-bg-midnight-black', 1),
('bg-deep-navy', 'page_background', 'Deep Navy', 500, 'drawer-bg-deep-navy', 2),
('bg-forest-green', 'page_background', 'Forest Green', 500, 'drawer-bg-forest-green', 3),
('bg-wine-red', 'page_background', 'Wine Red', 500, 'drawer-bg-wine-red', 4),
('bg-royal-purple', 'page_background', 'Royal Purple', 500, 'drawer-bg-royal-purple', 5),
('bg-charcoal', 'page_background', 'Charcoal', 500, 'drawer-bg-charcoal', 6),
-- Gradients
('bg-gradient-sunset', 'page_background', 'Sunset Fade', 1500, 'drawer-bg-gradient-sunset', 7),
('bg-gradient-ocean', 'page_background', 'Ocean Depths', 1500, 'drawer-bg-gradient-ocean', 8),
('bg-gradient-aurora', 'page_background', 'Northern Lights', 2500, 'drawer-bg-gradient-aurora', 9),
('bg-gradient-ember', 'page_background', 'Ember Glow', 2500, 'drawer-bg-gradient-ember', 10),
('bg-gradient-golden', 'page_background', 'Golden Hour', 2500, 'drawer-bg-gradient-golden', 11),
-- Patterns
('bg-pattern-grid', 'page_background', 'Grid Pattern', 1000, 'drawer-bg-pattern-grid', 12),
('bg-pattern-dots', 'page_background', 'Polka Dots', 1000, 'drawer-bg-pattern-dots', 13),
('bg-pattern-diagonal', 'page_background', 'Diagonal Stripes', 1000, 'drawer-bg-pattern-diagonal', 14),
('bg-pattern-hexagons', 'page_background', 'Hexagons', 1500, 'drawer-bg-pattern-hexagons', 15),
('bg-pattern-circuit', 'page_background', 'Circuit Board', 2000, 'drawer-bg-pattern-circuit', 16),
('bg-pattern-stars', 'page_background', 'Starfield', 2000, 'drawer-bg-pattern-stars', 17),
-- Animated
('bg-anim-floating-oranges', 'page_background', 'Floating Oranges', 5000, 'drawer-bg-anim-floating-oranges', 18),
('bg-anim-particles', 'page_background', 'Particle Field', 5000, 'drawer-bg-anim-particles', 19),
('bg-anim-matrix', 'page_background', 'Matrix Rain', 7500, 'drawer-bg-anim-matrix', 20),
('bg-anim-starfield', 'page_background', 'Moving Stars', 7500, 'drawer-bg-anim-starfield', 21),
('bg-anim-aurora', 'page_background', 'Aurora Waves', 10000, 'drawer-bg-anim-aurora', 22),
('bg-anim-grove', 'page_background', 'The Grove', 15000, 'drawer-bg-anim-grove', 23),
-- Legendary
('bg-legendary-void', 'page_background', 'Void Portal', 25000, 'drawer-bg-legendary-void', 24),
('bg-legendary-supernova', 'page_background', 'Supernova', 25000, 'drawer-bg-legendary-supernova', 25),
('bg-legendary-holographic', 'page_background', 'Holographic', 30000, 'drawer-bg-legendary-holographic', 26);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - AVATAR GLOW
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_class, sort_order) VALUES
('avatar-glow-none', 'avatar_glow', 'None', 0, '', 1),
('avatar-glow-soft', 'avatar_glow', 'Soft Glow', 500, 'avatar-glow-soft', 2),
('avatar-glow-medium', 'avatar_glow', 'Medium Glow', 1000, 'avatar-glow-medium', 3),
('avatar-glow-strong', 'avatar_glow', 'Strong Glow', 1500, 'avatar-glow-strong', 4),
('avatar-glow-pulsing', 'avatar_glow', 'Pulsing', 2500, 'avatar-glow-pulsing', 5),
('avatar-glow-rainbow', 'avatar_glow', 'Rainbow', 5000, 'avatar-glow-rainbow', 6);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - AVATAR SIZE
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_class, sort_order) VALUES
('avatar-size-normal', 'avatar_size', 'Normal', 0, 'avatar-size-normal', 1),
('avatar-size-large', 'avatar_size', 'Large', 1000, 'avatar-size-large', 2),
('avatar-size-xlarge', 'avatar_size', 'Extra Large', 2500, 'avatar-size-xlarge', 3),
('avatar-size-massive', 'avatar_size', 'Massive', 5000, 'avatar-size-massive', 4);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - BIGPULP POSITION
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_class, sort_order) VALUES
('bigpulp-pos-right', 'bigpulp_position', 'Right', 0, 'bigpulp-right', 1),
('bigpulp-pos-left', 'bigpulp_position', 'Left', 500, 'bigpulp-left', 2),
('bigpulp-pos-center', 'bigpulp_position', 'Center', 750, 'bigpulp-center', 3),
('bigpulp-pos-hidden', 'bigpulp_position', 'Hidden', 0, 'bigpulp-hidden', 4);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - DIALOGUE STYLE
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_class, sort_order) VALUES
('dialogue-style-default', 'dialogue_style', 'Default', 0, 'dialogue-default', 1),
('dialogue-style-pixel', 'dialogue_style', 'Pixel', 1000, 'dialogue-pixel', 2),
('dialogue-style-elegant', 'dialogue_style', 'Elegant', 1500, 'dialogue-elegant', 3),
('dialogue-style-comic', 'dialogue_style', 'Comic', 1000, 'dialogue-comic', 4),
('dialogue-style-minimal', 'dialogue_style', 'Minimal', 500, 'dialogue-minimal', 5),
('dialogue-style-none', 'dialogue_style', 'None', 0, 'dialogue-none', 6);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - COLLECTION LAYOUT
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_class, sort_order) VALUES
('layout-grid', 'collection_layout', 'Grid', 0, 'layout-grid', 1),
('layout-list', 'collection_layout', 'List', 1000, 'layout-list', 2),
('layout-showcase', 'collection_layout', 'Showcase', 2000, 'layout-showcase', 3),
('layout-carousel', 'collection_layout', 'Carousel', 2500, 'layout-carousel', 4),
('layout-masonry', 'collection_layout', 'Masonry', 2000, 'layout-masonry', 5);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - CARD STYLE
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_class, sort_order) VALUES
('card-style-default', 'card_style', 'Default', 0, 'card-default', 1),
('card-style-minimal', 'card_style', 'Minimal', 750, 'card-minimal', 2),
('card-style-fancy', 'card_style', 'Fancy', 1500, 'card-fancy', 3),
('card-style-neon', 'card_style', 'Neon', 2500, 'card-neon', 4),
('card-style-glass', 'card_style', 'Glass', 2000, 'card-glass', 5),
('card-style-pixel', 'card_style', 'Pixel', 1500, 'card-pixel', 6);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - ENTRANCE ANIMATIONS
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_class, sort_order) VALUES
('entrance-none', 'entrance_animation', 'None', 0, '', 1),
('entrance-fade', 'entrance_animation', 'Fade In', 500, 'entrance-fade', 2),
('entrance-slide', 'entrance_animation', 'Slide Up', 750, 'entrance-slide', 3),
('entrance-zoom', 'entrance_animation', 'Zoom In', 750, 'entrance-zoom', 4),
('entrance-bounce', 'entrance_animation', 'Bounce', 1000, 'entrance-bounce', 5),
('entrance-dramatic', 'entrance_animation', 'Dramatic', 2500, 'entrance-dramatic', 6),
('entrance-glitch', 'entrance_animation', 'Glitch', 2500, 'entrance-glitch', 7);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - VISITOR COUNTER
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_class, sort_order) VALUES
('visitor-counter-hidden', 'visitor_counter_style', 'Hidden', 0, '', 1),
('visitor-counter-simple', 'visitor_counter_style', 'Simple', 500, 'visitor-simple', 2),
('visitor-counter-styled', 'visitor_counter_style', 'Styled', 1000, 'visitor-styled', 3),
('visitor-counter-animated', 'visitor_counter_style', 'Animated', 2000, 'visitor-animated', 4);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - STATS STYLE
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_class, sort_order) VALUES
('stats-style-default', 'stats_style', 'Default', 0, 'stats-default', 1),
('stats-style-minimal', 'stats_style', 'Minimal', 500, 'stats-minimal', 2),
('stats-style-detailed', 'stats_style', 'Detailed', 1000, 'stats-detailed', 3),
('stats-style-fancy', 'stats_style', 'Fancy', 1500, 'stats-fancy', 4),
('stats-style-hidden', 'stats_style', 'Hidden', 0, 'stats-hidden', 5);

-- =====================================================
-- SEED CUSTOMIZATION CATALOG - CATEGORY TABS STYLE
-- =====================================================
INSERT OR IGNORE INTO customization_catalog (id, category, name, price_oranges, css_class, sort_order) VALUES
('tabs-style-default', 'category_tabs_style', 'Default', 0, 'tabs-default', 1),
('tabs-style-pills', 'category_tabs_style', 'Pills', 500, 'tabs-pills', 2),
('tabs-style-underline', 'category_tabs_style', 'Underline', 500, 'tabs-underline', 3),
('tabs-style-chips', 'category_tabs_style', 'Chips', 750, 'tabs-chips', 4),
('tabs-style-hidden', 'category_tabs_style', 'Hidden', 0, 'tabs-hidden', 5);

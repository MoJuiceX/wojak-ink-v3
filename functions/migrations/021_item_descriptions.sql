-- =====================================================
-- Migration 021: Add effect column and item descriptions
-- For SPEC 25: Shop UX Improvements
-- =====================================================

-- Add effect column to items table
ALTER TABLE items ADD COLUMN effect TEXT;

-- =====================================================
-- UPDATE DESCRIPTIONS FOR FRAMES
-- =====================================================
UPDATE items SET
  description = 'A gentle frame for new explorers',
  effect = 'Adds a soft green gradient frame around your NFT'
WHERE id = 'frame-seedling';

UPDATE items SET
  description = 'Classic Tang Gang colors',
  effect = 'Wraps your NFT in a warm orange gradient frame'
WHERE id = 'frame-orange';

UPDATE items SET
  description = 'Bright citrus-inspired radiance',
  effect = 'Creates a glowing orange/yellow gradient frame around your NFT'
WHERE id = 'frame-citrus-glow';

UPDATE items SET
  description = 'Warm sunset over the grove',
  effect = 'Adds warm orange-to-purple gradient frame'
WHERE id = 'frame-sunset-grove';

UPDATE items SET
  description = 'Sweet golden drips',
  effect = 'Surrounds your NFT with golden honey-colored gradient'
WHERE id = 'frame-honey-drip';

UPDATE items SET
  description = 'A calming blue-tinted frame',
  effect = 'Adds a soft ocean blue gradient frame around your NFT'
WHERE id = 'frame-ocean-mist';

UPDATE items SET
  description = 'Soft pink berry tones',
  effect = 'Surrounds your NFT with a gentle pink gradient'
WHERE id = 'frame-berry-blush';

UPDATE items SET
  description = 'Cool and refreshing',
  effect = 'Adds a fresh mint green gradient frame'
WHERE id = 'frame-mint-fresh';

UPDATE items SET
  description = 'Peaceful purple hues',
  effect = 'Creates a calming lavender gradient frame'
WHERE id = 'frame-lavender-dream';

UPDATE items SET
  description = 'Ice cold vibes',
  effect = 'Adds a frosty blue-white gradient frame'
WHERE id = 'frame-arctic-frost';

UPDATE items SET
  description = 'Flames of the citrus',
  effect = 'Animated burning effect around your NFT'
WHERE id = 'frame-burning-citrus';

UPDATE items SET
  description = 'Electric energy flows',
  effect = 'Animated crackling electricity around your NFT'
WHERE id = 'frame-electric-tang';

UPDATE items SET
  description = 'Pure molten gold',
  effect = 'Animated liquid gold flowing around your NFT'
WHERE id = 'frame-liquid-gold';

UPDATE items SET
  description = 'Ice crystals form',
  effect = 'Animated ice crystallization effect'
WHERE id = 'frame-frozen-juice';

UPDATE items SET
  description = 'Northern lights dance',
  effect = 'Animated aurora borealis effect around your NFT'
WHERE id = 'frame-aurora-grove';

UPDATE items SET
  description = 'The void consumes',
  effect = 'Dark matter swirls around your NFT'
WHERE id = 'frame-void-citrus';

UPDATE items SET
  description = 'Holographic shimmer',
  effect = 'Rainbow holographic effect that shifts with movement'
WHERE id = 'frame-holographic-tang';

UPDATE items SET
  description = 'Cosmic explosion',
  effect = 'Animated supernova burst effect'
WHERE id = 'frame-supernova';

-- =====================================================
-- UPDATE DESCRIPTIONS FOR NAME EFFECTS
-- =====================================================
UPDATE items SET
  description = 'Classic Tang colors',
  effect = 'Your name displays in orange gradient text'
WHERE id = 'name-citrus-text';

UPDATE items SET
  description = 'Strong and impactful',
  effect = 'Your name displays in bold green text'
WHERE id = 'name-bold-grove';

UPDATE items SET
  description = 'Subtle sparkle',
  effect = 'Your name gently shimmers'
WHERE id = 'name-shimmer';

UPDATE items SET
  description = 'Heartbeat rhythm',
  effect = 'Your name pulses with a gentle glow'
WHERE id = 'name-pulse';

UPDATE items SET
  description = 'Colors in motion',
  effect = 'Animated gradient flows through your name'
WHERE id = 'name-gradient-flow';

UPDATE items SET
  description = 'All the colors',
  effect = 'Animated rainbow cycles through your name'
WHERE id = 'name-rainbow-tang';

UPDATE items SET
  description = 'Digital corruption',
  effect = 'Your name glitches and distorts'
WHERE id = 'name-glitch';

UPDATE items SET
  description = 'Burning hot',
  effect = 'Animated fire effect on your name'
WHERE id = 'name-fire-text';

UPDATE items SET
  description = 'Bright city lights',
  effect = 'Your name glows like a neon sign'
WHERE id = 'name-neon-sign';

UPDATE items SET
  description = 'Enter the Matrix',
  effect = 'Digital rain falls behind your name'
WHERE id = 'name-matrix';

UPDATE items SET
  description = 'Liquid luxury',
  effect = 'Gold drips from your name'
WHERE id = 'name-dripping-gold';

UPDATE items SET
  description = 'High voltage',
  effect = 'Electricity crackles around your name'
WHERE id = 'name-electric-shock';

UPDATE items SET
  description = 'From the darkness',
  effect = 'Dark whisps emanate from your name'
WHERE id = 'name-void-whisper';

UPDATE items SET
  description = 'Cosmic explosion',
  effect = 'Your name explodes with stellar energy'
WHERE id = 'name-supernova-text';

-- =====================================================
-- UPDATE DESCRIPTIONS FOR TITLES
-- =====================================================
UPDATE items SET
  description = 'Just starting your journey',
  effect = 'Displays "Seedling" title below your name'
WHERE id = 'title-seedling';

UPDATE items SET
  description = 'Protector of the grove',
  effect = 'Displays "Grove Keeper" title below your name'
WHERE id = 'title-grove-keeper';

UPDATE items SET
  description = 'Master of the orchards',
  effect = 'Displays "Orchard Master" title below your name'
WHERE id = 'title-orchard-master';

UPDATE items SET
  description = 'Ruler of citrus',
  effect = 'Displays "Citrus Lord" title below your name'
WHERE id = 'title-citrus-lord';

UPDATE items SET
  description = 'Emperor of all tangs',
  effect = 'Displays "Tang Emperor" title below your name'
WHERE id = 'title-tang-emperor';

UPDATE items SET
  description = 'Good vibes only',
  effect = 'Displays "Vibing" title below your name'
WHERE id = 'title-vibing';

UPDATE items SET
  description = 'We are All Gonna Make It',
  effect = 'Displays "WAGMI" title below your name'
WHERE id = 'title-wagmi';

UPDATE items SET
  description = 'Not Gonna Make It (or are you?)',
  effect = 'Displays "NGMI" title below your name'
WHERE id = 'title-ngmi';

UPDATE items SET
  description = 'Never selling',
  effect = 'Displays "Diamond Hands" title below your name'
WHERE id = 'title-diamond-hands';

UPDATE items SET
  description = 'Keeping it simple',
  effect = 'Displays "Smooth Brain" title below your name'
WHERE id = 'title-smooth-brain';

UPDATE items SET
  description = '5D chess player',
  effect = 'Displays "Galaxy Brain" title below your name'
WHERE id = 'title-galaxy-brain';

UPDATE items SET
  description = 'In awe at the size',
  effect = 'Displays "Absolute Unit" title below your name'
WHERE id = 'title-absolute-unit';

UPDATE items SET
  description = 'Go outside sometimes',
  effect = 'Displays "Touch Grass" title below your name'
WHERE id = 'title-touch-grass';

UPDATE items SET
  description = 'Ruler of the grove',
  effect = 'Displays "King of the Grove" title below your name'
WHERE id = 'title-king-grove';

-- =====================================================
-- UPDATE DESCRIPTIONS FOR FONT COLORS
-- =====================================================
UPDATE items SET
  description = 'Classic Tang Gang orange',
  effect = 'Changes your drawer title text to Tang Orange'
WHERE id = 'font-color-orange';

UPDATE items SET
  description = 'Clean and bright',
  effect = 'Changes your drawer title text to white'
WHERE id = 'font-color-white';

UPDATE items SET
  description = 'Bold and passionate',
  effect = 'Changes your drawer title text to red'
WHERE id = 'font-color-red';

UPDATE items SET
  description = 'Sunny and cheerful',
  effect = 'Changes your drawer title text to yellow'
WHERE id = 'font-color-yellow';

UPDATE items SET
  description = 'Fresh and natural',
  effect = 'Changes your drawer title text to green'
WHERE id = 'font-color-green';

UPDATE items SET
  description = 'Cool and calm',
  effect = 'Changes your drawer title text to blue'
WHERE id = 'font-color-blue';

UPDATE items SET
  description = 'Royal and mysterious',
  effect = 'Changes your drawer title text to purple'
WHERE id = 'font-color-purple';

UPDATE items SET
  description = 'Sweet and playful',
  effect = 'Changes your drawer title text to pink'
WHERE id = 'font-color-pink';

UPDATE items SET
  description = 'Electric and fresh',
  effect = 'Changes your drawer title text to cyan'
WHERE id = 'font-color-cyan';

UPDATE items SET
  description = 'Sleek and minimal',
  effect = 'Changes your drawer title text to black'
WHERE id = 'font-color-black';

UPDATE items SET
  description = 'Luxurious and rich',
  effect = 'Changes your drawer title text to gold'
WHERE id = 'font-color-gold';

UPDATE items SET
  description = 'Elegant and refined',
  effect = 'Changes your drawer title text to silver'
WHERE id = 'font-color-silver';

UPDATE items SET
  description = 'Warm metallic tones',
  effect = 'Changes your drawer title text to bronze'
WHERE id = 'font-color-bronze';

UPDATE items SET
  description = 'Warm sunset colors flowing',
  effect = 'Gradient from orange to pink flows through text'
WHERE id = 'font-color-gradient-sunset';

UPDATE items SET
  description = 'Cool ocean waves',
  effect = 'Gradient from blue to cyan flows through text'
WHERE id = 'font-color-gradient-ocean';

UPDATE items SET
  description = 'Nature-inspired gradient',
  effect = 'Gradient from green to yellow flows through text'
WHERE id = 'font-color-gradient-forest';

UPDATE items SET
  description = 'Hot flames gradient',
  effect = 'Animated fire colors flow through text'
WHERE id = 'font-color-gradient-fire';

UPDATE items SET
  description = 'Frozen crystals',
  effect = 'Animated ice colors flow through text'
WHERE id = 'font-color-gradient-ice';

UPDATE items SET
  description = 'Majestic purple and gold',
  effect = 'Royal gradient flows through text'
WHERE id = 'font-color-gradient-royal';

UPDATE items SET
  description = 'All the colors of the rainbow',
  effect = 'Animated rainbow spectrum cycles through text'
WHERE id = 'font-color-gradient-rainbow';

UPDATE items SET
  description = 'Tang signature gradient',
  effect = 'Orange-gold gradient flows through text'
WHERE id = 'font-color-gradient-tang';

-- =====================================================
-- UPDATE DESCRIPTIONS FOR COLLECTION LAYOUTS
-- =====================================================
UPDATE items SET
  description = 'Compact NFT arrangement',
  effect = 'Shows your NFTs in a tight grid formation'
WHERE id = 'layout-grid';

UPDATE items SET
  description = 'Vertical list view',
  effect = 'Shows your NFTs in a vertical list with details'
WHERE id = 'layout-list';

UPDATE items SET
  description = 'Featured display',
  effect = 'Highlights one NFT large with others small'
WHERE id = 'layout-showcase';

UPDATE items SET
  description = 'Sliding gallery',
  effect = 'Swipeable carousel of your NFTs'
WHERE id = 'layout-carousel';

UPDATE items SET
  description = 'Pinterest-style layout',
  effect = 'NFTs arranged in varied-height columns'
WHERE id = 'layout-masonry';

-- =====================================================
-- UPDATE DESCRIPTIONS FOR PAGE BACKGROUNDS
-- =====================================================
UPDATE items SET
  description = 'Pure darkness',
  effect = 'Sets drawer background to deep black'
WHERE id = 'bg-midnight-black';

UPDATE items SET
  description = 'Deep ocean blue',
  effect = 'Sets drawer background to navy blue'
WHERE id = 'bg-deep-navy';

UPDATE items SET
  description = 'Natural earthy tones',
  effect = 'Sets drawer background to forest green'
WHERE id = 'bg-forest-green';

UPDATE items SET
  description = 'Rich and elegant',
  effect = 'Sets drawer background to wine red'
WHERE id = 'bg-wine-red';

UPDATE items SET
  description = 'Majestic purple',
  effect = 'Sets drawer background to royal purple'
WHERE id = 'bg-royal-purple';

UPDATE items SET
  description = 'Subtle gray tones',
  effect = 'Sets drawer background to charcoal gray'
WHERE id = 'bg-charcoal';

UPDATE items SET
  description = 'Warm sunset colors',
  effect = 'Gradient from orange to purple fades across background'
WHERE id = 'bg-gradient-sunset';

UPDATE items SET
  description = 'Deep sea vibes',
  effect = 'Gradient from dark blue to teal fades across background'
WHERE id = 'bg-gradient-ocean';

UPDATE items SET
  description = 'Northern lights dancing',
  effect = 'Animated aurora borealis effect on background'
WHERE id = 'bg-gradient-aurora';

UPDATE items SET
  description = 'Warm glowing embers',
  effect = 'Animated ember glow effect on background'
WHERE id = 'bg-gradient-ember';

UPDATE items SET
  description = 'Warm sunset hour',
  effect = 'Golden gradient flows across background'
WHERE id = 'bg-gradient-golden';

UPDATE items SET
  description = 'Subtle grid pattern',
  effect = 'Grid lines appear on your drawer background'
WHERE id = 'bg-pattern-grid';

UPDATE items SET
  description = 'Playful polka dots',
  effect = 'Dots pattern appears on your drawer background'
WHERE id = 'bg-pattern-dots';

UPDATE items SET
  description = 'Angled stripes',
  effect = 'Diagonal stripe pattern on background'
WHERE id = 'bg-pattern-diagonal';

UPDATE items SET
  description = 'Geometric hexagons',
  effect = 'Hexagonal pattern on background'
WHERE id = 'bg-pattern-hexagons';

UPDATE items SET
  description = 'Tech-inspired design',
  effect = 'Circuit board pattern on background'
WHERE id = 'bg-pattern-circuit';

UPDATE items SET
  description = 'Night sky pattern',
  effect = 'Star pattern on background'
WHERE id = 'bg-pattern-stars';

UPDATE items SET
  description = 'Floating citrus',
  effect = 'Animated oranges float across background'
WHERE id = 'bg-anim-floating-oranges';

UPDATE items SET
  description = 'Particles in motion',
  effect = 'Animated particles float across background'
WHERE id = 'bg-anim-particles';

UPDATE items SET
  description = 'Enter the Matrix',
  effect = 'Animated digital rain falls on background'
WHERE id = 'bg-anim-matrix';

UPDATE items SET
  description = 'Moving through space',
  effect = 'Animated stars move past on background'
WHERE id = 'bg-anim-starfield';

UPDATE items SET
  description = 'Northern lights waves',
  effect = 'Animated aurora waves on background'
WHERE id = 'bg-anim-aurora';

UPDATE items SET
  description = 'The legendary grove',
  effect = 'Animated grove scene on background'
WHERE id = 'bg-anim-grove';

UPDATE items SET
  description = 'Enter the void',
  effect = 'Animated void portal effect'
WHERE id = 'bg-legendary-void';

UPDATE items SET
  description = 'Stellar explosion',
  effect = 'Animated supernova effect'
WHERE id = 'bg-legendary-supernova';

UPDATE items SET
  description = 'Holographic shimmer',
  effect = 'Animated holographic background'
WHERE id = 'bg-legendary-holographic';

-- =====================================================
-- UPDATE DESCRIPTIONS FOR CONSUMABLES
-- =====================================================
UPDATE items SET
  description = '10 donuts to flick at your favorite NFTs',
  effect = 'Throw donuts at NFTs to show appreciation'
WHERE id = 'consumable-donuts-10';

UPDATE items SET
  description = '10 poop emojis to throw at NFTs you dislike',
  effect = 'Throw poop at NFTs to show disapproval'
WHERE id = 'consumable-poop-10';

-- =====================================================
-- UPDATE DESCRIPTIONS FOR BIGPULP ITEMS
-- =====================================================
UPDATE items SET
  description = 'Celebrate in style',
  effect = 'BigPulp wears a festive party hat'
WHERE id = 'bigpulp-hat-party';

UPDATE items SET
  description = 'Yeehaw partner',
  effect = 'BigPulp wears a cowboy hat'
WHERE id = 'bigpulp-hat-cowboy';

UPDATE items SET
  description = 'Ready to cook',
  effect = 'BigPulp wears a chef hat'
WHERE id = 'bigpulp-hat-chef';

UPDATE items SET
  description = 'Raid incoming',
  effect = 'BigPulp wears a viking helmet'
WHERE id = 'bigpulp-hat-viking';

UPDATE items SET
  description = 'Arr matey',
  effect = 'BigPulp wears a pirate hat'
WHERE id = 'bigpulp-hat-pirate';

UPDATE items SET
  description = 'French artist vibes',
  effect = 'BigPulp wears an artistic beret'
WHERE id = 'bigpulp-hat-beret';

UPDATE items SET
  description = 'Fancy and refined',
  effect = 'BigPulp wears a sophisticated top hat'
WHERE id = 'bigpulp-hat-tophat';

UPDATE items SET
  description = 'Magic awaits',
  effect = 'BigPulp wears a mystical wizard hat'
WHERE id = 'bigpulp-hat-wizard';

UPDATE items SET
  description = 'Feeling devilish',
  effect = 'BigPulp wears devil horns'
WHERE id = 'bigpulp-hat-devil';

UPDATE items SET
  description = 'Royalty status',
  effect = 'BigPulp wears a golden crown'
WHERE id = 'bigpulp-hat-crown';

UPDATE items SET
  description = 'Pure and angelic',
  effect = 'BigPulp wears a glowing halo'
WHERE id = 'bigpulp-hat-halo';

UPDATE items SET
  description = 'Default happy mood',
  effect = 'BigPulp shows a happy expression'
WHERE id = 'bigpulp-mood-happy';

UPDATE items SET
  description = 'Cool and relaxed',
  effect = 'BigPulp shows a chill expression'
WHERE id = 'bigpulp-mood-chill';

UPDATE items SET
  description = 'Zzz...',
  effect = 'BigPulp shows a sleepy expression'
WHERE id = 'bigpulp-mood-sleepy';

UPDATE items SET
  description = 'Maximum excitement',
  effect = 'BigPulp shows an excited expression'
WHERE id = 'bigpulp-mood-hype';

UPDATE items SET
  description = 'Not impressed',
  effect = 'BigPulp shows a grumpy expression'
WHERE id = 'bigpulp-mood-grumpy';

UPDATE items SET
  description = 'Attention!',
  effect = 'BigPulp shows a saluting expression'
WHERE id = 'bigpulp-mood-sergeant';

UPDATE items SET
  description = 'Emotionless',
  effect = 'BigPulp shows a blank expression'
WHERE id = 'bigpulp-mood-numb';

UPDATE items SET
  description = 'Just got liquidated',
  effect = 'BigPulp shows a defeated expression'
WHERE id = 'bigpulp-mood-rekt';

UPDATE items SET
  description = 'Looking dapper',
  effect = 'BigPulp wears a cute bowtie'
WHERE id = 'bigpulp-acc-bowtie';

UPDATE items SET
  description = 'Cool and casual',
  effect = 'BigPulp wears a bandana'
WHERE id = 'bigpulp-acc-bandana';

UPDATE items SET
  description = 'A touch of bling',
  effect = 'BigPulp wears a sparkling earring'
WHERE id = 'bigpulp-acc-earring';

UPDATE items SET
  description = 'Always listening',
  effect = 'BigPulp wears headphones'
WHERE id = 'bigpulp-acc-headphones';

UPDATE items SET
  description = 'Distinguished look',
  effect = 'BigPulp smokes a cigar'
WHERE id = 'bigpulp-acc-cigar';

UPDATE items SET
  description = 'Quite refined',
  effect = 'BigPulp wears a fancy monocle'
WHERE id = 'bigpulp-acc-monocle';

UPDATE items SET
  description = 'Battle-hardened',
  effect = 'BigPulp has a cool scar'
WHERE id = 'bigpulp-acc-scar';

-- =====================================================
-- UPDATE DESCRIPTIONS FOR BACKGROUNDS (shop)
-- =====================================================
UPDATE items SET
  description = 'Dark and mysterious',
  effect = 'Sets profile background to midnight blue'
WHERE id = 'bg-midnight';

UPDATE items SET
  description = 'Warm evening colors',
  effect = 'Sets profile background to sunset gradient'
WHERE id = 'bg-sunset';

UPDATE items SET
  description = 'Sweet golden tones',
  effect = 'Sets profile background to honey gold'
WHERE id = 'bg-honey';

UPDATE items SET
  description = 'Nature-inspired',
  effect = 'Sets profile background to forest green'
WHERE id = 'bg-forest';

UPDATE items SET
  description = 'Warm and glowing',
  effect = 'Sets profile background to ember red'
WHERE id = 'bg-ember';

UPDATE items SET
  description = 'Morning citrus vibes',
  effect = 'Animated orange sunrise gradient'
WHERE id = 'bg-orange-sunrise';

UPDATE items SET
  description = 'Evening grove atmosphere',
  effect = 'Twilight purple-orange gradient'
WHERE id = 'bg-twilight-grove';

UPDATE items SET
  description = 'Deep sea vibes',
  effect = 'Dark blue oceanic gradient'
WHERE id = 'bg-deep-ocean';

UPDATE items SET
  description = 'Sweet and playful',
  effect = 'Pink and blue cotton candy gradient'
WHERE id = 'bg-cotton-candy';

UPDATE items SET
  description = 'It is raining citrus',
  effect = 'Animated falling citrus drops'
WHERE id = 'bg-citrus-rain';

UPDATE items SET
  description = 'Oranges everywhere',
  effect = 'Animated floating oranges'
WHERE id = 'bg-floating-oranges';

UPDATE items SET
  description = 'Welcome to the grove',
  effect = 'Animated orange grove scene'
WHERE id = 'bg-orange-grove';

UPDATE items SET
  description = 'Journey through space',
  effect = 'Animated moving starfield'
WHERE id = 'bg-starfield';

UPDATE items SET
  description = 'Digital Tang universe',
  effect = 'Animated matrix-style falling Tang symbols'
WHERE id = 'bg-matrix-tang';

-- =====================================================
-- UPDATE DESCRIPTIONS FOR CELEBRATIONS
-- =====================================================
UPDATE items SET
  description = 'Classic party vibes',
  effect = 'Confetti bursts when you win'
WHERE id = 'celebration-confetti';

UPDATE items SET
  description = 'Citrus from the sky',
  effect = 'Oranges rain down when you win'
WHERE id = 'celebration-orange-rain';

UPDATE items SET
  description = 'Explosive citrus energy',
  effect = 'Citrus bursts outward when you win'
WHERE id = 'celebration-citrus-explosion';

UPDATE items SET
  description = 'Light up the sky',
  effect = 'Fireworks explode when you win'
WHERE id = 'celebration-fireworks';

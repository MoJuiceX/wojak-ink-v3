/**
 * Generate Memory Match Filter JSON
 * 
 * This script pre-computes NFT IDs for each filter used in the Memory Match game.
 * This allows instant level loading instead of filtering 4200 NFTs at runtime.
 * 
 * Usage: node scripts/generate-memory-match-filters.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const METADATA_PATH = path.join(__dirname, '../public/assets/nft-data/metadata.json');
const OUTPUT_PATH = path.join(__dirname, '../public/assets/nft-data/memory-match-filters.json');

// Filter definitions
const BASE_FILTERS = [
  'Wojak',
  'Soyjak', 
  'Papa Tang',
  'Monkey Zoo',
  'Waifu',
  'Baddie',
  'Bepe Wojak',
  'Bepe Soyjak',
  'Bepe Waifu',
  'Bepe Baddie',
  'Alien Wojak',
  'Alien Soyjak',
  'Alien Waifu',
  'Alien Baddie',
];

const SUIT_FILTERS = [
  'Proof of Prayer',
  'Gopher Suit',
  'Pepe Suit',
  'Goose Suit',
  'Bepe Suit',
  'Pickle Suit',
  'Astronaut',
  'Sonic Suit',
];

const COMBO_FILTERS = [
  { name: 'Clown + Clown Nose', traits: { Head: 'Clown', 'Face Wear': 'Clown Nose' } },
  { name: 'Wizard Hat + Wizard Drip', traits: { Head: 'Wizard Hat', Clothes: 'Wizard Drip' } },
  { name: 'Super Saiyan + Super Saiyan Uniform', traits: { Head: 'Super Saiyan', Clothes: 'Super Saiyan Uniform' } },
  { name: 'Roman Drip + Centurion', traits: { Clothes: 'Roman Drip', Head: 'Centurion' } },
  { name: 'Ronin Helmet + Ronin', traits: { Head: 'Ronin Helmet', Clothes: 'Ronin' } },
  { name: 'Bepe Army + Field Cap/Hard Hat', traits: { Clothes: 'Bepe Army', Head: ['Field Cap', 'Hard Hat'] } },
  { name: 'Viking Armor + Viking Helmet', traits: { Clothes: 'Viking Armor', Head: 'Viking Helmet' } },
  { name: 'Firefighter Helmet + Firefighter Uniform', traits: { Head: 'Firefighter Helmet', Clothes: 'Firefighter Uniform' } },
];

// Level order (levels 10-39)
const LEVEL_ORDER = [
  // Levels 10-23: Base filters
  'Wojak',
  'Soyjak',
  'Papa Tang',
  'Monkey Zoo',
  'Waifu',
  'Baddie',
  'Bepe Wojak',
  'Bepe Soyjak',
  'Bepe Waifu',
  'Bepe Baddie',
  'Alien Wojak',
  'Alien Soyjak',
  'Alien Waifu',
  'Alien Baddie',
  // Levels 24-39: Combo and suit filters (ordered by count, most to least)
  'Clown + Clown Nose',
  'Wizard Hat + Wizard Drip',
  'Proof of Prayer',
  'Gopher Suit',
  'Super Saiyan + Super Saiyan Uniform',
  'Roman Drip + Centurion',
  'Pepe Suit',
  'Goose Suit',
  'Ronin Helmet + Ronin',
  'Bepe Suit',
  'Pickle Suit',
  'Bepe Army + Field Cap/Hard Hat',
  'Viking Armor + Viking Helmet',
  'Astronaut',
  'Sonic Suit',
  'Firefighter Helmet + Firefighter Uniform',
];

// Helper functions
function hasTraitValue(nft, traitType, value) {
  if (!nft.attributes) return false;
  const attr = nft.attributes.find(a => a.trait_type === traitType);
  if (!attr) return false;
  
  if (Array.isArray(value)) {
    return value.includes(attr.value);
  }
  return attr.value === value;
}

function matchesComboFilter(nft, traits) {
  return Object.entries(traits).every(([traitType, value]) => 
    hasTraitValue(nft, traitType, value)
  );
}

function main() {
  console.log('Loading metadata...');
  const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
  console.log(`Loaded ${metadata.length} NFTs`);

  const filters = {};

  // Process base filters
  console.log('\nProcessing base filters...');
  for (const baseName of BASE_FILTERS) {
    const nftIds = metadata
      .filter(nft => hasTraitValue(nft, 'Base', baseName))
      .map(nft => nft.edition);
    
    filters[baseName] = {
      type: 'base',
      count: nftIds.length,
      nftIds,
    };
    
    console.log(`  ${baseName}: ${nftIds.length} NFTs`);
    
    if (nftIds.length < 16) {
      console.warn(`  ⚠️  WARNING: ${baseName} has fewer than 16 NFTs!`);
    }
  }

  // Process suit filters (single clothes attribute)
  console.log('\nProcessing suit filters...');
  for (const suitName of SUIT_FILTERS) {
    const nftIds = metadata
      .filter(nft => hasTraitValue(nft, 'Clothes', suitName))
      .map(nft => nft.edition);
    
    filters[suitName] = {
      type: 'suit',
      trait: { Clothes: suitName },
      count: nftIds.length,
      nftIds,
    };
    
    console.log(`  ${suitName}: ${nftIds.length} NFTs`);
    
    if (nftIds.length < 16) {
      console.warn(`  ⚠️  WARNING: ${suitName} has fewer than 16 NFTs!`);
    }
  }

  // Process combo filters
  console.log('\nProcessing combo filters...');
  for (const combo of COMBO_FILTERS) {
    const nftIds = metadata
      .filter(nft => matchesComboFilter(nft, combo.traits))
      .map(nft => nft.edition);
    
    filters[combo.name] = {
      type: 'combo',
      traits: combo.traits,
      count: nftIds.length,
      nftIds,
    };
    
    console.log(`  ${combo.name}: ${nftIds.length} NFTs`);
    
    if (nftIds.length < 16) {
      console.warn(`  ⚠️  WARNING: ${combo.name} has fewer than 16 NFTs!`);
    }
  }

  // Build output
  const output = {
    generatedAt: new Date().toISOString(),
    totalFilters: Object.keys(filters).length,
    filters,
    levelOrder: LEVEL_ORDER,
  };

  // Validate level order
  console.log('\nValidating level order...');
  for (const filterName of LEVEL_ORDER) {
    if (!filters[filterName]) {
      console.error(`  ❌ ERROR: Level order references unknown filter: ${filterName}`);
      process.exit(1);
    }
  }
  console.log(`  ✓ All ${LEVEL_ORDER.length} filters in level order are valid`);

  // Write output
  console.log(`\nWriting output to ${OUTPUT_PATH}...`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  
  console.log('\n✅ Done! Generated memory-match-filters.json');
  console.log(`   Total filters: ${output.totalFilters}`);
  console.log(`   Level order: ${LEVEL_ORDER.length} filters (levels 10-39)`);
}

main();

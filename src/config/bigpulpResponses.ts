/**
 * BigPulp Response System
 *
 * Contextual responses based on NFT analysis.
 */

import type {
  NFTAnalysis,
  BigPulpResponse,
  BigPulpMood,
} from '@/types/bigpulp';

// ============ Response Categories ============

export const BIGPULP_RESPONSES = {
  // Welcome messages (no NFT selected)
  welcome: [
    "Yo! I'm BigPulp. Drop an NFT ID and let's see what you got!",
    "Ready to analyze some Wojaks? Hit me with an ID!",
    "BigPulp Intelligence at your service. What are we looking at today?",
  ],

  // Searching
  searching: [
    'Hmm, let me dig into the data...',
    'Crunching numbers for you...',
    'One sec, consulting the blockchain...',
  ],

  // Rarity reactions
  legendary: [
    'WHOA! This is a TOP 1% Wojak! Absolute grail!',
    "Now THIS is what I'm talking about! Legendary status!",
    "My sensors are off the charts! This one's special!",
  ],
  epic: [
    'Very nice! This is in the top 5%. Solid piece!',
    'Ooh, we got a rare one here! Good eye!',
    "This Wojak's got some serious credentials!",
  ],
  rare: [
    'Not bad at all! Top 15% rarity. Respectable!',
    "This one's got some juice. Decent rarity!",
    'Solid pick! Better than most of the collection.',
  ],
  uncommon: [
    'A decent Wojak! Top half of the collection.',
    'Nothing special, but hey, still got character!',
    'Middle of the pack. Room to grow!',
  ],
  common: [
    'A common Wojak, but still part of the fam!',
    'Not the rarest, but every Wojak has value!',
    'Classic Wojak vibes. Sometimes simple is good!',
  ],

  // Special traits
  hasCrown: [
    'A CROWN HOLDER! Top 100 in the entire collection!',
    'Royalty detected! This one wears the crown!',
  ],
  hasRareCombo: [
    "Wait... this has the '{combo}' combo! Only {count} exist!",
    "Rare combo alert! '{combo}' is seriously valuable!",
  ],
  hasSpecialEdition: [
    'This is a SPECIAL EDITION! Part of Tang Gang history!',
    'Community tribute piece! This one tells a story!',
  ],

  // Market commentary
  overpriced: [
    'Hmm... that listing price seems a bit spicy for the rarity.',
    "I'd wait for a better deal. Price vs rarity is off.",
  ],
  goodDeal: [
    'This is listed BELOW similar rarities. Could be a snipe!',
    'The price-to-rarity ratio is looking juicy here!',
  ],
  notListed: [
    "This one's not for sale right now. Holder's diamond-handing it!",
    "Off the market. Someone's holding tight!",
  ],

  // Trait commentary
  traitMirror: [
    'Nice {trait}! *adjusts my own {trait}* Great minds, am I right?',
    'Oh snap, {trait}! Let me put mine on too!',
  ],

  // Follow-up messages (after initial)
  followUp: [
    'Want me to check market data? Head to the Market tab!',
    "Check out the Attributes tab to see what's selling!",
    'Curious about similar NFTs? I got the data!',
  ],

  // Error states
  notFound: [
    "Hmm, can't find that NFT. Double-check the ID?",
    "That ID doesn't exist in Wojak Farmers Plot. Try another!",
  ],
  error: [
    'Oops, something went wrong. Let me try again...',
    'Blockchain acting up. Give it another shot!',
  ],
} as const;

// ============ Helper Functions ============

/**
 * Get random item from array
 */
function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Map trait value to BigPulp head variant
 */
function traitToHeadVariant(traitValue: string): string {
  const mapping: Record<string, string> = {
    'Laser Eyes': 'laser-eyes',
    'Tang Cap': 'tang-cap',
    Sunglasses: 'sunglasses',
    'Crown': 'crown',
    'Rainbow': 'rainbow',
  };
  return mapping[traitValue] || 'default';
}

// ============ Response Generator ============

/**
 * Generate BigPulp response based on NFT analysis
 */
export function generateBigPulpResponse(
  analysis: NFTAnalysis | null
): BigPulpResponse {
  if (!analysis) {
    return {
      message: randomFrom(BIGPULP_RESPONSES.welcome),
      mood: 'chill',
    };
  }

  const messages: string[] = [];
  let mood: BigPulpMood = 'neutral';
  let headVariant = 'default';

  // Rarity-based primary response
  switch (analysis.rarity.tier) {
    case 'legendary':
      messages.push(randomFrom(BIGPULP_RESPONSES.legendary));
      mood = 'impressed';
      break;
    case 'epic':
      messages.push(randomFrom(BIGPULP_RESPONSES.epic));
      mood = 'excited';
      break;
    case 'rare':
      messages.push(randomFrom(BIGPULP_RESPONSES.rare));
      mood = 'excited';
      break;
    case 'uncommon':
      messages.push(randomFrom(BIGPULP_RESPONSES.uncommon));
      mood = 'neutral';
      break;
    case 'common':
    default:
      messages.push(randomFrom(BIGPULP_RESPONSES.common));
      mood = 'chill';
      break;
  }

  // Badge-based additions
  if (analysis.badges.some((b) => b.type === 'crown-holder')) {
    messages.push(randomFrom(BIGPULP_RESPONSES.hasCrown));
    mood = 'impressed';
  }

  // Special edition
  if (analysis.badges.some((b) => b.type === 'special-edition')) {
    messages.push(randomFrom(BIGPULP_RESPONSES.hasSpecialEdition));
  }

  // Rare combo
  const combosBadge = analysis.badges.find((b) => b.type === 'rare-combo');
  if (combosBadge && analysis.rareCombos.length > 0) {
    const combo = analysis.rareCombos[0];
    messages.push(
      randomFrom(BIGPULP_RESPONSES.hasRareCombo)
        .replace('{combo}', combo.comboName || combo.traits.join(' + '))
        .replace('{count}', String(combo.occurrences))
    );
  }

  // Market commentary
  if (analysis.market.isListed) {
    if (analysis.market.priceVsFloor && analysis.market.priceVsFloor < -20) {
      messages.push(randomFrom(BIGPULP_RESPONSES.goodDeal));
      mood = 'excited';
    } else if (
      analysis.market.priceVsFloor &&
      analysis.market.priceVsFloor > 50
    ) {
      messages.push(randomFrom(BIGPULP_RESPONSES.overpriced));
      mood = 'suspicious';
    }
  } else {
    // Not listed - maybe add comment
    if (Math.random() > 0.5) {
      messages.push(randomFrom(BIGPULP_RESPONSES.notListed));
    }
  }

  // Trait mirroring (head variant)
  const mirrorableTraits = [
    'Laser Eyes',
    'Tang Cap',
    'Sunglasses',
    'Crown',
    'Rainbow',
  ];
  const matchedTrait = analysis.nft.traits?.find((t) =>
    mirrorableTraits.includes(t.value)
  );
  if (matchedTrait) {
    headVariant = traitToHeadVariant(matchedTrait.value);
    // Occasionally comment on it
    if (Math.random() > 0.7) {
      messages.push(
        randomFrom(BIGPULP_RESPONSES.traitMirror).replace(
          /\{trait\}/g,
          matchedTrait.value
        )
      );
    }
  }

  // Add a random follow-up
  if (messages.length < 3 && Math.random() > 0.6) {
    messages.push(randomFrom(BIGPULP_RESPONSES.followUp));
  }

  return {
    message: messages[0],
    mood,
    headVariant,
    followUp: messages.slice(1),
  };
}

/**
 * Get searching message
 */
export function getSearchingMessage(): string {
  return randomFrom(BIGPULP_RESPONSES.searching);
}

/**
 * Get error message
 */
export function getErrorMessage(type: 'notFound' | 'error'): string {
  return randomFrom(BIGPULP_RESPONSES[type]);
}

/**
 * Get welcome message
 */
export function getWelcomeMessage(): string {
  return randomFrom(BIGPULP_RESPONSES.welcome);
}

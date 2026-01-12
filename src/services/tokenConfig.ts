/**
 * Token Configuration
 * Known CAT tokens in the treasury wallet
 * Based on Spacescan.io data for wallet: xch13afmxv0xpyz03t3jfdmcrtv5ecwe5n52977vxd3z2x995f9quunsre5vkd
 */

export interface TokenConfig {
  asset_id: string;
  name: string;
  symbol: string;
  balance: number;
  value_usd: number;
  logo_url?: string;
  color?: string;
}

// Treasury token holdings - sorted by USD value (highest first)
export const TREASURY_TOKENS: TokenConfig[] = [
  {
    asset_id: 'wojak-lp',
    name: 'Wojak LP',
    symbol: 'Wojak',
    balance: 10.5,
    value_usd: 52.50, // 10.5 XCH × $5/XCH
    logo_url: '/assets/icons/Wojak_logo.png',
    color: '#5BC0DE', // Light blue
  },
  {
    asset_id: '487924868a90bb2b149dd61d9d3aefa613f046bfe6d5b0c1b282eb6066a4851a',
    name: 'Spell Power',
    symbol: 'SPELL',
    balance: 151230,
    value_usd: 131.09,
    logo_url: 'https://em-content.zobj.net/thumbs/120/apple/354/magic-wand_1fa84.png',
    color: '#FFD700', // Yellow
  },
  {
    asset_id: 'e816ee18ce2337c4128449bc539fbbe2ecfdd2098c4e7cab4667e223c3bdc23d',
    name: 'HOA COIN',
    symbol: 'HOA',
    balance: 67557,
    value_usd: 104.53,
    logo_url: 'https://icons.dexie.space/e816ee18ce2337c4128449bc539fbbe2ecfdd2098c4e7cab4667e223c3bdc23d.webp',
    color: '#F19B38',
  },
  {
    asset_id: '69326954fe16117cd6250e929748b2a1ab916347598bc8180749279cfae21ddb',
    name: 'VersaceFerrariVegasApartmentPatek9000Inu',
    symbol: '$CHIA',
    balance: 4140,
    value_usd: 83.97,
    logo_url: 'https://icons.dexie.space/69326954fe16117cd6250e929748b2a1ab916347598bc8180749279cfae21ddb.webp',
    color: '#E8026A',
  },
  {
    asset_id: '1ad673d21799c9a224014ca71f9fe07cbc836fa23fa97b3be275d46d0b8bd9da',
    name: 'NeckCoin',
    symbol: 'NECK',
    balance: 6,
    value_usd: 82.64,
    logo_url: 'https://icons.dexie.space/1ad673d21799c9a224014ca71f9fe07cbc836fa23fa97b3be275d46d0b8bd9da.webp',
    color: '#9B59B6', // Purplish
  },
  {
    asset_id: 'ccda69ff6c44d687994efdbee30689be51d2347f739287ab4bb7b52344f8bf1d',
    name: 'BEPE',
    symbol: 'BEPE',
    balance: 769133,
    value_usd: 82.50,
    logo_url: 'https://icons.dexie.space/ccda69ff6c44d687994efdbee30689be51d2347f739287ab4bb7b52344f8bf1d.webp',
    color: '#96FC5D', // Lime green
  },
  {
    asset_id: '84d31c80c619070ba45ce4dc5cc0bed2ae4341a0da1d69504e28243e6ccbef37',
    name: 'PP',
    symbol: 'PP',
    balance: 6380,
    value_usd: 76.35,
    logo_url: 'https://icons.dexie.space/84d31c80c619070ba45ce4dc5cc0bed2ae4341a0da1d69504e28243e6ccbef37.webp',
    color: '#FFB366', // Light orange
  },
  {
    asset_id: 'a09af8b0d12b27772c64f89cf0d1db95186dca5b1871babc5108ff44f36305e6',
    name: 'Caster',
    symbol: 'CASTER',
    balance: 0.899,
    value_usd: 12.99,
    logo_url: 'https://icons.dexie.space/a09af8b0d12b27772c64f89cf0d1db95186dca5b1871babc5108ff44f36305e6.webp',
    color: '#1B9B8F', // Teal/green-blue
  },
  {
    asset_id: '3b19b64418682ad60c6278d85f8076a108c9fb4ca385d401c6d41ba2bfa9612e',
    name: 'JOCK',
    symbol: 'JOCK',
    balance: 10000,
    value_usd: 0.87,
    logo_url: 'https://icons.dexie.space/3b19b64418682ad60c6278d85f8076a108c9fb4ca385d401c6d41ba2bfa9612e.webp',
  },
  {
    asset_id: 'dd37f678dda586fad9b1daeae1f7c5c137ffa6d947e1ed5c7b4f3c430da80638',
    name: 'PIZZA',
    symbol: 'PIZZA',
    balance: 50000,
    value_usd: 0.69,
    logo_url: 'https://icons.dexie.space/dd37f678dda586fad9b1daeae1f7c5c137ffa6d947e1ed5c7b4f3c430da80638.webp',
  },
  {
    asset_id: '70010d83542594dd44314efbae75d82b3d9ae7d946921ed981a6cd08f0549e50',
    name: 'LOVE',
    symbol: 'LOVE',
    balance: 1111,
    value_usd: 0.67,
    logo_url: 'https://icons.dexie.space/70010d83542594dd44314efbae75d82b3d9ae7d946921ed981a6cd08f0549e50.webp',
  },
  {
    asset_id: '0941dc178e75d3699fab42a002034cae455ba5dfc91a9a9f58b62c48c9cea754',
    name: 'Chad',
    symbol: 'CHAD',
    balance: 3,
    value_usd: 0.50,
    logo_url: 'https://icons.dexie.space/0941dc178e75d3699fab42a002034cae455ba5dfc91a9a9f58b62c48c9cea754.webp',
  },
  {
    asset_id: 'ab558b1b841365a24d1ff2264c55982e55664a8b6e45bc107446b7e667bb463b',
    name: 'SPROUT',
    symbol: 'SPROUT',
    balance: 10000,
    value_usd: 0.46,
    logo_url: 'https://icons.dexie.space/ab558b1b841365a24d1ff2264c55982e55664a8b6e45bc107446b7e667bb463b.webp',
  },
  {
    asset_id: '37b231bbdc0002a4fbbb65de0007a9cf1645a292888711968a8abb9a3e40596e',
    name: 'go4me',
    symbol: 'G4M',
    balance: 33333,
    value_usd: 0.29,
    logo_url: 'https://icons.dexie.space/37b231bbdc0002a4fbbb65de0007a9cf1645a292888711968a8abb9a3e40596e.webp',
  },
  {
    asset_id: '370b11ffa9ed2934fbc4137be95053d4a97b7b65e850af3edc0b58f088a0059c',
    name: 'Cookies',
    symbol: 'COOKIES',
    balance: 200,
    value_usd: 0.07,
    logo_url: 'https://icons.dexie.space/370b11ffa9ed2934fbc4137be95053d4a97b7b65e850af3edc0b58f088a0059c.webp',
  },
  {
    asset_id: 'f10d9543b437',
    name: 'Unknown CAT',
    symbol: 'UNKNOWN',
    balance: 450452,
    value_usd: 0.00,
  },
];

// Total token value in USD (from Spacescan + Wojak LP)
export const TOTAL_TOKEN_VALUE_USD = 630.14;

/**
 * Treasury Constants
 * Wallet address - everything else is discovered dynamically from APIs
 */

export const WALLET_ADDRESS = 'xch13afmxv0xpyz03t3jfdmcrtv5ecwe5n52977vxd3z2x995f9quunsre5vkd';

// Shortened wallet for display
export const WALLET_DISPLAY = WALLET_ADDRESS.slice(0, 10) + '...' + WALLET_ADDRESS.slice(-6);

/**
 * XCH decimals: 1 XCH = 1,000,000,000,000 mojos (1e12)
 * CAT decimals: 1 token = 1000 mojos (1e3)
 */
export const XCH_DECIMALS = 12;
export const CAT_DECIMALS = 3;

/**
 * API Endpoints
 */
export const SPACESCAN_API_BASE = 'https://api2.spacescan.io';

/**
 * External links
 */
export const SPACESCAN_WALLET_URL = `https://www.spacescan.io/address/${WALLET_ADDRESS}`;

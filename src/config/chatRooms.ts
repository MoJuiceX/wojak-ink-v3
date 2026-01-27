/**
 * Chat Room Configuration
 * 
 * Defines the different chat rooms available in the app.
 * Used by both frontend and API endpoints for consistency.
 */

export type ChatType = 'whale' | 'holder';

export interface ChatRoomConfig {
  id: ChatType;
  path: string;
  roomName: string;
  minNfts: number;
  label: string;
  description: string;
  icon: string;
}

export const CHAT_ROOMS: Record<ChatType, ChatRoomConfig> = {
  whale: {
    id: 'whale',
    path: '/chat/whale',
    roomName: 'wojak-whale',
    minNfts: 42,
    label: 'Whale Chat',
    description: 'Exclusive chat for top 1% holders (42+ NFTs)',
    icon: '🐋',
  },
  holder: {
    id: 'holder',
    path: '/chat/holder',
    roomName: 'wojak-holder',
    minNfts: 1,
    label: 'Holder Chat',
    description: 'Chat for all Wojak NFT holders (1+ NFT)',
    icon: '💬',
  },
} as const;

/**
 * Get room config by chat type
 */
export function getRoomConfig(chatType: ChatType): ChatRoomConfig {
  return CHAT_ROOMS[chatType];
}

/**
 * Get room config by room name (Socket.io room)
 */
export function getRoomConfigByName(roomName: string): ChatRoomConfig | undefined {
  return Object.values(CHAT_ROOMS).find(room => room.roomName === roomName);
}

/**
 * Check if a user with given NFT count is eligible for a room
 */
export function isEligibleForRoom(nftCount: number, chatType: ChatType, isAdmin: boolean = false): boolean {
  if (isAdmin) return true;
  return nftCount >= CHAT_ROOMS[chatType].minNfts;
}

/**
 * Get all rooms a user is eligible for
 */
export function getEligibleRooms(nftCount: number, isAdmin: boolean = false): ChatRoomConfig[] {
  return Object.values(CHAT_ROOMS).filter(room => 
    isAdmin || nftCount >= room.minNfts
  );
}

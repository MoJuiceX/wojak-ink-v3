/**
 * Chat Types - Type definitions for the 1% holder gated chat system
 */

// ============ Eligibility Types ============

export interface ChatEligibilityRequest {
  walletAddress: string;
}

export interface ChatEligibilityResponse {
  eligible: boolean;
  nftCount: number;
  neededMore: number;
  message?: string;
}

export interface ChatTokenRequest {
  walletAddress: string;
}

export interface ChatTokenResponse {
  token: string;
  expiresAt: number;
  userId: string;
  nftCount: number;
  isAdmin?: boolean;
}

// ============ Message Types ============

export interface MessageReply {
  id: string;
  text: string;           // Truncated preview
  senderName: string;
}

export interface MessageReaction {
  emoji: string;
  users: { id: string; name: string }[];
}

export interface ChatMessage {
  id: string;
  text: string;           // Message content
  senderId: string;       // Clerk user ID
  senderName: string;     // Display name
  senderAvatar?: string;  // Avatar URL
  nftCount: number;       // Sender's NFT count (for badge display)
  timestamp: number;      // Unix timestamp
  isPinned?: boolean;     // Admin-pinned message
  isDeleted?: boolean;    // Soft-deleted by admin
  replyTo?: MessageReply | null;  // Reply to another message
  reactions?: MessageReaction[];   // Emoji reactions
}

export interface PinnedMessage extends ChatMessage {
  pinnedAt: number;       // When it was pinned
  pinnedBy: string;       // Admin who pinned it
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  nftCount: number;
  isAdmin: boolean;
  isMuted: boolean;
  mutedUntil?: number;    // Unix timestamp
  joinedAt: number;
}

// ============ Socket.io Event Types ============

export interface ServerToClientEvents {
  // Connection events
  'chat:connected': (data: { userId: string; isAdmin: boolean; roomName?: string }) => void;
  'chat:error': (data: { message: string; code?: string }) => void;

  // Message events
  'chat:message': (message: ChatMessage) => void;
  'chat:message:deleted': (data: { messageId: string }) => void;
  'chat:message:pinned': (data: { messageId: string; pinnedBy: string }) => void;
  'chat:message:unpinned': (data: { messageId: string }) => void;

  // Reaction events
  'chat:reaction:added': (data: { messageId: string; emoji: string; userId: string; userName: string }) => void;
  'chat:reaction:removed': (data: { messageId: string; emoji: string; userId: string }) => void;

  // User events
  'chat:user:joined': (user: ChatUser) => void;
  'chat:user:left': (data: { userId: string }) => void;
  'chat:user:updated': (user: ChatUser) => void;
  'chat:user:muted': (data: { userId: string; mutedUntil: number }) => void;
  'chat:user:unmuted': (data: { userId: string }) => void;

  // Room state
  'chat:users:list': (users: ChatUser[]) => void;
  'chat:messages:history': (messages: ChatMessage[]) => void;
  'chat:pinned:list': (messages: PinnedMessage[]) => void;

  // Typing indicator
  'chat:typing': (data: { userId: string; name: string }) => void;
  'chat:stopped-typing': (data: { userId: string }) => void;
}

export interface ClientToServerEvents {
  // Identity (send name/avatar on connect)
  'chat:identify': (data: { name: string; avatar?: string }) => void;

  // Message actions
  'chat:send': (data: { text: string; name?: string; avatar?: string; replyToId?: string }) => void;
  'chat:typing': () => void;
  'chat:stopped-typing': () => void;

  // Reaction actions
  'chat:react': (data: { messageId: string; emoji: string }) => void;
  'chat:unreact': (data: { messageId: string; emoji: string }) => void;

  // Admin actions
  'admin:delete': (data: { messageId: string }) => void;
  'admin:pin': (data: { messageId: string }) => void;
  'admin:unpin': (data: { messageId: string }) => void;
  'admin:mute': (data: { userId: string; durationMinutes: number }) => void;
  'admin:unmute': (data: { userId: string }) => void;
}

// ============ Encryption Types ============

export interface EncryptionConfig {
  // Shared encryption key (derived from a passphrase all 1% holders know)
  // This ensures messages are encrypted but all eligible users can decrypt
  sharedKey: string;
}

// ============ UI State Types ============

export type ChatConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ChatState {
  status: ChatConnectionStatus;
  messages: ChatMessage[];
  pinnedMessages: PinnedMessage[];
  onlineUsers: ChatUser[];
  typingUsers: string[];
  error?: string;
}

// ============ Stickers/Emojis ============

export interface WojakSticker {
  id: string;
  name: string;
  url: string;
  emoji: string;  // Shortcode like :wojak-happy:
}

export const WOJAK_STICKERS: WojakSticker[] = [
  { id: 'wojak-happy', name: 'Happy Wojak', url: '/assets/stickers/wojak-happy.png', emoji: ':wojak-happy:' },
  { id: 'wojak-sad', name: 'Sad Wojak', url: '/assets/stickers/wojak-sad.png', emoji: ':wojak-sad:' },
  { id: 'wojak-thinking', name: 'Thinking Wojak', url: '/assets/stickers/wojak-thinking.png', emoji: ':wojak-thinking:' },
  { id: 'wojak-smug', name: 'Smug Wojak', url: '/assets/stickers/wojak-smug.png', emoji: ':wojak-smug:' },
  { id: 'wojak-chad', name: 'Chad', url: '/assets/stickers/wojak-chad.png', emoji: ':chad:' },
  { id: 'wojak-doomer', name: 'Doomer', url: '/assets/stickers/wojak-doomer.png', emoji: ':doomer:' },
  { id: 'wojak-bloomer', name: 'Bloomer', url: '/assets/stickers/wojak-bloomer.png', emoji: ':bloomer:' },
  { id: 'orange', name: 'Orange', url: '/assets/stickers/orange.png', emoji: ':orange:' },
];

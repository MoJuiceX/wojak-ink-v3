/**
 * HolderChat Page - All Holders Chat
 *
 * Chat room for all NFT holders (≥1 Wojak Farmers Plot NFT).
 * Features:
 * - Entry verification via profile NFT count (verified on Account page)
 * - Real-time messaging with replies and reactions
 * - @mentions with autocomplete
 * - Admin moderation tools
 * - Premium glassmorphism design
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SignInButton } from '@clerk/clerk-react';
import { ExternalLink } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useRateLimitState } from '@/hooks/useRateLimitState';
import { PageSEO } from '@/components/seo';
import { CHAT_ROOMS, isEligibleForRoom } from '@/config/chatRooms';
import type { ChatMessage, ChatUser, ChatTokenResponse } from '@/types/chat';
import './GatedChat.css';

// This page is for the "holder" chat (1+ NFT)
const CHAT_TYPE = 'holder' as const;
const ROOM_CONFIG = CHAT_ROOMS[CHAT_TYPE];
const MIN_NFTS_REQUIRED = ROOM_CONFIG.minNfts;

// Reaction emoji options
const REACTION_EMOJIS = ['👍', '👎', '🍊', '🌱', '😂', '😢'];

// ============ Utility Functions ============

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
}

function shouldShowDateSeparator(
  currentMsg: ChatMessage,
  prevMsg: ChatMessage | undefined
): boolean {
  if (!prevMsg) return true;
  const currentDate = new Date(currentMsg.timestamp).toDateString();
  const prevDate = new Date(prevMsg.timestamp).toDateString();
  return currentDate !== prevDate;
}

function shouldGroupWithPrevious(
  currentMsg: ChatMessage,
  prevMsg: ChatMessage | undefined
): boolean {
  if (!prevMsg) return false;
  // Group if same sender and within 5 minutes
  const timeDiff = currentMsg.timestamp - prevMsg.timestamp;
  return currentMsg.senderId === prevMsg.senderId && timeDiff < 5 * 60 * 1000;
}

function parseMentions(text: string): React.ReactNode[] {
  const mentionRegex = /@(\w+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} className="gc-mention">
        @{match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// MintGarden collection URL
const MINTGARDEN_URL = 'https://mintgarden.io/collections/wojak-farmers-plot-col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

// ============ Gated Entry Screen ============

interface GatedEntryProps {
  nftCount: number | null; // null = not verified
  isLoading: boolean;
  onEnter: () => void;
  isSignedIn: boolean;
  isEligible: boolean;
}

function GatedEntry({
  nftCount,
  isLoading,
  onEnter,
  isSignedIn,
  isEligible,
}: GatedEntryProps) {
  const hasVerified = nftCount !== null && nftCount !== undefined;
  const needed = hasVerified ? Math.max(0, MIN_NFTS_REQUIRED - nftCount) : MIN_NFTS_REQUIRED;

  return (
    <div className="gc-terminal-entry">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="gc-terminal-entry-icon"
      >
        {isEligible ? ROOM_CONFIG.icon : '🔒'}
      </motion.div>

      <h2 className="gc-terminal-entry-title">{ROOM_CONFIG.label}</h2>

      {/* State 1: Not signed in */}
      {!isSignedIn && (
        <div className="gc-terminal-entry-content">
          <p className="gc-terminal-entry-message">
            {'>'} Sign in to access this channel
          </p>
          <SignInButton mode="modal">
            <button className="gc-terminal-entry-btn">
              [ SIGN IN ]
            </button>
          </SignInButton>
        </div>
      )}

      {/* State 2: Signed in but wallet not verified */}
      {isSignedIn && !hasVerified && (
        <div className="gc-terminal-entry-content">
          <p className="gc-terminal-entry-message">
            {'>'} Verify wallet to check eligibility
          </p>
          <p className="gc-terminal-entry-hint">
            Required: {MIN_NFTS_REQUIRED}+ NFTs
          </p>
          <Link to="/account" className="gc-terminal-entry-btn">
            [ VERIFY WALLET ]
          </Link>
        </div>
      )}

      {/* State 3: Verified but not enough NFTs */}
      {isSignedIn && hasVerified && !isEligible && (
        <div className="gc-terminal-entry-content">
          <p className="gc-terminal-entry-message">
            {'>'} ACCESS DENIED
          </p>
          <p className="gc-terminal-entry-status">
            Your NFTs: {nftCount} / {MIN_NFTS_REQUIRED}
          </p>
          <p className="gc-terminal-entry-hint">
            Need {needed} more NFT{needed !== 1 ? 's' : ''} to unlock
          </p>
          <a
            href={MINTGARDEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gc-terminal-entry-btn"
          >
            [ BROWSE COLLECTION ]
          </a>
        </div>
      )}

      {/* State 4: Eligible */}
      {isSignedIn && hasVerified && isEligible && (
        <div className="gc-terminal-entry-content">
          <p className="gc-terminal-entry-message gc-terminal-entry-message--success">
            {'>'} ACCESS GRANTED
          </p>
          <p className="gc-terminal-entry-status">
            You hold {nftCount} Wojak Farmers Plot NFTs.
          </p>
          <p className="gc-terminal-entry-welcome">
            Welcome, holder!
          </p>
          <button
            className="gc-terminal-entry-btn gc-terminal-entry-btn--enter"
            onClick={onEnter}
            disabled={isLoading}
          >
            {isLoading ? '[ CONNECTING... ]' : '[ ENTER CHAT ]'}
          </button>
        </div>
      )}
    </div>
  );
}

// ============ Message Component ============

interface MessageProps {
  message: ChatMessage;
  isGrouped: boolean;
  isNewGroup: boolean;
  isAdmin: boolean;
  userId: string | null;
  isActive: boolean;
  onToggleActive: () => void;
  onReply: (message: ChatMessage) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onDelete: (messageId: string) => void;
  onJumpToMessage: (messageId: string) => void;
}

function Message({
  message,
  isGrouped,
  isNewGroup,
  isAdmin,
  userId,
  isActive,
  onToggleActive,
  onReply,
  onReaction,
  onDelete,
  onJumpToMessage,
}: MessageProps) {
  const isOwn = message.senderId === userId;

  const handleReactionClick = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onReaction(message.id, emoji);
    // Close picker after selecting (on mobile)
    onToggleActive();
  };

  const hasUserReacted = (emoji: string) => {
    if (!userId) return false;
    const reaction = message.reactions?.find((r) => r.emoji === emoji);
    return reaction?.users.some((u) => u.id === userId) || false;
  };

  // Get reactions that have at least one user
  const activeReactions = message.reactions?.filter(r => r.users.length > 0) || [];

  return (
    <motion.div
      className={`gc-message ${isGrouped ? 'gc-message-grouped' : ''} ${isNewGroup ? 'gc-message-new-group' : ''} ${isOwn ? 'gc-message-own' : ''} ${isActive ? 'gc-message-active' : ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onToggleActive}
    >
      <div className="gc-message-avatar">
        {message.senderAvatar ? (
          <img src={message.senderAvatar} alt="" />
        ) : (
          message.senderName.charAt(0).toUpperCase()
        )}
      </div>

      <div className="gc-message-content">
        {!isGrouped && (
          <div className="gc-message-header">
            <span className={`gc-message-name ${isAdmin && message.senderId === userId ? 'admin' : ''}`}>
              {message.senderName}
            </span>
            <span className="gc-message-time">{formatTime(message.timestamp)}</span>
          </div>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div
            className="gc-reply-preview"
            onClick={(e) => { e.stopPropagation(); onJumpToMessage(message.replyTo!.id); }}
          >
            <div className="gc-reply-content">
              <span className="gc-reply-name">{message.replyTo.senderName}</span>
              <span className="gc-reply-text">{message.replyTo.text}</span>
            </div>
          </div>
        )}

        {/* Message text with inline reactions */}
        <span className="gc-message-text">{parseMentions(message.text)}</span>
        {activeReactions.length > 0 && (
          <span className="gc-inline-reactions">
            {activeReactions.map(r => (
              <span 
                key={r.emoji} 
                className={`gc-inline-reaction ${hasUserReacted(r.emoji) ? 'user-reacted' : ''}`}
                title={r.users.map(u => u.name).join(', ')}
              >
                {r.emoji}{r.users.length > 1 && <sub>{r.users.length}</sub>}
              </span>
            ))}
          </span>
        )}

        {/* Action buttons - vertical on mobile when active */}
        <div className="gc-message-actions" onClick={(e) => e.stopPropagation()}>
          {REACTION_EMOJIS.map((emoji) => {
            const reaction = message.reactions?.find(r => r.emoji === emoji);
            const count = reaction?.users.length || 0;
            const userReacted = hasUserReacted(emoji);
            const hasReactions = count > 0;
            
            return (
              <button
                key={emoji}
                className={`gc-action-btn gc-reaction-btn ${userReacted ? 'user-reacted' : ''} ${hasReactions ? 'has-reactions' : ''}`}
                onClick={(e) => handleReactionClick(emoji, e)}
                title={reaction ? reaction.users.map(u => u.name).join(', ') : `React with ${emoji}`}
              >
                {emoji}
                {count > 0 && <span className="gc-reaction-count">{count}</span>}
              </button>
            );
          })}
          <button 
            className="gc-action-btn gc-reply-btn" 
            onClick={(e) => { e.stopPropagation(); onReply(message); }}
            title="Reply"
            aria-label="Reply to message"
          >
            ↩
          </button>
        </div>

        {/* Admin delete button - separate so it's always visible on mobile */}
        {isAdmin && (
          <button
            className="gc-admin-delete"
            onClick={(e) => { e.stopPropagation(); onDelete(message.id); }}
            title="Delete"
          >
            🗑
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ============ Chat Interface ============

interface ChatInterfaceProps {
  chatToken: string;
  userName: string;
  userAvatar?: string;
  nftCount: number;
}

function ChatInterface({ chatToken, userName, userAvatar }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [visibleDate, setVisibleDate] = useState<string>('');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    status,
    error: _chatError,
    isAdmin,
    userId,
    messages,
    onlineUsers,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    addReaction,
    removeReaction,
    deleteMessage,
    reconnect,
  } = useChatSocket({ token: chatToken, userName, userAvatar });

  // Filter users for mention autocomplete
  const filteredUsers = useMemo(() => {
    if (!mentionQuery) return [];
    const query = mentionQuery.toLowerCase();
    return onlineUsers.filter((u) =>
      u.name.toLowerCase().includes(query)
    );
  }, [mentionQuery, onlineUsers]);

  // Smart auto-scroll - only scroll to bottom if user is already near bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    // Check if user is near the bottom (within 150px)
    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Track visible date based on scroll position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || messages.length === 0) return;

    const updateVisibleDate = () => {
      const containerRect = container.getBoundingClientRect();
      // Find the first message that's visible in the viewport
      for (const msg of messages) {
        const el = container.querySelector(`[data-message-id="${msg.id}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If this message is at or below the top of the container
          if (rect.top >= containerRect.top - 50) {
            setVisibleDate(formatDateSeparator(msg.timestamp));
            return;
          }
        }
      }
      // Fallback to first message date
      if (messages.length > 0) {
        setVisibleDate(formatDateSeparator(messages[0].timestamp));
      }
    };

    // Initial update
    updateVisibleDate();

    // Update on scroll
    container.addEventListener('scroll', updateVisibleDate);
    return () => container.removeEventListener('scroll', updateVisibleDate);
  }, [messages]);

  // Parse @mention while typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Check for @mention
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = value.slice(lastAtIndex + 1);
      const spaceIndex = afterAt.indexOf(' ');
      if (spaceIndex === -1) {
        setMentionQuery(afterAt);
        setMentionIndex(0);
        return;
      }
    }
    setMentionQuery(null);

    if (value) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  // Handle mention selection
  const selectMention = (user: ChatUser) => {
    const lastAtIndex = inputValue.lastIndexOf('@');
    const newValue = inputValue.slice(0, lastAtIndex) + `@${user.name} `;
    setInputValue(newValue);
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation in mention dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionQuery !== null && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((prev) =>
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectMention(filteredUsers[mentionIndex]);
      } else if (e.key === 'Escape') {
        setMentionQuery(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue, replyingTo?.id);
      setInputValue('');
      setReplyingTo(null);
      setMentionQuery(null);
      stopTyping();
    }
  };

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const handleReaction = (messageId: string, emoji: string) => {
    // Toggle reaction
    const message = messages.find((m) => m.id === messageId);
    const reaction = message?.reactions?.find((r) => r.emoji === emoji);
    const hasReacted = reaction?.users.some((u) => u.id === userId);

    if (hasReacted) {
      removeReaction(messageId, emoji);
    } else {
      addReaction(messageId, emoji);
    }
  };

  const handleJumpToMessage = (messageId: string) => {
    const element = document.querySelector(`[data-message-id="${messageId}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="gc-crt-frame">
      {/* Terminal Header */}
      <div className="gc-terminal-header">
        <Link to="/chat" className="gc-header-back">
          ← Chat Rooms
        </Link>
        <span className="gc-header-date">
          {visibleDate || 'Today'}
        </span>
        <div className="gc-header-right">
          <span className="gc-header-pill">
            {ROOM_CONFIG.icon} {ROOM_CONFIG.label}
          </span>
          <span className={`gc-status-dot ${status}`} />
          {(status === 'error' || status === 'disconnected') && (
            <button className="gc-reconnect-btn" onClick={reconnect} aria-label="Reconnect">
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="gc-messages" ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className="gc-empty-messages">
              <p className="gc-empty-subtitle">
                No messages yet. Be the first to start the conversation.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const prevMsg = messages[index - 1];
              const showDate = shouldShowDateSeparator(msg, prevMsg);
              const isGrouped = !showDate && shouldGroupWithPrevious(msg, prevMsg);
              const isNewGroup = !isGrouped && index > 0;

              return (
                <div key={msg.id} data-message-id={msg.id}>
                  <Message
                    message={msg}
                    isGrouped={isGrouped}
                    isNewGroup={isNewGroup}
                    isAdmin={isAdmin}
                    userId={userId}
                    isActive={activeMessageId === msg.id}
                    onToggleActive={() => setActiveMessageId(activeMessageId === msg.id ? null : msg.id)}
                    onReply={handleReply}
                    onReaction={handleReaction}
                    onDelete={deleteMessage}
                    onJumpToMessage={handleJumpToMessage}
                  />
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              className="gc-typing-indicator"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="gc-typing-dots">
                <span />
                <span />
                <span />
              </div>
              <span>
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.length} people are typing...`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="gc-input-area">
          {/* Reply indicator */}
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                className="gc-input-reply"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="gc-input-reply-content">
                  <div className="gc-input-reply-name">
                    Replying to {replyingTo.senderName}
                  </div>
                  <div className="gc-input-reply-text">{replyingTo.text}</div>
                </div>
                <button
                  className="gc-input-reply-close"
                  onClick={() => setReplyingTo(null)}
                  aria-label="Cancel reply"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mention dropdown */}
          <AnimatePresence>
            {mentionQuery !== null && filteredUsers.length > 0 && (
              <motion.div
                className="gc-mention-dropdown"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className={`gc-mention-item ${index === mentionIndex ? 'selected' : ''}`}
                    onClick={() => selectMention(user)}
                  >
                    <div className="gc-mention-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="gc-mention-name">{user.name}</span>
                    <span className="gc-mention-status" />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="gc-input-wrapper" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="gc-input"
              placeholder="Type a message..."
              value={inputValue}
              onChange={handleInputChange}
              aria-label="Message input"
              onKeyDown={handleKeyDown}
              disabled={status !== 'connected'}
              maxLength={2000}
              autoComplete="off"
            />
            <button
              type="submit"
              className="gc-send-btn"
              disabled={!inputValue.trim() || status !== 'connected'}
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
    </div>
  );
}

// Boot sequence messages
const BOOT_MESSAGES = [
  { text: 'INITIALIZING SECURE CONNECTION...', delay: 0 },
  { text: 'VERIFYING NFT HOLDINGS...', delay: 300 },
  { text: 'AUTHENTICATING USER...', delay: 600 },
  { text: 'ESTABLISHING ENCRYPTED CHANNEL...', delay: 900 },
  { text: 'CONNECTION ESTABLISHED', delay: 1200, success: true },
];

// ============ Main Page Component ============

export default function HolderChat() {
  const { authenticatedFetch, isSignedIn, isLoaded } = useAuthenticatedFetch();
  const { profile, effectiveDisplayName, isAdmin } = useUserProfile();

  // State
  const [isVerifying, setIsVerifying] = useState(false);
  const [chatToken, setChatToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bootPhase, setBootPhase] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const bootStartedRef = useRef(false);

  // Rate limit handling - prevents retry loop on 429 errors
  const { isRateLimited, secondsRemaining, handleRateLimitResponse } = useRateLimitState();

  // Get NFT count from profile (verified on Account page)
  const nftCount = profile?.nftCount ?? null;
  const walletAddress = profile?.walletAddress;
  const hasVerified = nftCount !== null;
  // Admins bypass NFT verification requirement
  const isEligible = isAdmin || (hasVerified && isEligibleForRoom(nftCount, CHAT_TYPE));

  const userName = effectiveDisplayName || `Holder #${nftCount || 0}`;
  const userAvatar =
    profile?.avatar?.type === 'nft' ? profile.avatar.value : undefined;

  // Enter chat - verify with server and get token
  const handleEnterChat = useCallback(async () => {
    if (!isSignedIn) {
      setError('Please sign in first');
      return;
    }

    // Admins can enter without wallet verification
    if (!isAdmin && (!hasVerified || !walletAddress)) {
      setError('Please verify your wallet on the Account page first');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Verify eligibility with server (uses stored nftCount for verification)
      // For admins without wallet, pass empty string - server will handle it
      const verifyRes = await authenticatedFetch('/api/chat/verify-eligibility', {
        method: 'POST',
        body: JSON.stringify({ walletAddress: walletAddress || '', chatType: CHAT_TYPE }),
      });

      const verifyData = await verifyRes.json();

      // Check eligibility for this specific room
      const roomEligibility = verifyData.eligibility?.[CHAT_TYPE];
      if (!verifyData.isAdmin && !roomEligibility?.eligible) {
        setError(
          verifyData.message ||
            `Need ${MIN_NFTS_REQUIRED}+ NFTs for ${ROOM_CONFIG.label}. You have ${verifyData.nftCount || 0}.`
        );
        setIsVerifying(false);
        return;
      }

      // Get chat token for this room
      // For admins without wallet, pass empty string - server will handle it
      const tokenRes = await authenticatedFetch('/api/chat/token', {
        method: 'POST',
        body: JSON.stringify({ walletAddress: walletAddress || '', chatType: CHAT_TYPE }),
      });

      // Check for rate limit BEFORE parsing body - this sets isRateLimited state
      if (handleRateLimitResponse(tokenRes)) {
        // Rate limited - don't set error, the countdown will show instead
        setIsVerifying(false);
        return;
      }

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json();
        throw new Error(errorData.error || 'Failed to get chat token');
      }

      const tokenData: ChatTokenResponse = await tokenRes.json();
      setChatToken(tokenData.token);
    } catch (err) {
      console.error('[HolderChat] Verification error:', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }, [isSignedIn, isAdmin, hasVerified, walletAddress, authenticatedFetch, handleRateLimitResponse]);

  // Auto-connect eligible users (skip the GatedEntry screen)
  // Admins can connect even without a wallet
  useEffect(() => {
    if (
      isLoaded &&
      isSignedIn &&
      isEligible &&
      (walletAddress || isAdmin) &&
      !chatToken &&
      !isVerifying &&
      !error &&
      !isRateLimited  // Don't auto-connect during rate limit window
    ) {
      handleEnterChat();
    }
  }, [isLoaded, isSignedIn, isEligible, walletAddress, isAdmin, chatToken, isVerifying, error, isRateLimited, handleEnterChat]);

  // Boot sequence animation when chatToken is received
  useEffect(() => {
    if (chatToken && !bootStartedRef.current) {
      bootStartedRef.current = true;
      
      // Run boot sequence
      setBootPhase(0);
      const timers: NodeJS.Timeout[] = [];
      
      BOOT_MESSAGES.forEach((msg, index) => {
        const timer = setTimeout(() => {
          setBootPhase(index + 1);
        }, msg.delay);
        timers.push(timer);
      });

      // Show welcome screen after boot sequence (at 1.5s)
      const welcomeTimer = setTimeout(() => {
        setShowWelcome(true);
      }, 1500);
      timers.push(welcomeTimer);

      // Show chat 3 seconds after welcome appears (at 4.5s)
      const chatTimer = setTimeout(() => {
        setShowChat(true);
      }, 4500);
      timers.push(chatTimer);

      return () => timers.forEach(t => clearTimeout(t));
    }
  }, [chatToken]);

  // Loading state
  if (!isLoaded) {
    return (
      <>
        <div className="gc-container">
          <div className="gc-content">
            <div className="gc-loading">
              <div className="gc-spinner" />
              <span>Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageSEO
        title="Holder Chat | Wojak.ink"
        description="Chat room for all Wojak Farmers Plot NFT holders (1+ NFT)"
        path="/chat/holder"
      />

      <div className="gc-container">
        <div className="gc-content">
          {/* CRT Frame - fixed positioning like arcade */}
          <div className="gc-frame-wrapper">
            {/* PNG background layer (decorative) */}
            <div className="gc-frame-inner" />
            {/* Chat screen area - sibling to frame-inner */}
            <div className="gc-chat-screen">
              {/* Error Display (includes rate limit countdown) */}
              <AnimatePresence>
                {(error || isRateLimited) && (
                  <motion.div
                    className="gc-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {isRateLimited
                      ? `Too many requests. You can retry in ${secondsRemaining} second${secondsRemaining !== 1 ? 's' : ''}.`
                      : error}
                    {!isRateLimited && (
                      <button
                        className="gc-error-retry"
                        onClick={() => setError(null)}
                      >
                        Dismiss
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Content with smooth transitions */}
              <AnimatePresence mode="wait">
                {chatToken && showChat ? (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    <ChatInterface
                      chatToken={chatToken}
                      userName={userName}
                      userAvatar={userAvatar}
                      nftCount={nftCount || 0}
                    />
                  </motion.div>
                ) : chatToken && showWelcome ? (
                  /* Welcome screen - shows for 3 seconds */
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="gc-welcome-screen"
                  >
                    <div className="gc-welcome-icon">💬</div>
                    <h2 className="gc-welcome-title">Welcome to Holder Chat</h2>
                    <p className="gc-welcome-subtitle">
                      Connect with fellow Wojak NFT holders.
                    </p>
                    <p className="gc-welcome-hint">Entering chat...</p>
                  </motion.div>
                ) : chatToken ? (
                  /* Boot sequence animation */
                  <motion.div
                    key="boot"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="gc-boot-sequence"
                  >
                    {BOOT_MESSAGES.slice(0, bootPhase).map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`gc-boot-line ${msg.success ? 'gc-boot-line--success' : 'gc-boot-line--loading'}`}
                      >
                        {'>'} {msg.text}
                      </motion.div>
                    ))}
                    {bootPhase < BOOT_MESSAGES.length && (
                      <div className="gc-boot-cursor">_</div>
                    )}
                  </motion.div>
                ) : isVerifying && isEligible ? (
                  /* Inline connecting state for eligible users */
                  <motion.div
                    key="connecting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="gc-boot-sequence"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="gc-boot-line gc-boot-line--loading"
                    >
                      {'>'} ESTABLISHING CONNECTION...
                    </motion.div>
                    <div className="gc-boot-cursor">_</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="entry"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    <GatedEntry
                      nftCount={nftCount}
                      isLoading={isVerifying}
                      onEnter={handleEnterChat}
                      isSignedIn={isSignedIn}
                      isEligible={isEligible}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

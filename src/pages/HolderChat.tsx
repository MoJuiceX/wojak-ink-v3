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
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SignInButton } from '@clerk/clerk-react';
import { ExternalLink } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useChatSocket } from '@/hooks/useChatSocket';
import { PageSEO } from '@/components/seo';
import { CHAT_ROOMS, isEligibleForRoom } from '@/config/chatRooms';
import type { ChatMessage, ChatUser, ChatTokenResponse } from '@/types/chat';
import './GatedChat.css';

// This page is for the "holder" chat (1+ NFT)
const CHAT_TYPE = 'holder' as const;
const ROOM_CONFIG = CHAT_ROOMS[CHAT_TYPE];
const MIN_NFTS_REQUIRED = ROOM_CONFIG.minNfts;

// Reaction emoji options
const REACTION_EMOJIS = ['👍', '🔥', '😂', '❤️', '😢'];

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
  const progress = hasVerified ? Math.min((nftCount / MIN_NFTS_REQUIRED) * 100, 100) : 0;

  return (
    <div className="gc-gated-screen">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="gc-lock-icon"
      >
        {isEligible ? '🐋' : '🔒'}
      </motion.div>

      <h2 className="gc-gated-title">{ROOM_CONFIG.label}</h2>

      {/* State 1: Not signed in */}
      {!isSignedIn && (
        <>
          <p className="gc-gated-message">
            Sign in to access the {ROOM_CONFIG.label}.
          </p>
          <SignInButton mode="modal">
            <button className="gc-cta-button">
              Sign In
            </button>
          </SignInButton>
        </>
      )}

      {/* State 2: Signed in but wallet not verified */}
      {isSignedIn && !hasVerified && (
        <>
          <p className="gc-gated-message">
            Verify your wallet to check if you qualify for the {ROOM_CONFIG.label}.
          </p>
          <p className="gc-gated-hint">
            You need {MIN_NFTS_REQUIRED}+ Wojak Farmers Plot NFTs to enter.
          </p>
          <Link to="/account" className="gc-cta-button gc-cta-button--outline">
            Go to Account Page
          </Link>
        </>
      )}

      {/* State 3: Verified but not enough NFTs */}
      {isSignedIn && hasVerified && !isEligible && (
        <>
          <p className="gc-gated-message">
            {nftCount === 0
              ? `Hold at least ${MIN_NFTS_REQUIRED} Wojak Farmers Plot NFTs to join.`
              : `You need ${needed} more NFT${needed !== 1 ? 's' : ''} to join the ${ROOM_CONFIG.label}.`}
          </p>

          {nftCount! > 0 && (
            <>
              <div className="gc-nft-count">
                <span className="gc-count-current">{nftCount}</span>
                <span className="gc-count-divider">/</span>
                <span className="gc-count-required">{MIN_NFTS_REQUIRED}</span>
              </div>

              <div className="gc-progress-bar">
                <motion.div
                  className="gc-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </>
          )}

          <a
            href={MINTGARDEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gc-cta-button"
          >
            Browse Collection
            <ExternalLink size={16} style={{ marginLeft: 8 }} />
          </a>

          <Link to="/account" className="gc-secondary-link">
            Refresh NFT count on Account page
          </Link>
        </>
      )}

      {/* State 4: Eligible */}
      {isSignedIn && hasVerified && isEligible && (
        <>
          <p className="gc-gated-message gc-gated-message--success">
            You hold <strong>{nftCount}</strong> Wojak Farmers Plot NFTs.<br />
            Welcome to the 1% club!
          </p>
          <button
            className="gc-cta-button"
            onClick={onEnter}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Enter Chat'}
          </button>
        </>
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
  onReply,
  onReaction,
  onDelete,
  onJumpToMessage,
}: MessageProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleReactionClick = (emoji: string) => {
    onReaction(message.id, emoji);
    setShowReactionPicker(false);
  };

  const hasUserReacted = (emoji: string) => {
    if (!userId) return false;
    const reaction = message.reactions?.find((r) => r.emoji === emoji);
    return reaction?.users.some((u) => u.id === userId) || false;
  };

  return (
    <motion.div
      className={`gc-message ${isGrouped ? 'gc-message-grouped' : ''} ${isNewGroup ? 'gc-message-new-group' : ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onMouseLeave={() => setShowReactionPicker(false)}
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
            onClick={() => onJumpToMessage(message.replyTo!.id)}
          >
            <span className="gc-reply-name">
              Replying to {message.replyTo.senderName}
            </span>
            <span className="gc-reply-text">{message.replyTo.text}</span>
          </div>
        )}

        <div className="gc-message-text">{parseMentions(message.text)}</div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="gc-reactions">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                className={`gc-reaction ${hasUserReacted(reaction.emoji) ? 'active' : ''}`}
                onClick={() => handleReactionClick(reaction.emoji)}
                title={reaction.users.map((u) => u.name).join(', ')}
              >
                <span>{reaction.emoji}</span>
                <span className="gc-reaction-count">{reaction.users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Reaction picker */}
        <div
          className={`gc-reaction-picker ${showReactionPicker ? 'visible' : ''}`}
        >
          {REACTION_EMOJIS.map((emoji) => (
            <button key={emoji} onClick={() => handleReactionClick(emoji)}>
              {emoji}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="gc-message-actions">
          <button
            className="gc-action-btn"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            aria-label="Add reaction"
            aria-expanded={showReactionPicker}
          >
            React
          </button>
          <button 
            className="gc-action-btn" 
            onClick={() => onReply(message)}
            aria-label="Reply to message"
          >
            Reply
          </button>
          {isAdmin && (
            <button
              className="gc-action-btn danger"
              onClick={() => onDelete(message.id)}
            >
              Delete
            </button>
          )}
        </div>
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
  const [showUserDrawer, setShowUserDrawer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    status,
    error,
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
    <div className="gc-chat-wrapper">
      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Connection Status */}
        <div className="gc-connection-status">
          <div className={`gc-status-dot ${status}`} />
          <span>
            {status === 'connected' && `Connected • ${onlineUsers.length} online`}
            {status === 'connecting' && (error || 'Connecting...')}
            {status === 'disconnected' && 'Disconnected'}
            {status === 'error' && (error || 'Connection error')}
          </span>
          {(status === 'error' || status === 'disconnected') && (
            <button className="gc-reconnect-btn" onClick={reconnect} aria-label="Reconnect">
              Reconnect
            </button>
          )}
          {/* Mobile-only button to show online users */}
          {status === 'connected' && (
            <button 
              className="gc-mobile-users-btn"
              onClick={() => setShowUserDrawer(true)}
              aria-label="Show online users"
            >
              👥 {onlineUsers.length}
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="gc-messages" ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className="gc-empty-messages">
              <div className="gc-empty-icon">{ROOM_CONFIG.icon}</div>
              <h3 className="gc-empty-title">Welcome to {ROOM_CONFIG.label}</h3>
              <p className="gc-empty-subtitle">
                Connect with fellow Wojak NFT holders. Start the conversation.
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
                  {showDate && (
                    <div className="gc-date-separator">
                      {formatDateSeparator(msg.timestamp)}
                    </div>
                  )}
                  <Message
                    message={msg}
                    isGrouped={isGrouped}
                    isNewGroup={isNewGroup}
                    isAdmin={isAdmin}
                    userId={userId}
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

      {/* Online Users Sidebar (Desktop) */}
      <div className="gc-sidebar">
        <h3 className="gc-sidebar-title">Online — {onlineUsers.length}</h3>
        <div className="gc-user-list">
          {onlineUsers.map((user) => (
            <div
              key={user.id}
              className={`gc-user-item ${user.isMuted ? 'gc-user-muted' : ''}`}
            >
              <div className="gc-user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt="" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <span
                className={`gc-user-name ${user.isAdmin ? 'gc-user-admin' : ''}`}
              >
                {user.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile User Drawer */}
      <div
        className={`gc-user-drawer-backdrop ${showUserDrawer ? 'open' : ''}`}
        onClick={() => setShowUserDrawer(false)}
      >
        <div
          className="gc-user-drawer"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="gc-user-drawer-handle" />
          <div className="gc-user-drawer-content">
            <h3 className="gc-user-drawer-title">
              Online — {onlineUsers.length}
            </h3>
            <div className="gc-user-list">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className={`gc-user-item ${user.isMuted ? 'gc-user-muted' : ''}`}
                >
                  <div className="gc-user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span
                    className={`gc-user-name ${user.isAdmin ? 'gc-user-admin' : ''}`}
                  >
                    {user.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Main Page Component ============

export default function HolderChat() {
  const navigate = useNavigate();
  const { authenticatedFetch, isSignedIn, isLoaded } = useAuthenticatedFetch();
  const { profile, effectiveDisplayName } = useUserProfile();

  // State
  const [isVerifying, setIsVerifying] = useState(false);
  const [chatToken, setChatToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get NFT count from profile (verified on Account page)
  const nftCount = profile?.nftCount ?? null;
  const walletAddress = profile?.walletAddress;
  const hasVerified = nftCount !== null;
  const isEligible = hasVerified && isEligibleForRoom(nftCount, CHAT_TYPE);

  const userName = effectiveDisplayName || `Holder #${nftCount || 0}`;
  const userAvatar =
    profile?.avatar?.type === 'nft' ? profile.avatar.value : undefined;

  // Enter chat - verify with server and get token
  const handleEnterChat = useCallback(async () => {
    if (!isSignedIn) {
      setError('Please sign in first');
      return;
    }

    if (!hasVerified || !walletAddress) {
      setError('Please verify your wallet on the Account page first');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Verify eligibility with server (uses stored nftCount for verification)
      const verifyRes = await authenticatedFetch('/api/chat/verify-eligibility', {
        method: 'POST',
        body: JSON.stringify({ walletAddress, chatType: CHAT_TYPE }),
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
      const tokenRes = await authenticatedFetch('/api/chat/token', {
        method: 'POST',
        body: JSON.stringify({ walletAddress, chatType: CHAT_TYPE }),
      });

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json();
        throw new Error(errorData.error || 'Failed to get chat token');
      }

      const tokenData: ChatTokenResponse = await tokenRes.json();
      setChatToken(tokenData.token);
    } catch (err) {
      console.error('[GatedChat] Verification error:', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }, [isSignedIn, hasVerified, walletAddress, authenticatedFetch]);

  // Loading state
  if (!isLoaded) {
    return (
      <PageTransition>
        <div className="gc-container">
          <div className="gc-content">
            <div className="gc-loading">
              <div className="gc-spinner" />
              <span>Loading...</span>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageSEO
        title="Holder Chat | Wojak.ink"
        description="Chat room for all Wojak Farmers Plot NFT holders (1+ NFT)"
        path="/chat/holder"
      />

      <div className="gc-container">
        <div className="gc-content">
          {/* Header */}
          <div className="gc-header">
            <div className="gc-header-left">
              <button 
                className="gc-back-btn"
                onClick={() => navigate('/chat')}
                title="Back to Chat Hub"
                aria-label="Back to chat rooms"
              >
                ←
              </button>
              <div className="gc-badge">
                <span className="gc-badge-icon">{ROOM_CONFIG.icon}</span>
                <span>{ROOM_CONFIG.label}</span>
              </div>
              <h1 className="gc-title">{ROOM_CONFIG.label}</h1>
            </div>
            {chatToken && (
              <div className="gc-online-count">
                <div className="gc-online-dot" />
                <span>Live</span>
              </div>
            )}
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="gc-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
                <button
                  className="gc-error-retry"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          {chatToken ? (
            <ChatInterface
              chatToken={chatToken}
              userName={userName}
              userAvatar={userAvatar}
              nftCount={nftCount || 0}
            />
          ) : (
            <GatedEntry
              nftCount={nftCount}
              isLoading={isVerifying}
              onEnter={handleEnterChat}
              isSignedIn={isSignedIn}
              isEligible={isEligible}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}

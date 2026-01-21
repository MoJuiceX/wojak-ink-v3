# SPEC 04: Friends System

> **For Claude CLI**: This specification contains all the code patterns, file paths, and implementation details you need. Follow this spec exactly.

---

## Overview

Allow users to add friends and see their friends' scores on leaderboards. Users can browse all registered users and add them as friends.

**Features:**
1. View list of all users who have signed in and set a username
2. Search/filter users by display name
3. Add users as friends (direct add, no request flow)
4. View friends list
5. See "Friends" tab on leaderboards showing only friends' scores
6. Click any user to view their public profile

---

## Data Model

### Friendship (Direct Add - Not Mutual)
If User A adds User B, User A sees User B in their friends list.
User B would need to add User A separately to see A in their list.

```typescript
interface Friendship {
  id: string;
  userId: string;      // The user who added the friend
  friendId: string;    // The friend's user ID
  createdAt: Date;
}
```

### User Summary (For Display)
```typescript
interface UserSummary {
  id: string;
  displayName: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
    source: string;
  };
}
```

---

## Files to Create

### 1. Friends Context
**File: `src/contexts/FriendsContext.tsx`**

```typescript
/**
 * FriendsContext
 *
 * Manages friend relationships and user discovery.
 * Uses localStorage for persistence (can be upgraded to backend later).
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUserProfile } from './UserProfileContext';

const FRIENDS_STORAGE_KEY = 'wojak_friends';

interface UserSummary {
  id: string;
  displayName: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
    source: string;
  };
}

interface FriendsContextType {
  friends: string[];                    // Array of friend user IDs
  friendProfiles: UserSummary[];        // Full friend data
  isLoading: boolean;

  // Friend management
  addFriend: (userId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  isFriend: (userId: string) => boolean;

  // User discovery
  searchUsers: (query: string) => Promise<UserSummary[]>;
  getAllUsers: (limit?: number, offset?: number) => Promise<{
    users: UserSummary[];
    total: number;
    hasMore: boolean;
  }>;

  // Refresh
  refreshFriends: () => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | null>(null);

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const { profile, isSignedIn } = useUserProfile();
  const [friends, setFriends] = useState<string[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load friends from localStorage on mount
  useEffect(() => {
    if (!isSignedIn || !profile?.userId) {
      setFriends([]);
      setFriendProfiles([]);
      return;
    }

    const stored = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Get friends for current user
        const userFriends = parsed[profile.userId] || [];
        setFriends(userFriends);
      } catch (e) {
        console.error('[Friends] Failed to parse stored friends:', e);
      }
    }
  }, [isSignedIn, profile?.userId]);

  // Fetch friend profiles when friends list changes
  useEffect(() => {
    if (friends.length === 0) {
      setFriendProfiles([]);
      return;
    }

    async function fetchProfiles() {
      try {
        // Fetch profiles for all friends
        const profiles = await Promise.all(
          friends.map(async (friendId) => {
            const response = await fetch(`/api/profile/${friendId}`);
            if (!response.ok) return null;
            const data = await response.json();
            return {
              id: data.userId,
              displayName: data.displayName,
              avatar: data.avatar,
            } as UserSummary;
          })
        );
        setFriendProfiles(profiles.filter(Boolean) as UserSummary[]);
      } catch (error) {
        console.error('[Friends] Failed to fetch friend profiles:', error);
      }
    }

    fetchProfiles();
  }, [friends]);

  // Save friends to localStorage
  const saveFriends = useCallback((userId: string, friendIds: string[]) => {
    const stored = localStorage.getItem(FRIENDS_STORAGE_KEY);
    const allFriends = stored ? JSON.parse(stored) : {};
    allFriends[userId] = friendIds;
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(allFriends));
  }, []);

  // Add friend
  const addFriend = useCallback(async (friendId: string) => {
    if (!profile?.userId || friendId === profile.userId) return;
    if (friends.includes(friendId)) return; // Already a friend

    const newFriends = [...friends, friendId];
    setFriends(newFriends);
    saveFriends(profile.userId, newFriends);

    // Optionally notify backend
    try {
      await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });
    } catch (e) {
      // localStorage is primary, API is optional
      console.log('[Friends] Backend sync skipped');
    }
  }, [profile?.userId, friends, saveFriends]);

  // Remove friend
  const removeFriend = useCallback(async (friendId: string) => {
    if (!profile?.userId) return;

    const newFriends = friends.filter(id => id !== friendId);
    setFriends(newFriends);
    saveFriends(profile.userId, newFriends);

    // Optionally notify backend
    try {
      await fetch(`/api/friends/${friendId}`, { method: 'DELETE' });
    } catch (e) {
      console.log('[Friends] Backend sync skipped');
    }
  }, [profile?.userId, friends, saveFriends]);

  // Check if user is friend
  const isFriend = useCallback((userId: string) => {
    return friends.includes(userId);
  }, [friends]);

  // Search users by display name
  const searchUsers = useCallback(async (query: string): Promise<UserSummary[]> => {
    if (!query.trim()) return [];

    try {
      const response = await fetch(
        `/api/users?search=${encodeURIComponent(query)}&limit=20`
      );
      if (!response.ok) return [];

      const data = await response.json();
      return data.users.filter((u: UserSummary) => u.id !== profile?.userId);
    } catch (error) {
      console.error('[Friends] Search failed:', error);
      return [];
    }
  }, [profile?.userId]);

  // Get all users (paginated)
  const getAllUsers = useCallback(async (limit = 50, offset = 0) => {
    try {
      const response = await fetch(`/api/users?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        return { users: [], total: 0, hasMore: false };
      }

      const data = await response.json();
      return {
        users: data.users.filter((u: UserSummary) => u.id !== profile?.userId),
        total: data.total,
        hasMore: data.hasMore,
      };
    } catch (error) {
      console.error('[Friends] Failed to fetch users:', error);
      return { users: [], total: 0, hasMore: false };
    }
  }, [profile?.userId]);

  // Refresh friends list
  const refreshFriends = useCallback(async () => {
    if (!profile?.userId) return;

    setIsLoading(true);
    try {
      // Reload from backend if available
      const response = await fetch('/api/friends');
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friendIds);
        saveFriends(profile.userId, data.friendIds);
      }
    } catch (e) {
      // Use localStorage as fallback
      console.log('[Friends] Using localStorage friends');
    } finally {
      setIsLoading(false);
    }
  }, [profile?.userId, saveFriends]);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        friendProfiles,
        isLoading,
        addFriend,
        removeFriend,
        isFriend,
        searchUsers,
        getAllUsers,
        refreshFriends,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within FriendsProvider');
  }
  return context;
}
```

---

### 2. Friends List Component
**File: `src/components/Friends/FriendsList.tsx`**

```typescript
/**
 * FriendsList Component
 *
 * Displays current friends with options to view profile or remove.
 */

import { Link } from 'react-router-dom';
import { UserMinus, ExternalLink } from 'lucide-react';
import { useFriends } from '@/contexts/FriendsContext';
import { Avatar } from '@/components/Avatar/Avatar';
import './Friends.css';

interface FriendsListProps {
  onViewProfile?: (userId: string) => void;
}

export function FriendsList({ onViewProfile }: FriendsListProps) {
  const { friendProfiles, removeFriend, isLoading } = useFriends();

  if (isLoading) {
    return (
      <div className="friends-loading">
        Loading friends...
      </div>
    );
  }

  if (friendProfiles.length === 0) {
    return (
      <div className="friends-empty">
        <span className="empty-icon">👥</span>
        <p>No friends yet</p>
        <p className="empty-hint">Add friends to compare scores on leaderboards!</p>
      </div>
    );
  }

  return (
    <div className="friends-list">
      {friendProfiles.map((friend) => (
        <div key={friend.id} className="friend-card">
          <Link to={`/profile/${friend.id}`} className="friend-info">
            <Avatar avatar={friend.avatar} size="medium" />
            <span className="friend-name">{friend.displayName}</span>
          </Link>

          <div className="friend-actions">
            <Link
              to={`/profile/${friend.id}`}
              className="action-button view-profile"
              title="View profile"
            >
              <ExternalLink size={16} />
            </Link>

            <button
              className="action-button remove-friend"
              onClick={() => removeFriend(friend.id)}
              title="Remove friend"
            >
              <UserMinus size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### 3. User Browser Component
**File: `src/components/Friends/UserBrowser.tsx`**

```typescript
/**
 * UserBrowser Component
 *
 * Browse and search all registered users to add as friends.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Check, Loader2 } from 'lucide-react';
import { useFriends } from '@/contexts/FriendsContext';
import { Avatar } from '@/components/Avatar/Avatar';
import { useDebounce } from '@/hooks/useDebounce';
import './Friends.css';

interface UserSummary {
  id: string;
  displayName: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
    source: string;
  };
}

export function UserBrowser() {
  const { searchUsers, getAllUsers, addFriend, isFriend } = useFriends();

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Load initial users or search results
  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);

      if (debouncedQuery.trim()) {
        const results = await searchUsers(debouncedQuery);
        setUsers(results);
        setHasMore(false);
      } else {
        const result = await getAllUsers(50, 0);
        setUsers(result.users);
        setHasMore(result.hasMore);
        setOffset(50);
      }

      setIsLoading(false);
    }

    loadUsers();
  }, [debouncedQuery, searchUsers, getAllUsers]);

  // Load more users
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    const result = await getAllUsers(50, offset);
    setUsers(prev => [...prev, ...result.users]);
    setHasMore(result.hasMore);
    setOffset(prev => prev + 50);
    setIsLoading(false);
  }, [hasMore, isLoading, offset, getAllUsers]);

  const handleAddFriend = async (userId: string) => {
    await addFriend(userId);
  };

  return (
    <div className="user-browser">
      {/* Search Input */}
      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* User List */}
      {isLoading && users.length === 0 ? (
        <div className="users-loading">
          <Loader2 className="spin" size={24} />
          <p>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="users-empty">
          <p>No users found</p>
        </div>
      ) : (
        <>
          <div className="users-grid">
            {users.map((user) => {
              const isAlreadyFriend = isFriend(user.id);

              return (
                <div key={user.id} className="user-card">
                  <Link to={`/profile/${user.id}`} className="user-info">
                    <Avatar avatar={user.avatar} size="medium" />
                    <span className="user-name">{user.displayName}</span>
                  </Link>

                  <button
                    className={`add-friend-button ${isAlreadyFriend ? 'added' : ''}`}
                    onClick={() => !isAlreadyFriend && handleAddFriend(user.id)}
                    disabled={isAlreadyFriend}
                  >
                    {isAlreadyFriend ? (
                      <>
                        <Check size={14} />
                        Added
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        Add
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <button
              className="load-more-button"
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="spin" size={16} />
              ) : (
                'Load more'
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
```

---

### 4. Friends Page
**File: `src/pages/Friends.tsx`**

```typescript
/**
 * Friends Page
 *
 * Manage friends and discover new users.
 */

import { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { useLayout } from '@/hooks/useLayout';
import { useFriends } from '@/contexts/FriendsContext';
import { FriendsList } from '@/components/Friends/FriendsList';
import { UserBrowser } from '@/components/Friends/UserBrowser';
import { PageTransition } from '@/components/layout/PageTransition';
import '@/components/Friends/Friends.css';

type Tab = 'friends' | 'find';

export default function Friends() {
  const { contentPadding, isDesktop } = useLayout();
  const { friends } = useFriends();
  const [activeTab, setActiveTab] = useState<Tab>('friends');

  return (
    <PageTransition>
      <div
        style={{
          padding: contentPadding,
          maxWidth: isDesktop ? '600px' : undefined,
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div className="friends-header">
          <h1 className="page-title">
            <Users size={24} />
            Friends
          </h1>
        </div>

        {/* Tabs */}
        <div className="friends-tabs">
          <button
            className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <Users size={16} />
            My Friends
            {friends.length > 0 && (
              <span className="tab-badge">{friends.length}</span>
            )}
          </button>

          <button
            className={`tab-button ${activeTab === 'find' ? 'active' : ''}`}
            onClick={() => setActiveTab('find')}
          >
            <UserPlus size={16} />
            Find Users
          </button>
        </div>

        {/* Tab Content */}
        <div className="friends-content">
          {activeTab === 'friends' ? (
            <FriendsList />
          ) : (
            <UserBrowser />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
```

---

### 5. Friends Styles
**File: `src/components/Friends/Friends.css`**

```css
/* ============ Page Layout ============ */
.friends-header {
  margin-bottom: 1.5rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

/* ============ Tabs ============ */
.friends-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 4px;
  background: var(--color-bg-secondary);
  border-radius: 12px;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  color: var(--color-text-primary);
}

.tab-button.active {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-badge {
  background: var(--color-brand-primary);
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

/* ============ Friends List ============ */
.friends-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.friend-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}

.friend-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.friend-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-button:hover {
  background: var(--color-bg-primary);
}

.action-button.remove-friend:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* ============ User Browser ============ */
.user-browser {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 40px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-brand-primary);
}

.users-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem;
  background: var(--color-bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--color-border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-friend-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: var(--color-brand-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-friend-button:hover:not(:disabled) {
  opacity: 0.9;
}

.add-friend-button.added {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  cursor: default;
}

.load-more-button {
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.load-more-button:hover {
  background: var(--color-bg-secondary);
}

/* ============ Empty/Loading States ============ */
.friends-empty,
.users-empty,
.friends-loading,
.users-loading {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-hint {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

### 6. Update Leaderboard Component - Add Friends Filter
**File: `src/components/Leaderboard/Leaderboard.tsx`**

Add a "Friends" filter tab:

```typescript
import { useFriends } from '@/contexts/FriendsContext';

// Inside component:
const { friends, isFriend } = useFriends();
const [filter, setFilter] = useState<'all' | 'friends'>('all');

// Filter entries based on selected tab
const filteredEntries = useMemo(() => {
  if (!data?.entries) return [];

  if (filter === 'friends') {
    return data.entries.filter(entry => isFriend(entry.userId));
  }

  return data.entries;
}, [data?.entries, filter, isFriend]);

// In render, add filter tabs:
<div className="leaderboard-filters">
  <button
    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
    onClick={() => setFilter('all')}
  >
    All Players
  </button>

  <button
    className={`filter-tab ${filter === 'friends' ? 'active' : ''}`}
    onClick={() => setFilter('friends')}
  >
    Friends
    {friends.length > 0 && (
      <span className="filter-badge">{friends.length}</span>
    )}
  </button>
</div>

// Highlight friends in the list:
{filteredEntries.map((entry) => (
  <LeaderboardEntry
    key={entry.userId}
    entry={entry}
    highlighted={entry.rank <= 3}
    isFriend={isFriend(entry.userId)}
  />
))}
```

Update LeaderboardEntry to show friend indicator:

```typescript
interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  highlighted?: boolean;
  isFriend?: boolean;
}

// In render:
<div className={`leaderboard-entry ${isFriend ? 'is-friend' : ''}`}>
  {/* ... */}
  {isFriend && <span className="friend-indicator">👤</span>}
</div>
```

Add styles:
```css
.leaderboard-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-tab {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.filter-tab.active {
  background: var(--color-brand-primary);
  border-color: var(--color-brand-primary);
  color: white;
}

.filter-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 1px 5px;
  border-radius: 8px;
  font-size: 0.625rem;
}

.leaderboard-entry.is-friend {
  background: rgba(249, 115, 22, 0.05);
  border-left: 2px solid var(--color-brand-primary);
}

.friend-indicator {
  font-size: 0.75rem;
  margin-left: auto;
}
```

---

### 7. API Endpoints

**File: `functions/api/users.ts`**

```typescript
/**
 * Users API
 *
 * GET /api/users - List all users with display names
 * Query params: search, limit, offset
 */

import { Env } from '../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const search = url.searchParams.get('search') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    // Count total
    let countQuery = 'SELECT COUNT(*) as total FROM profiles WHERE display_name IS NOT NULL';
    let dataQuery = `
      SELECT
        user_id as id,
        display_name,
        avatar_type,
        avatar_value,
        avatar_source
      FROM profiles
      WHERE display_name IS NOT NULL
    `;

    if (search) {
      const searchCondition = ` AND LOWER(display_name) LIKE ?`;
      countQuery += searchCondition;
      dataQuery += searchCondition;
    }

    dataQuery += ` ORDER BY display_name ASC LIMIT ? OFFSET ?`;

    const searchPattern = `%${search.toLowerCase()}%`;

    const countResult = search
      ? await context.env.DB.prepare(countQuery).bind(searchPattern).first<{ total: number }>()
      : await context.env.DB.prepare(countQuery).first<{ total: number }>();

    const total = countResult?.total || 0;

    const results = search
      ? await context.env.DB.prepare(dataQuery).bind(searchPattern, limit, offset).all()
      : await context.env.DB.prepare(dataQuery).bind(limit, offset).all();

    const users = (results.results || []).map((row: any) => ({
      id: row.id,
      displayName: row.display_name,
      avatar: {
        type: row.avatar_type || 'emoji',
        value: row.avatar_value || '🎮',
        source: row.avatar_source || 'default',
      },
    }));

    return new Response(JSON.stringify({
      users,
      total,
      hasMore: offset + users.length < total,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Users API] Error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
    });
  }
};
```

**File: `functions/api/friends.ts`** (Optional backend sync)

```typescript
/**
 * Friends API
 *
 * GET /api/friends - Get current user's friends
 * POST /api/friends - Add a friend
 */

import { Env } from '../types';
import { getAuth } from '@clerk/cloudflare-workers';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = getAuth(context.request);
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const results = await context.env.DB.prepare(
      'SELECT friend_id FROM friends WHERE user_id = ?'
    ).bind(auth.userId).all();

    return new Response(JSON.stringify({
      friendIds: (results.results || []).map((r: any) => r.friend_id),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = getAuth(context.request);
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await context.request.json() as { friendId: string };

    await context.env.DB.prepare(
      'INSERT OR IGNORE INTO friends (user_id, friend_id, created_at) VALUES (?, ?, ?)'
    ).bind(auth.userId, body.friendId, new Date().toISOString()).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
```

---

### 8. Add Routes and Navigation

**File: `src/App.tsx`**

```typescript
import Friends from '@/pages/Friends';

// In routes:
<Route path="/friends" element={<Friends />} />
```

**File: `src/components/layout/Sidebar.tsx`** (or navigation)

Add Friends link:
```typescript
{ icon: Users, label: 'Friends', path: '/friends' }
```

---

### 9. Add FriendsProvider to App

**File: `src/main.tsx`** or **`src/App.tsx`**

Wrap app with FriendsProvider:
```typescript
import { FriendsProvider } from '@/contexts/FriendsContext';

// In provider tree:
<FriendsProvider>
  {/* ... app content */}
</FriendsProvider>
```

---

## Database Migration

**File: `migrations/004_friends_table.sql`**

```sql
-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, friend_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id);
```

---

## Testing Checklist

- [ ] Can browse all registered users on Find Users tab
- [ ] Can search users by display name
- [ ] Can add a user as friend
- [ ] Friend appears in My Friends tab
- [ ] Can remove friend from list
- [ ] Leaderboard shows "Friends" filter tab
- [ ] Friends filter shows only friends' scores
- [ ] Friends are highlighted on main leaderboard
- [ ] Clicking user opens their public profile
- [ ] Friend data persists across sessions (localStorage)
- [ ] Empty states show helpful messages
- [ ] Responsive layout works on mobile

# IMPLEMENTATION PROMPT 03: Guild System

## Overview
Build a comprehensive guild (clan) system that allows players to form communities, compete together on guild leaderboards, and participate in guild-exclusive events. This creates strong social bonds and long-term retention.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       GUILD SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GUILD STRUCTURE                                                 │
│  ├── Guild Name & Tag (e.g., "Orange Army" [OA])                │
│  ├── Guild Banner/Emblem                                        │
│  ├── Description                                                │
│  ├── Max 50 Members                                             │
│  └── Roles: Leader → Officers → Members                         │
│                                                                  │
│  GUILD LEADERBOARD                                               │
│  ├── Combined scores from all members                           │
│  ├── Weekly/Monthly competitions                                │
│  ├── Guild XP and Level system                                  │
│  └── Rewards for top guilds                                     │
│                                                                  │
│  GUILD EVENTS                                                    │
│  ├── Guild Wars (guild vs guild)                                │
│  ├── Guild Challenges (collective goals)                        │
│  └── Seasonal Championships                                     │
│                                                                  │
│  SOCIAL FEATURES                                                 │
│  ├── Guild Chat (optional - future)                             │
│  ├── Activity Feed                                              │
│  └── Member Contributions Tracking                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Types and Interfaces

### 1.1 Guild Types
Create `src/types/guild.ts`:

```typescript
export interface Guild {
  id: string;
  name: string;
  tag: string; // 2-4 character tag like [OA], [WJK]
  description: string;
  banner: GuildBanner;
  createdAt: Date;

  // Stats
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalScore: number;
  weeklyScore: number;

  // Members
  memberCount: number;
  maxMembers: number; // Default 50

  // Settings
  isPublic: boolean; // Can anyone join?
  minLevelToJoin: number; // Minimum player level

  // Rankings
  rank: number | null; // Current leaderboard rank
  weeklyRank: number | null;
}

export interface GuildBanner {
  backgroundColor: string;
  pattern: BannerPattern;
  emblem: string; // Emoji or icon
  accentColor: string;
}

export type BannerPattern =
  | 'solid'
  | 'stripes'
  | 'gradient'
  | 'diagonal'
  | 'dots'
  | 'chevron';

export interface GuildMember {
  id: string;
  odecayUserId: string;
  username: string;
  displayName: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
  };
  role: GuildRole;
  joinedAt: Date;

  // Contributions
  weeklyScore: number;
  totalScore: number;
  gamesPlayedThisWeek: number;
  lastActiveAt: Date;
}

export type GuildRole = 'leader' | 'officer' | 'member';

export interface GuildInvite {
  id: string;
  guildId: string;
  guildName: string;
  guildTag: string;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface GuildJoinRequest {
  id: string;
  userId: string;
  username: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
  };
  message: string;
  requestedAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}

export interface GuildActivity {
  id: string;
  type: GuildActivityType;
  userId: string;
  username: string;
  data: Record<string, any>;
  createdAt: Date;
}

export type GuildActivityType =
  | 'member_joined'
  | 'member_left'
  | 'member_promoted'
  | 'member_demoted'
  | 'high_score'
  | 'level_up'
  | 'rank_change'
  | 'challenge_completed';

export interface GuildLeaderboardEntry {
  rank: number;
  guild: {
    id: string;
    name: string;
    tag: string;
    banner: GuildBanner;
    level: number;
  };
  totalScore: number;
  weeklyScore: number;
  memberCount: number;
  topContributor: {
    username: string;
    score: number;
  };
}

// Guild creation/settings
export interface CreateGuildData {
  name: string;
  tag: string;
  description: string;
  banner: GuildBanner;
  isPublic: boolean;
}

export interface GuildSettings {
  isPublic: boolean;
  minLevelToJoin: number;
  description: string;
  banner: GuildBanner;
}

// Constants
export const GUILD_CONSTANTS = {
  MAX_MEMBERS: 50,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 24,
  MIN_TAG_LENGTH: 2,
  MAX_TAG_LENGTH: 4,
  MAX_DESCRIPTION_LENGTH: 200,
  INVITE_EXPIRY_DAYS: 7,
  MAX_OFFICERS: 5,
} as const;

// Guild XP levels
export const GUILD_LEVELS = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 1000 },
  { level: 3, xpRequired: 3000 },
  { level: 4, xpRequired: 6000 },
  { level: 5, xpRequired: 10000 },
  { level: 6, xpRequired: 15000 },
  { level: 7, xpRequired: 22000 },
  { level: 8, xpRequired: 30000 },
  { level: 9, xpRequired: 40000 },
  { level: 10, xpRequired: 55000 },
  // ... continue as needed
];
```

---

## Part 2: Guild Context

### 2.1 Guild Context
Create `src/contexts/GuildContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  Guild,
  GuildMember,
  GuildInvite,
  GuildJoinRequest,
  GuildActivity,
  CreateGuildData,
  GuildSettings,
  GuildLeaderboardEntry
} from '../types/guild';

interface GuildContextType {
  // Current user's guild
  myGuild: Guild | null;
  myGuildMembers: GuildMember[];
  myRole: GuildRole | null;

  // Loading states
  isLoading: boolean;

  // Guild management
  createGuild: (data: CreateGuildData) => Promise<Guild>;
  leaveGuild: () => Promise<void>;
  disbandGuild: () => Promise<void>;
  updateGuildSettings: (settings: GuildSettings) => Promise<void>;

  // Member management
  inviteMember: (userId: string) => Promise<GuildInvite>;
  kickMember: (memberId: string) => Promise<void>;
  promoteMember: (memberId: string) => Promise<void>;
  demoteMember: (memberId: string) => Promise<void>;
  transferLeadership: (memberId: string) => Promise<void>;

  // Join requests
  pendingRequests: GuildJoinRequest[];
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;

  // Invites (for the user)
  myInvites: GuildInvite[];
  acceptInvite: (inviteId: string) => Promise<void>;
  declineInvite: (inviteId: string) => Promise<void>;

  // Public guilds
  searchGuilds: (query: string) => Promise<Guild[]>;
  requestToJoin: (guildId: string, message?: string) => Promise<void>;

  // Activity
  guildActivity: GuildActivity[];

  // Leaderboard
  fetchGuildLeaderboard: (timeframe: 'weekly' | 'all-time') => Promise<GuildLeaderboardEntry[]>;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

export const GuildProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [myGuildMembers, setMyGuildMembers] = useState<GuildMember[]>([]);
  const [myRole, setMyRole] = useState<GuildRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<GuildJoinRequest[]>([]);
  const [myInvites, setMyInvites] = useState<GuildInvite[]>([]);
  const [guildActivity, setGuildActivity] = useState<GuildActivity[]>([]);

  // Fetch user's guild on mount
  useEffect(() => {
    if (user) {
      fetchMyGuild();
      fetchMyInvites();
    } else {
      setMyGuild(null);
      setMyGuildMembers([]);
      setMyRole(null);
      setIsLoading(false);
    }
  }, [user]);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`
  });

  const fetchMyGuild = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/guild/my-guild', {
        headers: getAuthHeader()
      });

      if (response.status === 404) {
        // User not in a guild
        setMyGuild(null);
        setMyGuildMembers([]);
        setMyRole(null);
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch guild');

      const data = await response.json();
      setMyGuild(data.guild);
      setMyGuildMembers(data.members);
      setMyRole(data.myRole);
      setGuildActivity(data.recentActivity || []);

      // If leader/officer, fetch pending requests
      if (data.myRole === 'leader' || data.myRole === 'officer') {
        fetchPendingRequests(data.guild.id);
      }
    } catch (error) {
      console.error('Failed to fetch guild:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async (guildId: string) => {
    try {
      const response = await fetch(`/api/guild/${guildId}/requests`, {
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const fetchMyInvites = async () => {
    try {
      const response = await fetch('/api/guild/invites', {
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setMyInvites(data.invites);
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error);
    }
  };

  // Create a new guild
  const createGuild = async (data: CreateGuildData): Promise<Guild> => {
    const response = await fetch('/api/guild/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create guild');
    }

    const result = await response.json();
    await fetchMyGuild(); // Refresh guild data
    return result.guild;
  };

  // Leave current guild
  const leaveGuild = async () => {
    if (!myGuild) return;

    const response = await fetch(`/api/guild/${myGuild.id}/leave`, {
      method: 'POST',
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error('Failed to leave guild');

    setMyGuild(null);
    setMyGuildMembers([]);
    setMyRole(null);
  };

  // Disband guild (leader only)
  const disbandGuild = async () => {
    if (!myGuild || myRole !== 'leader') return;

    const response = await fetch(`/api/guild/${myGuild.id}/disband`, {
      method: 'POST',
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error('Failed to disband guild');

    setMyGuild(null);
    setMyGuildMembers([]);
    setMyRole(null);
  };

  // Update guild settings
  const updateGuildSettings = async (settings: GuildSettings) => {
    if (!myGuild) return;

    const response = await fetch(`/api/guild/${myGuild.id}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) throw new Error('Failed to update settings');

    await fetchMyGuild();
  };

  // Invite a member
  const inviteMember = async (userId: string): Promise<GuildInvite> => {
    if (!myGuild) throw new Error('Not in a guild');

    const response = await fetch(`/api/guild/${myGuild.id}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) throw new Error('Failed to send invite');

    return (await response.json()).invite;
  };

  // Kick a member
  const kickMember = async (memberId: string) => {
    if (!myGuild) return;

    const response = await fetch(`/api/guild/${myGuild.id}/kick/${memberId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error('Failed to kick member');

    await fetchMyGuild();
  };

  // Promote member to officer
  const promoteMember = async (memberId: string) => {
    if (!myGuild) return;

    const response = await fetch(`/api/guild/${myGuild.id}/promote/${memberId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error('Failed to promote member');

    await fetchMyGuild();
  };

  // Demote officer to member
  const demoteMember = async (memberId: string) => {
    if (!myGuild) return;

    const response = await fetch(`/api/guild/${myGuild.id}/demote/${memberId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error('Failed to demote member');

    await fetchMyGuild();
  };

  // Transfer leadership
  const transferLeadership = async (memberId: string) => {
    if (!myGuild || myRole !== 'leader') return;

    const response = await fetch(`/api/guild/${myGuild.id}/transfer/${memberId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error('Failed to transfer leadership');

    await fetchMyGuild();
  };

  // Accept join request
  const acceptRequest = async (requestId: string) => {
    if (!myGuild) return;

    const response = await fetch(`/api/guild/${myGuild.id}/requests/${requestId}/accept`, {
      method: 'POST',
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error('Failed to accept request');

    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    await fetchMyGuild();
  };

  // Decline join request
  const declineRequest = async (requestId: string) => {
    if (!myGuild) return;

    const response = await fetch(`/api/guild/${myGuild.id}/requests/${requestId}/decline`, {
      method: 'POST',
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error('Failed to decline request');

    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  // Accept invite
  const acceptInvite = async (inviteId: string) => {
    const response = await fetch(`/api/guild/invites/${inviteId}/accept`, {
      method: 'POST',
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error('Failed to accept invite');

    setMyInvites(prev => prev.filter(i => i.id !== inviteId));
    await fetchMyGuild();
  };

  // Decline invite
  const declineInvite = async (inviteId: string) => {
    const response = await fetch(`/api/guild/invites/${inviteId}/decline`, {
      method: 'POST',
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error('Failed to decline invite');

    setMyInvites(prev => prev.filter(i => i.id !== inviteId));
  };

  // Search public guilds
  const searchGuilds = async (query: string): Promise<Guild[]> => {
    const response = await fetch(`/api/guild/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error('Search failed');

    return (await response.json()).guilds;
  };

  // Request to join a guild
  const requestToJoin = async (guildId: string, message?: string) => {
    const response = await fetch(`/api/guild/${guildId}/request-join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error('Failed to send join request');
  };

  // Fetch guild leaderboard
  const fetchGuildLeaderboard = async (
    timeframe: 'weekly' | 'all-time'
  ): Promise<GuildLeaderboardEntry[]> => {
    const response = await fetch(`/api/guild/leaderboard?timeframe=${timeframe}`, {
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error('Failed to fetch guild leaderboard');

    return (await response.json()).entries;
  };

  return (
    <GuildContext.Provider
      value={{
        myGuild,
        myGuildMembers,
        myRole,
        isLoading,
        createGuild,
        leaveGuild,
        disbandGuild,
        updateGuildSettings,
        inviteMember,
        kickMember,
        promoteMember,
        demoteMember,
        transferLeadership,
        pendingRequests,
        acceptRequest,
        declineRequest,
        myInvites,
        acceptInvite,
        declineInvite,
        searchGuilds,
        requestToJoin,
        guildActivity,
        fetchGuildLeaderboard
      }}
    >
      {children}
    </GuildContext.Provider>
  );
};

export const useGuild = () => {
  const context = useContext(GuildContext);
  if (!context) {
    throw new Error('useGuild must be used within GuildProvider');
  }
  return context;
};
```

---

## Part 3: Guild UI Components

### 3.1 Guild Card Component
Create `src/components/Guild/GuildCard.tsx`:

```typescript
import React from 'react';
import { Guild, GuildBanner } from '../../types/guild';
import './Guild.css';

interface GuildCardProps {
  guild: Guild;
  onClick?: () => void;
  showStats?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const GuildCard: React.FC<GuildCardProps> = ({
  guild,
  onClick,
  showStats = true,
  size = 'medium'
}) => {
  return (
    <div
      className={`guild-card guild-card-${size} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <GuildBannerDisplay banner={guild.banner} size={size} />

      <div className="guild-card-content">
        <div className="guild-card-header">
          <span className="guild-tag">[{guild.tag}]</span>
          <h3 className="guild-name">{guild.name}</h3>
        </div>

        {showStats && (
          <div className="guild-card-stats">
            <div className="stat">
              <span className="stat-value">{guild.memberCount}</span>
              <span className="stat-label">Members</span>
            </div>
            <div className="stat">
              <span className="stat-value">Lv.{guild.level}</span>
              <span className="stat-label">Level</span>
            </div>
            {guild.rank && (
              <div className="stat">
                <span className="stat-value">#{guild.rank}</span>
                <span className="stat-label">Rank</span>
              </div>
            )}
          </div>
        )}

        {guild.description && size !== 'small' && (
          <p className="guild-description">{guild.description}</p>
        )}
      </div>
    </div>
  );
};

// Guild Banner Display
export const GuildBannerDisplay: React.FC<{
  banner: GuildBanner;
  size: 'small' | 'medium' | 'large';
}> = ({ banner, size }) => {
  const getPatternStyle = (): React.CSSProperties => {
    const { backgroundColor, pattern, accentColor } = banner;

    switch (pattern) {
      case 'stripes':
        return {
          background: `repeating-linear-gradient(
            45deg,
            ${backgroundColor},
            ${backgroundColor} 10px,
            ${accentColor} 10px,
            ${accentColor} 20px
          )`
        };
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${backgroundColor}, ${accentColor})`
        };
      case 'diagonal':
        return {
          background: `linear-gradient(135deg, ${backgroundColor} 50%, ${accentColor} 50%)`
        };
      case 'dots':
        return {
          background: `radial-gradient(circle, ${accentColor} 2px, ${backgroundColor} 2px)`,
          backgroundSize: '10px 10px'
        };
      case 'chevron':
        return {
          background: `linear-gradient(135deg, ${accentColor} 25%, transparent 25%) -50px 0,
                       linear-gradient(225deg, ${accentColor} 25%, transparent 25%) -50px 0,
                       linear-gradient(315deg, ${accentColor} 25%, transparent 25%),
                       linear-gradient(45deg, ${accentColor} 25%, transparent 25%)`,
          backgroundSize: '40px 40px',
          backgroundColor: backgroundColor
        };
      default:
        return { backgroundColor };
    }
  };

  return (
    <div className={`guild-banner guild-banner-${size}`} style={getPatternStyle()}>
      <span className="guild-emblem">{banner.emblem}</span>
    </div>
  );
};
```

### 3.2 Create Guild Modal
Create `src/components/Guild/CreateGuildModal.tsx`:

```typescript
import React, { useState } from 'react';
import {
  IonModal,
  IonButton,
  IonInput,
  IonTextarea,
  IonToggle,
  IonSpinner
} from '@ionic/react';
import { useGuild } from '../../contexts/GuildContext';
import { GuildBannerDisplay } from './GuildCard';
import { GuildBanner, BannerPattern, GUILD_CONSTANTS } from '../../types/guild';
import './Guild.css';

interface CreateGuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BANNER_COLORS = [
  '#FF6B35', '#FF8C42', '#FFD93D', '#6BCB77',
  '#4D96FF', '#9B59B6', '#E74C3C', '#1ABC9C',
  '#34495E', '#F39C12', '#E91E63', '#00BCD4'
];

const BANNER_PATTERNS: BannerPattern[] = [
  'solid', 'stripes', 'gradient', 'diagonal', 'dots', 'chevron'
];

const GUILD_EMBLEMS = [
  '🍊', '⚔️', '🛡️', '👑', '🔥', '⚡', '💎', '🌟',
  '🦁', '🐉', '🦅', '🐺', '🎯', '🏆', '💪', '🎮'
];

export const CreateGuildModal: React.FC<CreateGuildModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createGuild } = useGuild();

  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [banner, setBanner] = useState<GuildBanner>({
    backgroundColor: '#FF6B35',
    pattern: 'gradient',
    emblem: '🍊',
    accentColor: '#FFD93D'
  });

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<'info' | 'banner'>('info');

  const validateInput = (): boolean => {
    if (name.length < GUILD_CONSTANTS.MIN_NAME_LENGTH) {
      setError(`Guild name must be at least ${GUILD_CONSTANTS.MIN_NAME_LENGTH} characters`);
      return false;
    }
    if (name.length > GUILD_CONSTANTS.MAX_NAME_LENGTH) {
      setError(`Guild name must be ${GUILD_CONSTANTS.MAX_NAME_LENGTH} characters or less`);
      return false;
    }
    if (tag.length < GUILD_CONSTANTS.MIN_TAG_LENGTH || tag.length > GUILD_CONSTANTS.MAX_TAG_LENGTH) {
      setError(`Tag must be ${GUILD_CONSTANTS.MIN_TAG_LENGTH}-${GUILD_CONSTANTS.MAX_TAG_LENGTH} characters`);
      return false;
    }
    if (!/^[A-Z0-9]+$/.test(tag)) {
      setError('Tag must contain only uppercase letters and numbers');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    setError(null);

    if (!validateInput()) return;

    setIsCreating(true);
    try {
      await createGuild({
        name,
        tag: tag.toUpperCase(),
        description,
        banner,
        isPublic
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create guild');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="create-guild-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{step === 'info' ? 'Create Your Guild' : 'Customize Banner'}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {step === 'info' ? (
          <>
            {/* Preview */}
            <div className="guild-preview">
              <GuildBannerDisplay banner={banner} size="large" />
              <div className="preview-info">
                <span className="preview-tag">[{tag || '???'}]</span>
                <span className="preview-name">{name || 'Your Guild'}</span>
              </div>
            </div>

            {/* Form */}
            <div className="form-group">
              <label>Guild Name</label>
              <IonInput
                value={name}
                onIonInput={(e) => setName(e.detail.value || '')}
                placeholder="Enter guild name..."
                maxlength={GUILD_CONSTANTS.MAX_NAME_LENGTH}
              />
              <span className="char-count">{name.length}/{GUILD_CONSTANTS.MAX_NAME_LENGTH}</span>
            </div>

            <div className="form-group">
              <label>Guild Tag (2-4 characters)</label>
              <IonInput
                value={tag}
                onIonInput={(e) => setTag((e.detail.value || '').toUpperCase())}
                placeholder="e.g., OA, WJK"
                maxlength={GUILD_CONSTANTS.MAX_TAG_LENGTH}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label>Description (optional)</label>
              <IonTextarea
                value={description}
                onIonInput={(e) => setDescription(e.detail.value || '')}
                placeholder="Tell others about your guild..."
                maxlength={GUILD_CONSTANTS.MAX_DESCRIPTION_LENGTH}
                rows={3}
              />
            </div>

            <div className="form-group toggle-group">
              <label>
                <span>Public Guild</span>
                <span className="toggle-description">Anyone can request to join</span>
              </label>
              <IonToggle
                checked={isPublic}
                onIonChange={(e) => setIsPublic(e.detail.checked)}
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="modal-actions">
              <IonButton fill="outline" onClick={() => setStep('banner')}>
                Customize Banner
              </IonButton>
              <IonButton onClick={handleCreate} disabled={isCreating || !name || !tag}>
                {isCreating ? <IonSpinner name="crescent" /> : 'Create Guild'}
              </IonButton>
            </div>
          </>
        ) : (
          <>
            {/* Banner Customizer */}
            <div className="banner-preview-large">
              <GuildBannerDisplay banner={banner} size="large" />
            </div>

            <div className="banner-section">
              <label>Emblem</label>
              <div className="emblem-grid">
                {GUILD_EMBLEMS.map((emblem) => (
                  <button
                    key={emblem}
                    className={`emblem-option ${banner.emblem === emblem ? 'selected' : ''}`}
                    onClick={() => setBanner({ ...banner, emblem })}
                  >
                    {emblem}
                  </button>
                ))}
              </div>
            </div>

            <div className="banner-section">
              <label>Background Color</label>
              <div className="color-grid">
                {BANNER_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${banner.backgroundColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setBanner({ ...banner, backgroundColor: color })}
                  />
                ))}
              </div>
            </div>

            <div className="banner-section">
              <label>Accent Color</label>
              <div className="color-grid">
                {BANNER_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${banner.accentColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setBanner({ ...banner, accentColor: color })}
                  />
                ))}
              </div>
            </div>

            <div className="banner-section">
              <label>Pattern</label>
              <div className="pattern-grid">
                {BANNER_PATTERNS.map((pattern) => (
                  <button
                    key={pattern}
                    className={`pattern-option ${banner.pattern === pattern ? 'selected' : ''}`}
                    onClick={() => setBanner({ ...banner, pattern })}
                  >
                    {pattern}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <IonButton fill="outline" onClick={() => setStep('info')}>
                Back
              </IonButton>
              <IonButton onClick={() => setStep('info')}>
                Done
              </IonButton>
            </div>
          </>
        )}
      </div>
    </IonModal>
  );
};
```

### 3.3 Guild Page Component
Create `src/components/Guild/GuildPage.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonSpinner
} from '@ionic/react';
import { useGuild } from '../../contexts/GuildContext';
import { GuildCard, GuildBannerDisplay } from './GuildCard';
import { GuildMemberList } from './GuildMemberList';
import { GuildLeaderboard } from './GuildLeaderboard';
import { GuildActivity } from './GuildActivity';
import { CreateGuildModal } from './CreateGuildModal';
import { GuildSearch } from './GuildSearch';
import './Guild.css';

export const GuildPage: React.FC = () => {
  const { myGuild, myGuildMembers, myRole, isLoading, myInvites } = useGuild();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'leaderboard'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  if (isLoading) {
    return (
      <IonPage>
        <IonContent className="guild-page">
          <div className="loading-state">
            <IonSpinner name="crescent" />
            <p>Loading guild...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // User is not in a guild
  if (!myGuild) {
    return (
      <IonPage>
        <IonContent className="guild-page">
          <div className="no-guild-state">
            <div className="no-guild-icon">🏰</div>
            <h2>Join a Guild</h2>
            <p>Team up with other players to compete on the guild leaderboard and earn exclusive rewards!</p>

            {/* Pending invites */}
            {myInvites.length > 0 && (
              <div className="pending-invites">
                <h3>You have {myInvites.length} pending invite(s)</h3>
                {myInvites.map((invite) => (
                  <GuildInviteCard key={invite.id} invite={invite} />
                ))}
              </div>
            )}

            <div className="no-guild-actions">
              <IonButton onClick={() => setShowCreateModal(true)}>
                Create a Guild
              </IonButton>
              <IonButton fill="outline" onClick={() => setShowSearchModal(true)}>
                Find a Guild
              </IonButton>
            </div>
          </div>

          <CreateGuildModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
          />

          <GuildSearch
            isOpen={showSearchModal}
            onClose={() => setShowSearchModal(false)}
          />
        </IonContent>
      </IonPage>
    );
  }

  // User is in a guild
  return (
    <IonPage>
      <IonContent className="guild-page">
        {/* Guild Header */}
        <div className="guild-header">
          <GuildBannerDisplay banner={myGuild.banner} size="large" />
          <div className="guild-header-info">
            <div className="guild-title">
              <span className="guild-tag">[{myGuild.tag}]</span>
              <h1 className="guild-name">{myGuild.name}</h1>
            </div>
            <div className="guild-meta">
              <span className="guild-level">Level {myGuild.level}</span>
              <span className="guild-members">{myGuild.memberCount}/{myGuild.maxMembers} Members</span>
              {myGuild.rank && <span className="guild-rank">Rank #{myGuild.rank}</span>}
            </div>
            {myGuild.description && (
              <p className="guild-description">{myGuild.description}</p>
            )}
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="guild-xp-bar">
          <div className="xp-label">
            <span>Guild XP</span>
            <span>{myGuild.xp.toLocaleString()} / {myGuild.xpToNextLevel.toLocaleString()}</span>
          </div>
          <div className="xp-track">
            <div
              className="xp-fill"
              style={{ width: `${(myGuild.xp / myGuild.xpToNextLevel) * 100}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <IonSegment
          value={activeTab}
          onIonChange={(e) => setActiveTab(e.detail.value as any)}
          className="guild-tabs"
        >
          <IonSegmentButton value="overview">
            <IonLabel>Overview</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="members">
            <IonLabel>Members</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="leaderboard">
            <IonLabel>Leaderboard</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Tab Content */}
        <div className="guild-tab-content">
          {activeTab === 'overview' && (
            <div className="guild-overview">
              <GuildActivity />

              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stat-card">
                  <span className="stat-icon">🏆</span>
                  <span className="stat-value">{myGuild.totalScore.toLocaleString()}</span>
                  <span className="stat-label">Total Score</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">📅</span>
                  <span className="stat-value">{myGuild.weeklyScore.toLocaleString()}</span>
                  <span className="stat-label">This Week</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <GuildMemberList
              members={myGuildMembers}
              currentUserRole={myRole}
            />
          )}

          {activeTab === 'leaderboard' && (
            <GuildLeaderboard myGuildId={myGuild.id} />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

// Guild Invite Card component
const GuildInviteCard: React.FC<{ invite: GuildInvite }> = ({ invite }) => {
  const { acceptInvite, declineInvite } = useGuild();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await acceptInvite(invite.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await declineInvite(invite.id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="invite-card">
      <div className="invite-info">
        <span className="invite-guild">[{invite.guildTag}] {invite.guildName}</span>
        <span className="invite-from">Invited by {invite.invitedBy}</span>
      </div>
      <div className="invite-actions">
        <IonButton size="small" onClick={handleAccept} disabled={isProcessing}>
          Accept
        </IonButton>
        <IonButton size="small" fill="outline" onClick={handleDecline} disabled={isProcessing}>
          Decline
        </IonButton>
      </div>
    </div>
  );
};
```

### 3.4 Guild Member List
Create `src/components/Guild/GuildMemberList.tsx`:

```typescript
import React, { useState } from 'react';
import { IonButton, IonActionSheet } from '@ionic/react';
import { useGuild } from '../../contexts/GuildContext';
import { Avatar } from '../Avatar/Avatar';
import { GuildMember, GuildRole } from '../../types/guild';
import './Guild.css';

interface GuildMemberListProps {
  members: GuildMember[];
  currentUserRole: GuildRole | null;
}

export const GuildMemberList: React.FC<GuildMemberListProps> = ({
  members,
  currentUserRole
}) => {
  const { kickMember, promoteMember, demoteMember, transferLeadership } = useGuild();
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const canManageMembers = currentUserRole === 'leader' || currentUserRole === 'officer';

  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder: Record<GuildRole, number> = { leader: 0, officer: 1, member: 2 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  const getRoleBadge = (role: GuildRole) => {
    switch (role) {
      case 'leader':
        return { icon: '👑', label: 'Leader', className: 'role-leader' };
      case 'officer':
        return { icon: '⭐', label: 'Officer', className: 'role-officer' };
      default:
        return { icon: '', label: 'Member', className: 'role-member' };
    }
  };

  const getActionSheetButtons = () => {
    if (!selectedMember || !currentUserRole) return [];

    const buttons: any[] = [];
    const isLeader = currentUserRole === 'leader';
    const isOfficer = currentUserRole === 'officer';
    const targetIsLeader = selectedMember.role === 'leader';
    const targetIsOfficer = selectedMember.role === 'officer';

    // Leader can do everything
    if (isLeader && !targetIsLeader) {
      if (!targetIsOfficer) {
        buttons.push({
          text: 'Promote to Officer',
          handler: () => promoteMember(selectedMember.id)
        });
      } else {
        buttons.push({
          text: 'Demote to Member',
          handler: () => demoteMember(selectedMember.id)
        });
      }

      buttons.push({
        text: 'Transfer Leadership',
        handler: () => transferLeadership(selectedMember.id)
      });

      buttons.push({
        text: 'Kick from Guild',
        role: 'destructive',
        handler: () => kickMember(selectedMember.id)
      });
    }

    // Officers can only kick members (not other officers)
    if (isOfficer && !targetIsLeader && !targetIsOfficer) {
      buttons.push({
        text: 'Kick from Guild',
        role: 'destructive',
        handler: () => kickMember(selectedMember.id)
      });
    }

    buttons.push({
      text: 'Cancel',
      role: 'cancel'
    });

    return buttons;
  };

  return (
    <div className="member-list">
      <div className="member-list-header">
        <h3>Guild Members ({members.length})</h3>
      </div>

      <div className="member-grid">
        {sortedMembers.map((member) => {
          const roleBadge = getRoleBadge(member.role);

          return (
            <div
              key={member.id}
              className={`member-card ${roleBadge.className}`}
              onClick={() => {
                if (canManageMembers && member.role !== currentUserRole) {
                  setSelectedMember(member);
                  setShowActionSheet(true);
                }
              }}
            >
              <Avatar
                type={member.avatar.type}
                value={member.avatar.value}
                size="medium"
                isNftHolder={member.avatar.type === 'nft'}
              />

              <div className="member-info">
                <span className="member-name">
                  {roleBadge.icon && <span className="role-icon">{roleBadge.icon}</span>}
                  {member.username}
                </span>
                <span className="member-contribution">
                  {member.weeklyScore.toLocaleString()} pts this week
                </span>
              </div>

              {canManageMembers && member.role !== 'leader' && (
                <button className="member-menu-button">⋮</button>
              )}
            </div>
          );
        })}
      </div>

      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => {
          setShowActionSheet(false);
          setSelectedMember(null);
        }}
        header={selectedMember?.username}
        buttons={getActionSheetButtons()}
      />
    </div>
  );
};
```

### 3.5 Guild Leaderboard
Create `src/components/Guild/GuildLeaderboard.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonSpinner } from '@ionic/react';
import { useGuild } from '../../contexts/GuildContext';
import { GuildBannerDisplay } from './GuildCard';
import { GuildLeaderboardEntry } from '../../types/guild';
import './Guild.css';

interface GuildLeaderboardProps {
  myGuildId?: string;
}

export const GuildLeaderboard: React.FC<GuildLeaderboardProps> = ({ myGuildId }) => {
  const { fetchGuildLeaderboard } = useGuild();
  const [timeframe, setTimeframe] = useState<'weekly' | 'all-time'>('weekly');
  const [entries, setEntries] = useState<GuildLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGuildLeaderboard(timeframe);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load guild leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="guild-leaderboard">
      <IonSegment
        value={timeframe}
        onIonChange={(e) => setTimeframe(e.detail.value as any)}
        className="timeframe-selector"
      >
        <IonSegmentButton value="weekly">
          <IonLabel>This Week</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="all-time">
          <IonLabel>All Time</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      {isLoading ? (
        <div className="loading-state">
          <IonSpinner name="crescent" />
        </div>
      ) : (
        <div className="guild-leaderboard-list">
          {entries.map((entry) => (
            <div
              key={entry.guild.id}
              className={`guild-leaderboard-row ${entry.guild.id === myGuildId ? 'is-my-guild' : ''}`}
            >
              <span className="guild-rank">{getRankDisplay(entry.rank)}</span>

              <GuildBannerDisplay banner={entry.guild.banner} size="small" />

              <div className="guild-info">
                <span className="guild-name-tag">
                  <span className="tag">[{entry.guild.tag}]</span>
                  <span className="name">{entry.guild.name}</span>
                </span>
                <span className="guild-meta">
                  Lv.{entry.guild.level} • {entry.memberCount} members
                </span>
              </div>

              <div className="guild-score">
                <span className="score-value">
                  {(timeframe === 'weekly' ? entry.weeklyScore : entry.totalScore).toLocaleString()}
                </span>
                <span className="score-label">pts</span>
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="empty-state">
              <p>No guild rankings yet for this period.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

---

## Part 4: Guild Styles
Create `src/components/Guild/Guild.css`:

```css
/* Guild Page */
.guild-page {
  --background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
}

/* No Guild State */
.no-guild-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  min-height: 60vh;
}

.no-guild-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.no-guild-state h2 {
  color: #fff;
  margin: 0 0 12px 0;
}

.no-guild-state p {
  color: rgba(255, 255, 255, 0.7);
  max-width: 300px;
  margin: 0 0 24px 0;
}

.no-guild-actions {
  display: flex;
  gap: 12px;
}

/* Guild Card */
.guild-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.guild-card.clickable {
  cursor: pointer;
}

.guild-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.guild-card-content {
  padding: 16px;
}

.guild-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.guild-tag {
  color: #FF8C32;
  font-weight: 700;
  font-size: 0.9rem;
}

.guild-name {
  color: #fff;
  font-weight: 600;
  margin: 0;
  font-size: 1.1rem;
}

.guild-card-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
}

/* Guild Banner */
.guild-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.guild-banner-small {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.guild-banner-medium {
  width: 80px;
  height: 80px;
  border-radius: 12px;
}

.guild-banner-large {
  width: 100%;
  height: 120px;
  border-radius: 0;
}

.guild-emblem {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.guild-banner-small .guild-emblem {
  font-size: 1.2rem;
}

.guild-banner-medium .guild-emblem {
  font-size: 2rem;
}

.guild-banner-large .guild-emblem {
  font-size: 3rem;
}

/* Guild Header */
.guild-header {
  position: relative;
}

.guild-header-info {
  padding: 20px;
  background: linear-gradient(to top, rgba(15, 15, 26, 0.95), transparent);
  margin-top: -40px;
  position: relative;
}

.guild-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.guild-header .guild-tag {
  font-size: 1.1rem;
}

.guild-header .guild-name {
  font-size: 1.5rem;
}

.guild-meta {
  display: flex;
  gap: 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.guild-level {
  color: #FFD700;
}

.guild-rank {
  color: #FF8C32;
}

.guild-description {
  color: rgba(255, 255, 255, 0.6);
  margin: 12px 0 0 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* XP Bar */
.guild-xp-bar {
  padding: 0 20px 20px;
}

.xp-label {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  margin-bottom: 6px;
}

.xp-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.xp-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF8C32, #FFD700);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Guild Tabs */
.guild-tabs {
  --background: rgba(255, 255, 255, 0.05);
  margin: 0 20px;
  border-radius: 12px;
}

.guild-tabs ion-segment-button {
  --color: rgba(255, 255, 255, 0.6);
  --color-checked: #fff;
  --indicator-color: rgba(255, 140, 50, 0.8);
}

.guild-tab-content {
  padding: 20px;
}

/* Member List */
.member-list-header {
  margin-bottom: 16px;
}

.member-list-header h3 {
  color: #fff;
  margin: 0;
  font-size: 1.1rem;
}

.member-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.member-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.member-card.role-leader {
  border-color: rgba(255, 215, 0, 0.3);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent);
}

.member-card.role-officer {
  border-color: rgba(255, 140, 50, 0.2);
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-name {
  color: #fff;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.role-icon {
  font-size: 0.9rem;
}

.member-contribution {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.member-menu-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
}

/* Guild Leaderboard */
.guild-leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.guild-leaderboard-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid transparent;
}

.guild-leaderboard-row.is-my-guild {
  border-color: rgba(255, 140, 50, 0.3);
  background: linear-gradient(135deg, rgba(255, 140, 50, 0.1), transparent);
}

.guild-leaderboard-row .guild-rank {
  min-width: 40px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.guild-leaderboard-row .guild-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.guild-name-tag {
  display: flex;
  align-items: center;
  gap: 6px;
}

.guild-name-tag .tag {
  color: #FF8C32;
  font-weight: 600;
  font-size: 0.85rem;
}

.guild-name-tag .name {
  color: #fff;
  font-weight: 500;
}

.guild-leaderboard-row .guild-meta {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
}

.guild-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.score-value {
  color: #FF8C32;
  font-weight: 700;
  font-size: 1rem;
}

.score-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.7rem;
}

/* Create Guild Modal */
.create-guild-modal {
  --background: rgba(20, 20, 35, 0.98);
}

.modal-content {
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  color: #fff;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5rem;
  cursor: pointer;
}

.guild-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.preview-info {
  margin-top: 12px;
  text-align: center;
}

.preview-tag {
  color: #FF8C32;
  font-weight: 700;
  margin-right: 8px;
}

.preview-name {
  color: #fff;
  font-weight: 600;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-group ion-input,
.form-group ion-textarea {
  --background: rgba(255, 255, 255, 0.1);
  --color: #fff;
  --placeholder-color: rgba(255, 255, 255, 0.4);
  --padding-start: 16px;
  --padding-end: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.char-count {
  display: block;
  text-align: right;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  margin-top: 4px;
}

.toggle-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-group label {
  margin-bottom: 0;
}

.toggle-description {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions ion-button {
  flex: 1;
}

/* Banner Customizer */
.banner-preview-large {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.banner-section {
  margin-bottom: 20px;
}

.banner-section label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.emblem-grid,
.color-grid,
.pattern-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emblem-option {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.emblem-option.selected {
  border-color: #FF8C32;
  background: rgba(255, 140, 50, 0.2);
}

.color-option {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-option.selected {
  border-color: #fff;
  transform: scale(1.1);
}

.pattern-option {
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  text-transform: capitalize;
}

.pattern-option.selected {
  border-color: #FF8C32;
  background: rgba(255, 140, 50, 0.2);
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-card .stat-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.stat-card .stat-value {
  color: #fff;
  font-weight: 700;
  font-size: 1.3rem;
}

.stat-card .stat-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  margin-top: 4px;
}

/* Pending Invites */
.pending-invites {
  width: 100%;
  max-width: 400px;
  margin-bottom: 24px;
}

.pending-invites h3 {
  color: #fff;
  font-size: 1rem;
  margin-bottom: 12px;
}

.invite-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 8px;
}

.invite-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.invite-guild {
  color: #fff;
  font-weight: 500;
}

.invite-from {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.invite-actions {
  display: flex;
  gap: 8px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.loading-state p {
  color: rgba(255, 255, 255, 0.6);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);
}
```

---

## Part 5: Backend API Endpoints (Reference)

```typescript
// Guild Management
POST   /api/guild/create                    // Create a new guild
GET    /api/guild/my-guild                  // Get current user's guild
PUT    /api/guild/:id/settings              // Update guild settings
POST   /api/guild/:id/leave                 // Leave guild
POST   /api/guild/:id/disband               // Disband guild (leader only)

// Member Management
POST   /api/guild/:id/invite                // Send invite to user
GET    /api/guild/:id/requests              // Get pending join requests
POST   /api/guild/:id/requests/:rid/accept  // Accept join request
POST   /api/guild/:id/requests/:rid/decline // Decline join request
POST   /api/guild/:id/kick/:memberId        // Kick member
POST   /api/guild/:id/promote/:memberId     // Promote to officer
POST   /api/guild/:id/demote/:memberId      // Demote to member
POST   /api/guild/:id/transfer/:memberId    // Transfer leadership

// Invites (for users)
GET    /api/guild/invites                   // Get user's pending invites
POST   /api/guild/invites/:id/accept        // Accept invite
POST   /api/guild/invites/:id/decline       // Decline invite

// Discovery
GET    /api/guild/search                    // Search public guilds
POST   /api/guild/:id/request-join          // Request to join guild

// Leaderboard
GET    /api/guild/leaderboard               // Get guild rankings
```

---

## Implementation Checklist

- [ ] Create all guild types and interfaces
- [ ] Implement GuildContext with full state management
- [ ] Build GuildCard component with banner display
- [ ] Create CreateGuildModal with banner customizer
- [ ] Build GuildPage with tabs (overview, members, leaderboard)
- [ ] Implement GuildMemberList with role management
- [ ] Create GuildLeaderboard component
- [ ] Build GuildSearch for finding public guilds
- [ ] Style all components with premium theme
- [ ] Implement all backend API endpoints
- [ ] Set up database tables for guilds
- [ ] Integrate guild XP earning from member gameplay
- [ ] Test guild creation, joining, and leaving
- [ ] Test member management (promote, demote, kick)
- [ ] Test guild leaderboard updates
- [ ] Add guild-related achievements/badges

---

## Future Enhancements (Not in this prompt)

1. **Guild Chat**: Real-time messaging between guild members
2. **Guild Wars**: Scheduled competitions between guilds
3. **Guild Challenges**: Weekly collective goals
4. **Guild Perks**: Unlockable bonuses at higher guild levels
5. **Guild Treasury**: Shared currency pool for rewards

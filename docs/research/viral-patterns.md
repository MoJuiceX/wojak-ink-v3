# Viral Patterns

> Patterns to drive organic growth through sharing and social mechanics

---

## Overview

Viral growth happens when players naturally want to share the game. The best viral loops:
1. **Provide value to the sharer** (bragging, challenging)
2. **Provide value to the receiver** (entertainment, challenge)
3. **Are frictionless** (one tap to share)
4. **Create curiosity** (what's this game?)

---

## Pattern: Score Screenshot Sharing

**Category:** Viral
**Impact:** High
**Effort:** Low

### Problem
Players achieve high scores but have no way to show off.

### Solution
Generate beautiful, shareable screenshots with score overlays.

### Implementation

```typescript
interface ShareImage {
  score: number;
  rank?: string;
  playerName?: string;
  gameplayScreenshot: string;
  brandWatermark: boolean;
}

const generateShareImage = async (
  canvas: HTMLCanvasElement,
  score: number,
  options?: {
    playerName?: string;
    bestScore?: number;
    rank?: number;
  }
): Promise<string> => {
  const ctx = canvas.getContext('2d')!;
  const width = canvas.width;
  const height = canvas.height;

  // Darken edges for text visibility
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width * 0.7
  );
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Score (big, center)
  ctx.save();
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 10;
  ctx.fillText(score.toString(), width / 2, height / 2);

  ctx.font = '24px Arial';
  ctx.fillText('PIPES', width / 2, height / 2 + 40);
  ctx.restore();

  // Personal best indicator
  if (options?.bestScore && score >= options.bestScore) {
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('🏆 NEW BEST!', width / 2, height / 2 - 60);
  }

  // Challenge text
  ctx.font = '20px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Can you beat my score?', width / 2, height - 80);

  // Branding
  ctx.font = '16px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('🍊 Flappy Orange @ wojak.ink', width / 2, height - 30);

  return canvas.toDataURL('image/png');
};

const shareScore = async (imageDataUrl: string, score: number): Promise<void> => {
  const shareData = {
    title: 'Flappy Orange',
    text: `I scored ${score} in Flappy Orange! 🍊 Can you beat me?`,
    url: `https://wojak.ink/games/flappy-orange?challenge=${score}`,
  };

  // Try native share first
  if (navigator.share && navigator.canShare) {
    try {
      // Convert data URL to blob for sharing
      const blob = await (await fetch(imageDataUrl)).blob();
      const file = new File([blob], 'score.png', { type: 'image/png' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          ...shareData,
          files: [file],
        });
        return;
      }
    } catch (e) {
      console.log('Native share failed, falling back');
    }
  }

  // Fallback: copy link to clipboard
  await navigator.clipboard.writeText(shareData.url);
  showToast('Link copied to clipboard!');
};
```

### Share Image Best Practices
- Include game branding (watermark)
- Show score prominently
- Add call-to-action ("Can you beat this?")
- Make it visually appealing (not just text)
- Include the URL or QR code

---

## Pattern: Challenge Links

**Category:** Viral
**Impact:** Very High
**Effort:** Medium

### Problem
Sharing just a score isn't compelling enough.

### Solution
Let players challenge friends to beat their specific score.

### Implementation

```typescript
interface Challenge {
  creatorId: string;
  creatorName: string;
  targetScore: number;
  createdAt: Date;
  expiresAt: Date;
  beatCount: number;
}

// Generate challenge link
const createChallengeLink = (score: number, playerName: string): string => {
  const params = new URLSearchParams({
    c: score.toString(),           // Challenge score
    n: btoa(playerName),           // Creator name (base64)
    t: Date.now().toString(36),    // Timestamp
  });

  return `https://wojak.ink/games/flappy-orange?${params.toString()}`;
};

// Parse challenge from URL
const parseChallenge = (url: string): Challenge | null => {
  const params = new URLSearchParams(new URL(url).search);

  const score = params.get('c');
  const name = params.get('n');
  const timestamp = params.get('t');

  if (!score || !name) return null;

  return {
    creatorId: 'anonymous',
    creatorName: atob(name),
    targetScore: parseInt(score, 10),
    createdAt: new Date(parseInt(timestamp || '0', 36)),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    beatCount: 0,
  };
};

// UI: Show challenge toast on game load
const showChallengeToast = (challenge: Challenge): void => {
  const toast = document.createElement('div');
  toast.className = 'challenge-toast';
  toast.innerHTML = `
    <div class="challenge-header">🎯 CHALLENGE</div>
    <div class="challenge-text">
      <strong>${challenge.creatorName}</strong> challenges you to beat
      <strong>${challenge.targetScore}</strong> pipes!
    </div>
    <button class="accept-btn">ACCEPT CHALLENGE</button>
  `;
  document.body.appendChild(toast);
};

// Show target during gameplay
const drawChallengeTarget = (
  ctx: CanvasRenderingContext2D,
  currentScore: number,
  targetScore: number
): void => {
  const remaining = targetScore - currentScore;

  ctx.save();
  ctx.font = '16px Arial';
  ctx.textAlign = 'right';
  ctx.fillStyle = remaining > 0 ? '#FFFFFF' : '#00FF00';
  ctx.fillText(
    remaining > 0 ? `${remaining} to beat` : '🏆 CHALLENGE BEATEN!',
    ctx.canvas.width - 20,
    30
  );
  ctx.restore();
};
```

### Challenge UX Flow
1. Player finishes game with good score
2. "Challenge a friend" button appears
3. Link generated and shared (text/social/copy)
4. Friend opens link, sees challenge toast
5. During gameplay, target score shown
6. If beaten: celebration + share option

---

## Pattern: Leaderboards

**Category:** Viral
**Impact:** Medium
**Effort:** Medium

### Problem
Players don't know how they compare to others.

### Solution
Multiple leaderboard types for different player motivations.

### Implementation

```typescript
interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  timestamp: Date;
  avatar?: string;
}

type LeaderboardType =
  | 'global_alltime'   // All-time best
  | 'global_today'     // Today's best
  | 'global_week'      // This week's best
  | 'friends'          // Friends only
  | 'near_me';         // Ranks around player

const LEADERBOARD_LIMITS = {
  global_alltime: 100,
  global_today: 50,
  global_week: 50,
  friends: 50,
  near_me: 21, // 10 above, player, 10 below
};

// Show "almost on leaderboard" motivation
const getLeaderboardStatus = (
  score: number,
  leaderboard: LeaderboardEntry[]
): string | null => {
  const lowestRanked = leaderboard[leaderboard.length - 1];

  if (score > lowestRanked.score) {
    const rank = leaderboard.findIndex(e => score > e.score) + 1;
    return `🎉 You're #${rank} on the leaderboard!`;
  }

  const gap = lowestRanked.score - score;
  if (gap <= 5) {
    return `Just ${gap} more to reach the leaderboard!`;
  }

  return null;
};
```

### Leaderboard Best Practices
- **Daily/Weekly resets:** Give new players a chance
- **"Near me" view:** Show players ranked around you
- **Friend leaderboards:** More motivating than global
- **Highlight player's row:** Make it easy to find yourself
- **Show improvement:** "+5 ranks since yesterday"

---

## Pattern: Replay/Highlight Sharing

**Category:** Viral
**Impact:** Very High
**Effort:** High

### Problem
Screenshots don't capture the excitement.

### Solution
Auto-record highlights and let players share video clips.

### Implementation Approach

```typescript
interface GameplayRecorder {
  frames: ImageData[];
  events: GameEvent[];
  isRecording: boolean;
  maxFrames: number;
}

// Record last N seconds of gameplay
const createRecorder = (fps: number = 30, seconds: number = 10): GameplayRecorder => ({
  frames: [],
  events: [],
  isRecording: false,
  maxFrames: fps * seconds,
});

// Call every frame
const recordFrame = (
  recorder: GameplayRecorder,
  ctx: CanvasRenderingContext2D
): void => {
  if (!recorder.isRecording) return;

  const imageData = ctx.getImageData(
    0, 0,
    ctx.canvas.width,
    ctx.canvas.height
  );

  recorder.frames.push(imageData);

  // Ring buffer - remove oldest frame
  if (recorder.frames.length > recorder.maxFrames) {
    recorder.frames.shift();
  }
};

// Generate GIF from frames (use gif.js library)
const exportHighlight = async (
  recorder: GameplayRecorder,
  startFrame: number,
  endFrame: number
): Promise<Blob> => {
  // Implementation depends on gif.js or similar library
  // This would generate a GIF or video from the recorded frames
  throw new Error('Implement with gif.js or similar');
};

// Auto-detect highlight moments
interface HighlightMoment {
  frameIndex: number;
  type: 'near_miss' | 'milestone' | 'death' | 'streak';
  score: number;
}

const detectHighlights = (events: GameEvent[]): HighlightMoment[] => {
  // Find exciting moments worth sharing
  return events
    .filter(e =>
      e.type === 'near_miss' ||
      e.type === 'milestone' ||
      (e.type === 'death' && e.score > 20)
    )
    .map(e => ({
      frameIndex: e.frameIndex,
      type: e.type,
      score: e.score,
    }));
};
```

### Highlight Priorities
1. Death after high score (dramatic)
2. Multiple near-misses in a row (tense)
3. Milestone achievements (celebratory)
4. Personal best moments (proud)

---

## Pattern: Referral System

**Category:** Viral
**Impact:** Very High
**Effort:** High

### Problem
No incentive to actively recruit new players.

### Solution
Reward both referrer and referee.

### Implementation

```typescript
interface ReferralCode {
  code: string;
  creatorId: string;
  uses: number;
  maxUses?: number;
  rewards: {
    referrer: Reward[];
    referee: Reward[];
  };
}

// Generate unique referral code
const generateReferralCode = (playerId: string): string => {
  // Simple: first 4 chars of player ID + random
  const prefix = playerId.substring(0, 4).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
};

// Referral rewards structure
const REFERRAL_REWARDS = {
  referrer: [
    { type: 'coins', amount: 100 },
    { type: 'xp_boost', amount: 2, duration: 24 }, // 2x XP for 24h
  ],
  referee: [
    { type: 'coins', amount: 50 },
    { type: 'starter_pack', amount: 1 },
  ],
};

// Milestone rewards for referrers
const REFERRAL_MILESTONES = [
  { referrals: 5, reward: { type: 'skin', id: 'recruiter_badge' } },
  { referrals: 10, reward: { type: 'skin', id: 'silver_recruiter' } },
  { referrals: 25, reward: { type: 'skin', id: 'gold_recruiter' } },
  { referrals: 100, reward: { type: 'title', id: 'Influencer' } },
];
```

### Referral Best Practices
- Make codes easy to share (short, memorable)
- Reward BOTH parties (not just referrer)
- Show referral count to motivate more sharing
- Time-limited bonuses ("2x referral rewards this week!")

---

## Pattern: Social Media Integration

**Category:** Viral
**Impact:** Medium
**Effort:** Low

### Problem
Sharing requires leaving the game.

### Solution
Deep integration with social platforms.

### Share Destinations
1. **Twitter/X:** Great for bragging, short text + image
2. **Instagram Stories:** Visual, younger audience
3. **TikTok:** Video highlights, massive reach
4. **Discord:** Gaming communities
5. **Direct message:** Personal challenges

### Share Text Templates

```typescript
const SHARE_TEMPLATES = {
  newBest: [
    '🍊 NEW PERSONAL BEST! {score} pipes in Flappy Orange! Who can beat me? {url}',
    'Just crushed my record with {score} in Flappy Orange 🔥 {url}',
  ],
  milestone: [
    '🏆 I just hit {milestone} pipes in Flappy Orange! {url}',
    '{milestone} PIPES! 🍊 Getting better at Flappy Orange {url}',
  ],
  challenge: [
    '🎯 I challenge you to beat {score} in Flappy Orange! {url}',
    'Think you\'re good? Beat my {score} in Flappy Orange 🍊 {url}',
  ],
  beatChallenge: [
    '😎 Just DESTROYED {friend}\'s challenge with {score}! Try me: {url}',
    'Challenge CRUSHED! {score} > {target} 🔥 {url}',
  ],
};

const getShareText = (
  type: keyof typeof SHARE_TEMPLATES,
  data: Record<string, string | number>
): string => {
  const templates = SHARE_TEMPLATES[type];
  const template = templates[Math.floor(Math.random() * templates.length)];

  return template.replace(/{(\w+)}/g, (_, key) => String(data[key] || ''));
};
```

---

## Metrics Dashboard

| Metric | Target | Formula |
|--------|--------|---------|
| K-Factor | >1.0 | Invites sent × Conversion rate |
| Share Rate | 15%+ | Shares / Games completed |
| Challenge Acceptance | 30%+ | Challenges played / Links opened |
| Viral Coefficient | >0.5 | New users from referrals / Total users |

---

## Anti-Patterns

1. **Forced sharing:** Never require sharing to progress
2. **Spammy posts:** Keep share content interesting
3. **Broken links:** Test all share URLs work
4. **No attribution:** Always credit the original player
5. **Privacy violations:** Never share without permission

---

Last Updated: 2024

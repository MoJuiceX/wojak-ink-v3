#!/usr/bin/env node
/**
 * BigPulp Leaderboard Bot
 *
 * Fetches leaderboard data from wojak.ink and posts updates to X.
 *
 * Features:
 * - Daily "full slate" post with all game leaders
 * - Leader-change posts when a game's #1 changes
 * - Anti-spam: max 3 posts per run, 30 min cooldown per game
 * - Dry run mode: BP_RUN_MODE=dry to skip posting
 *
 * Usage:
 *   node scripts/bigpulp/leaderboardBot.mjs
 *   BP_RUN_MODE=dry node scripts/bigpulp/leaderboardBot.mjs
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Configuration
const CONFIG = {
  apiUrl: 'https://wojak.ink/api/leaderboard/top-per-game',
  snapshotPath: path.join(ROOT_DIR, 'data/leaderboard/last-top-per-game.json'),
  statePath: path.join(ROOT_DIR, 'data/leaderboard/state.json'),
  maxPostsPerRun: 3,
  perGameCooldownMs: 30 * 60 * 1000, // 30 minutes
  dailyPostHour: 12, // Noon UTC for daily full slate
};

// Game display names
const GAME_NAMES = {
  'orange-stack': 'Orange Stack',
  'memory-match': 'Memory Match',
  'orange-pong': 'Orange Pong',
  'wojak-runner': 'Wojak Runner',
  'orange-juggle': 'Orange Juggle',
  'knife-game': 'Knife Game',
  'color-reaction': 'Color Reaction',
  'merge-2048': 'Merge 2048',
  'orange-wordle': 'Orange Wordle',
  'block-puzzle': 'Block Puzzle',
  'flappy-orange': 'Flappy Orange',
  'citrus-drop': 'Citrus Drop',
  'orange-snake': 'Orange Snake',
  'brick-breaker': 'Brick Breaker',
  'wojak-whack': 'Wojak Whack',
};

// Check if dry run mode
const isDryRun = process.env.BP_RUN_MODE === 'dry';

/**
 * Load JSON file safely
 */
function loadJson(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    }
  } catch (err) {
    console.warn(`[WARN] Failed to load ${filepath}:`, err.message);
  }
  return null;
}

/**
 * Save JSON file
 */
function saveJson(filepath, data) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

/**
 * Load state (last daily post, per-game cooldowns)
 */
function loadState() {
  const state = loadJson(CONFIG.statePath);
  return state || {
    lastDailyPost: null,
    gameCooldowns: {}, // gameId -> timestamp of last post
    postHistory: [], // Array of { timestamp, type, gameId? }
  };
}

/**
 * Save state
 */
function saveState(state) {
  saveJson(CONFIG.statePath, state);
}

/**
 * Fetch leaderboard data from API
 */
async function fetchLeaderboard() {
  console.log(`[INFO] Fetching ${CONFIG.apiUrl}...`);
  const response = await fetch(CONFIG.apiUrl);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Post to X using bird CLI (auto-post mode)
 */
function postToX(message) {
  if (isDryRun) {
    console.log('[DRY RUN] Would post to X:');
    console.log('---');
    console.log(message);
    console.log('---');
    return true;
  }

  try {
    // Use bird CLI for auto-posting
    // Escape the message for shell
    const escapedMessage = message.replace(/'/g, "'\\''");
    execSync(`bird tweet '${escapedMessage}'`, { stdio: 'inherit' });
    console.log('[INFO] Posted to X successfully');
    return true;
  } catch (err) {
    console.error('[ERROR] Failed to post to X:', err.message);
    return false;
  }
}

/**
 * Format score with commas
 */
function formatScore(score) {
  return score.toLocaleString();
}

/**
 * Generate daily full slate message
 */
function generateDailySlateMessage(topScores) {
  const lines = [
    '🏆 Daily Leaderboard Update! 🍊',
    '',
    "Today's champions across all games:",
    '',
  ];

  for (const entry of topScores.slice(0, 10)) {
    const gameName = GAME_NAMES[entry.gameId] || entry.gameId;
    lines.push(`🎮 ${gameName}: ${entry.displayName} (${formatScore(entry.score)})`);
  }

  lines.push('');
  lines.push('Think you can beat them? Play now at wojak.ink/games 🕹️');
  lines.push('');
  lines.push('#WojakInk #Gaming #Leaderboard');

  return lines.join('\n');
}

/**
 * Generate leader change message
 */
function generateLeaderChangeMessage(gameId, newLeader, oldLeader) {
  const gameName = GAME_NAMES[gameId] || gameId;

  const lines = [
    `👑 NEW CHAMPION in ${gameName}! 👑`,
    '',
    `🆕 ${newLeader.displayName} just claimed the #1 spot!`,
    `📊 Score: ${formatScore(newLeader.score)}`,
  ];

  if (oldLeader) {
    lines.push(`⬇️ Previous: ${oldLeader.displayName} (${formatScore(oldLeader.score)})`);
  }

  lines.push('');
  lines.push('Can you dethrone them? 🎮');
  lines.push('wojak.ink/games');
  lines.push('');
  lines.push('#WojakInk #Gaming #NewRecord');

  return lines.join('\n');
}

/**
 * Check if should post daily slate (once per day)
 */
function shouldPostDailySlate(state) {
  if (!state.lastDailyPost) return true;

  const lastPost = new Date(state.lastDailyPost);
  const now = new Date();

  // Check if it's a new day (UTC)
  return lastPost.toDateString() !== now.toDateString();
}

/**
 * Check if game is on cooldown
 */
function isGameOnCooldown(state, gameId) {
  const lastPost = state.gameCooldowns[gameId];
  if (!lastPost) return false;

  const elapsed = Date.now() - lastPost;
  return elapsed < CONFIG.perGameCooldownMs;
}

/**
 * Detect leader changes between snapshots
 */
function detectLeaderChanges(currentScores, previousScores) {
  const changes = [];

  if (!previousScores || !previousScores.topScores) {
    return changes;
  }

  // Create lookup map for previous scores
  const previousMap = new Map();
  for (const entry of previousScores.topScores) {
    previousMap.set(entry.gameId, entry);
  }

  // Check each current entry against previous
  for (const current of currentScores.topScores) {
    const previous = previousMap.get(current.gameId);

    if (!previous) {
      // New game or first entry
      changes.push({
        gameId: current.gameId,
        newLeader: current,
        oldLeader: null,
        type: 'new',
      });
    } else if (current.userId !== previous.userId) {
      // Leader changed
      changes.push({
        gameId: current.gameId,
        newLeader: current,
        oldLeader: previous,
        type: 'change',
      });
    } else if (current.score > previous.score) {
      // Same leader, new high score
      changes.push({
        gameId: current.gameId,
        newLeader: current,
        oldLeader: previous,
        type: 'improved',
      });
    }
  }

  return changes;
}

/**
 * Main bot logic
 */
async function main() {
  console.log('='.repeat(50));
  console.log('BigPulp Leaderboard Bot');
  console.log(isDryRun ? '[DRY RUN MODE - No posts will be made]' : '[LIVE MODE]');
  console.log('='.repeat(50));
  console.log();

  // Fetch current leaderboard
  let data;
  try {
    data = await fetchLeaderboard();
  } catch (err) {
    console.error('[ERROR] Failed to fetch leaderboard:', err.message);
    process.exit(1);
  }

  // Check if we have data
  if (!data.topScores || data.topScores.length === 0) {
    console.log('[INFO] no data yet -> noop');
    process.exit(0);
  }

  console.log(`[INFO] Fetched ${data.topScores.length} game leaders`);

  // Load previous snapshot and state
  const previousSnapshot = loadJson(CONFIG.snapshotPath);
  const state = loadState();

  // Track posts this run
  let postsThisRun = 0;

  // Check for daily slate post
  if (shouldPostDailySlate(state)) {
    if (postsThisRun < CONFIG.maxPostsPerRun) {
      console.log('[INFO] Posting daily full slate...');
      const message = generateDailySlateMessage(data.topScores);

      if (postToX(message)) {
        state.lastDailyPost = new Date().toISOString();
        state.postHistory.push({
          timestamp: Date.now(),
          type: 'daily',
        });
        postsThisRun++;
      }
    } else {
      console.log('[INFO] Skipping daily slate (max posts reached)');
    }
  } else {
    console.log('[INFO] Daily slate already posted today');
  }

  // Detect and post leader changes
  const changes = detectLeaderChanges(data, previousSnapshot);
  console.log(`[INFO] Detected ${changes.length} leader changes`);

  for (const change of changes) {
    // Skip if max posts reached
    if (postsThisRun >= CONFIG.maxPostsPerRun) {
      console.log(`[INFO] Skipping change for ${change.gameId} (max posts reached)`);
      continue;
    }

    // Skip if game is on cooldown
    if (isGameOnCooldown(state, change.gameId)) {
      const remaining = Math.ceil(
        (CONFIG.perGameCooldownMs - (Date.now() - state.gameCooldowns[change.gameId])) / 1000 / 60
      );
      console.log(`[INFO] Skipping ${change.gameId} (on cooldown, ${remaining} min remaining)`);
      continue;
    }

    // Only post for actual leader changes (not just score improvements by same player)
    if (change.type === 'change' || change.type === 'new') {
      console.log(`[INFO] Posting leader change for ${change.gameId}...`);
      const message = generateLeaderChangeMessage(
        change.gameId,
        change.newLeader,
        change.oldLeader
      );

      if (postToX(message)) {
        state.gameCooldowns[change.gameId] = Date.now();
        state.postHistory.push({
          timestamp: Date.now(),
          type: 'leader-change',
          gameId: change.gameId,
        });
        postsThisRun++;
      }
    }
  }

  // Save current snapshot
  console.log(`[INFO] Saving snapshot to ${CONFIG.snapshotPath}`);
  saveJson(CONFIG.snapshotPath, data);

  // Save state
  console.log(`[INFO] Saving state to ${CONFIG.statePath}`);
  saveState(state);

  // Summary
  console.log();
  console.log('='.repeat(50));
  console.log(`[DONE] Posts this run: ${postsThisRun}/${CONFIG.maxPostsPerRun}`);
  console.log('='.repeat(50));
}

// Run
main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});

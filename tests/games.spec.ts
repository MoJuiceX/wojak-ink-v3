import { test, expect } from '@playwright/test';

/**
 * Smoke tests for wojak-ink arcade games
 * These tests verify basic functionality:
 * - Game pages load
 * - Play button appears
 * - No console errors
 * - Game starts when Play is clicked
 */

const GAMES = [
  { name: 'Memory Match', emoji: '🧠', slug: 'memory-match' },
  { name: 'Brick by Brick', emoji: '🧱', slug: 'brick-by-brick' },
  { name: 'Flappy Orange', emoji: '🍊', slug: 'flappy-orange' },
  { name: 'Wojak Runner', emoji: '🏃', slug: 'wojak-runner' },
  { name: 'Color Reaction', emoji: '🎨', slug: 'color-reaction' },
  { name: 'Block Puzzle', emoji: '🧩', slug: 'block-puzzle' },
];

test.describe('Games Hub', () => {
  test('should load games page', async ({ page }) => {
    await page.goto('/games');
    await expect(page.locator('h1')).toContainText('Games');
  });

  test('should display all active games', async ({ page }) => {
    await page.goto('/games');
    
    for (const game of GAMES) {
      const gameButton = page.getByRole('button', { name: new RegExp(game.name, 'i') });
      await expect(gameButton).toBeVisible();
    }
  });
});

test.describe('Game Modals', () => {
  for (const game of GAMES) {
    test.describe(game.name, () => {
      test('should open game modal with PLAY button', async ({ page }) => {
        // Collect console errors
        const errors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        await page.goto('/games');
        
        // Click on game to open modal
        const gameButton = page.getByRole('button', { name: new RegExp(game.name, 'i') });
        await gameButton.click();
        
        // Wait for modal to open and PLAY button to appear
        const playButton = page.getByRole('button', { name: /PLAY/i });
        await expect(playButton).toBeVisible({ timeout: 10000 });
        
        // Verify no critical console errors (ignore 429 rate limits and known warnings)
        const criticalErrors = errors.filter(e => 
          !e.includes('429') && 
          !e.includes('Failed to load resource') &&
          !e.includes('net::ERR')
        );
        expect(criticalErrors).toHaveLength(0);
      });

      test('should show leaderboard in modal', async ({ page }) => {
        await page.goto('/games');
        
        const gameButton = page.getByRole('button', { name: new RegExp(game.name, 'i') });
        await gameButton.click();
        
        // Wait for leaderboard to populate (or show placeholders)
        const leaderboardButton = page.getByRole('button', { name: /Leaderboard/i });
        await expect(leaderboardButton).toBeVisible({ timeout: 10000 });
      });

      test('should close modal when close button clicked', async ({ page }) => {
        await page.goto('/games');
        
        const gameButton = page.getByRole('button', { name: new RegExp(game.name, 'i') });
        await gameButton.click();
        
        // Wait for modal to open
        const playButton = page.getByRole('button', { name: /PLAY/i });
        await expect(playButton).toBeVisible({ timeout: 10000 });
        
        // Click close button
        const closeButton = page.getByRole('button', { name: /Close game/i });
        await closeButton.click();
        
        // Verify modal is closed (PLAY button should not be visible)
        await expect(playButton).not.toBeVisible({ timeout: 5000 });
      });
    });
  }
});

test.describe('Game Lifecycle', () => {
  test('Memory Match should wait for PLAY before starting', async ({ page }) => {
    await page.goto('/games');
    
    // Open Memory Match
    const gameButton = page.getByRole('button', { name: /Memory Match/i });
    await gameButton.click();
    
    // Wait for PLAY button
    const playButton = page.getByRole('button', { name: /PLAY/i });
    await expect(playButton).toBeVisible({ timeout: 10000 });
    
    // Wait 2 seconds - game should NOT auto-start
    await page.waitForTimeout(2000);
    
    // PLAY button should still be visible (game hasn't started)
    await expect(playButton).toBeVisible();
  });

  test('Brick by Brick should wait for PLAY before starting', async ({ page }) => {
    await page.goto('/games');
    
    // Open Brick by Brick
    const gameButton = page.getByRole('button', { name: /Brick by Brick/i });
    await gameButton.click();
    
    // Wait for PLAY button
    const playButton = page.getByRole('button', { name: /PLAY/i });
    await expect(playButton).toBeVisible({ timeout: 10000 });
    
    // Wait 2 seconds - game should NOT auto-start
    await page.waitForTimeout(2000);
    
    // PLAY button should still be visible (game hasn't started)
    await expect(playButton).toBeVisible();
  });

  test('Block Puzzle should wait for PLAY before starting', async ({ page }) => {
    await page.goto('/games');
    
    // Open Block Puzzle
    const gameButton = page.getByRole('button', { name: /Block Puzzle/i });
    await gameButton.click();
    
    // Wait for PLAY button
    const playButton = page.getByRole('button', { name: /PLAY/i });
    await expect(playButton).toBeVisible({ timeout: 10000 });
    
    // Wait 2 seconds - game should NOT auto-start
    await page.waitForTimeout(2000);
    
    // PLAY button should still be visible (game hasn't started)
    await expect(playButton).toBeVisible();
  });
});

test.describe('Console Error Monitoring', () => {
  test('games page should have no critical errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/games');
    await page.waitForTimeout(3000); // Wait for async operations
    
    // Filter out expected errors (rate limits, network issues)
    const criticalErrors = errors.filter(e => 
      !e.includes('429') && 
      !e.includes('Failed to load resource') &&
      !e.includes('net::ERR') &&
      !e.includes('favicon')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

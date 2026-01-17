/**
 * Share Image Generator
 *
 * Canvas-based image generation for shareable score cards.
 */

import type { ScoreShareData } from './types';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350; // 4:5 aspect ratio for social

interface BrandColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

const BRAND_COLORS: BrandColors = {
  primary: '#FF8C32',
  secondary: '#FFD700',
  background: '#0f0f1a',
  text: '#ffffff'
};

/**
 * Generate a shareable image for a game score
 */
export async function generateScoreImage(data: ScoreShareData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#0f0f1a');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Decorative elements
  drawDecorativeElements(ctx);

  // Game title
  ctx.fillStyle = BRAND_COLORS.text;
  ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.gameName.toUpperCase(), CANVAS_WIDTH / 2, 200);

  // Score label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '32px system-ui, -apple-system, sans-serif';
  ctx.fillText(data.isNewHighScore ? 'NEW HIGH SCORE!' : 'MY SCORE', CANVAS_WIDTH / 2, 400);

  // Trophy emoji for high score
  if (data.isNewHighScore) {
    ctx.font = '64px system-ui, -apple-system, sans-serif';
    ctx.fillText('🏆', CANVAS_WIDTH / 2, 320);
  }

  // Score value
  ctx.fillStyle = BRAND_COLORS.primary;
  ctx.font = 'bold 180px system-ui, -apple-system, sans-serif';
  ctx.fillText(formatScore(data.score), CANVAS_WIDTH / 2, 580);

  // Rank (if available)
  if (data.rank) {
    ctx.fillStyle = BRAND_COLORS.secondary;
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillText(`RANK #${data.rank}`, CANVAS_WIDTH / 2, 700);
  }

  // Challenge text
  ctx.fillStyle = BRAND_COLORS.text;
  ctx.font = '36px system-ui, -apple-system, sans-serif';
  ctx.fillText('Can you beat my score?', CANVAS_WIDTH / 2, 900);

  // Game controller emoji
  ctx.font = '48px system-ui, -apple-system, sans-serif';
  ctx.fillText('🎮', CANVAS_WIDTH / 2, 970);

  // Branding
  drawBranding(ctx);

  // Username (if available)
  if (data.username) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`@${data.username}`, CANVAS_WIDTH / 2, 1100);
  }

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image'));
      }
    }, 'image/png', 0.9);
  });
}

function drawDecorativeElements(ctx: CanvasRenderingContext2D): void {
  // Orange circles decoration
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = BRAND_COLORS.primary;

  // Top left circle
  ctx.beginPath();
  ctx.arc(-100, -100, 300, 0, Math.PI * 2);
  ctx.fill();

  // Bottom right circle
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH + 100, CANVAS_HEIGHT + 100, 400, 0, Math.PI * 2);
  ctx.fill();

  // Middle accent
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - 50, 400, 150, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;

  // Border
  ctx.strokeStyle = BRAND_COLORS.primary;
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, CANVAS_WIDTH - 80, CANVAS_HEIGHT - 80);

  // Inner glow effect on border
  ctx.strokeStyle = 'rgba(255, 140, 50, 0.3)';
  ctx.lineWidth = 8;
  ctx.strokeRect(44, 44, CANVAS_WIDTH - 88, CANVAS_HEIGHT - 88);
}

function drawBranding(ctx: CanvasRenderingContext2D): void {
  // Logo/brand area at bottom
  ctx.fillStyle = 'rgba(255, 140, 50, 0.1)';
  ctx.fillRect(0, CANVAS_HEIGHT - 200, CANVAS_WIDTH, 200);

  // Brand name with orange emoji
  ctx.fillStyle = BRAND_COLORS.text;
  ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍊 WOJAK GAMES', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);

  // URL
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '28px system-ui, -apple-system, sans-serif';
  ctx.fillText('wojak.ink', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
}

function formatScore(score: number): string {
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(1)}M`;
  }
  if (score >= 10000) {
    return `${(score / 1000).toFixed(0)}K`;
  }
  return score.toLocaleString();
}

/**
 * Generate a simpler text-based share (for platforms without image support)
 */
export function generateShareText(data: ScoreShareData): string {
  const emoji = data.isNewHighScore ? '🏆' : '🎮';
  const rankText = data.rank ? ` (Rank #${data.rank})` : '';

  return `${emoji} I just scored ${data.score.toLocaleString()} in ${data.gameName}${rankText}!\n\nCan you beat me? 🍊\n\nPlay now: ${getShareUrl(data.gameId)}`;
}

/**
 * Get the share URL for a game
 */
export function getShareUrl(gameId: string, referrer?: string): string {
  const baseUrl = `${window.location.origin}/games`;
  if (referrer) {
    return `${baseUrl}?ref=${referrer}&game=${gameId}`;
  }
  return `${baseUrl}?game=${gameId}`;
}

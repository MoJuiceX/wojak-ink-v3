#!/usr/bin/env node
/**
 * Pre-render Script for SEO
 *
 * Generates static HTML for main routes so AI crawlers
 * (ChatGPT, Claude, Perplexity) can index content.
 *
 * Usage: node scripts/prerender.mjs
 * Run after: npm run build
 */

import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const PORT = 4173;

// Routes to pre-render
const ROUTES = [
  '/',
  '/gallery',
  '/bigpulp',
  '/games',
  '/treasury',
  '/generator',
  '/leaderboard',
  '/games/flappy',
  '/games/memory',
  '/games/snake',
  '/games/pong',
  '/games/runner',
  '/games/stack',
  '/games/juggle',
  '/games/knife',
  '/games/block-puzzle',
  '/games/citrus-drop',
  '/games/brick-breaker',
  '/games/whack',
];

// Simple static file server
function createStaticServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };

  return createServer((req, res) => {
    let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

    // Handle SPA routing - serve index.html for non-file routes
    if (!existsSync(filePath) || !filePath.includes('.')) {
      filePath = join(DIST_DIR, 'index.html');
    }

    try {
      const content = readFileSync(filePath);
      const ext = filePath.match(/\.[^.]+$/)?.[0] || '.html';
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content);
    } catch (err) {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

async function prerender() {
  console.log('🚀 Starting pre-render process...\n');

  // Check if dist exists
  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Start server
  const server = createStaticServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`📡 Server running on http://localhost:${PORT}\n`);

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];

  for (const route of ROUTES) {
    const page = await browser.newPage();
    const url = `http://localhost:${PORT}${route}`;

    console.log(`📄 Rendering: ${route}`);

    try {
      // Block external requests to prevent timeout from API calls
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const requestUrl = request.url();
        // Allow local requests only
        if (requestUrl.startsWith(`http://localhost:${PORT}`)) {
          request.continue();
        } else {
          // Block external requests (API calls, analytics, etc.)
          request.abort('blockedbyclient');
        }
      });

      // Navigate and wait for DOM content (don't wait for all network)
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      // Wait for React to mount and initial render
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get rendered HTML
      let html = await page.content();

      // Add prerender indicator meta tag
      html = html.replace(
        '</head>',
        '  <meta name="prerender-status" content="prerendered">\n  </head>'
      );

      // Determine output path
      const outputPath = route === '/'
        ? join(DIST_DIR, 'index.html')
        : join(DIST_DIR, route, 'index.html');

      // Create directory if needed
      const outputDir = dirname(outputPath);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      // Write HTML
      writeFileSync(outputPath, html);
      results.push({ route, status: '✅' });

    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      results.push({ route, status: '❌', error: error.message });
    }

    try {
      await page.close();
    } catch {
      // Page may already be closed, ignore
    }
  }

  await browser.close();
  server.close();

  // Summary
  console.log('\n📊 Pre-render Summary:');
  console.log('─'.repeat(40));
  results.forEach(({ route, status }) => {
    console.log(`${status} ${route}`);
  });

  const success = results.filter(r => r.status === '✅').length;
  console.log('─'.repeat(40));
  console.log(`Total: ${success}/${ROUTES.length} routes pre-rendered\n`);

  if (success < ROUTES.length) {
    process.exit(1);
  }
}

prerender().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

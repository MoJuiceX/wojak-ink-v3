/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  server: {
    host: true, // Allow network access
    proxy: {
      '/spacescan-api': {
        target: 'https://api.spacescan.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/spacescan-api/, ''),
      },
      '/coingecko-api': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/coingecko-api/, ''),
      },
      '/mintgarden-api': {
        target: 'https://api.mintgarden.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mintgarden-api/, ''),
      },
      '/dexie-api': {
        target: 'https://api.dexie.space',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dexie-api/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})

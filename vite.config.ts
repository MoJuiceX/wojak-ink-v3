import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@pages': '/src/pages',
        '@hooks': '/src/hooks',
        '@utils': '/src/utils',
        '@assets': '/src/assets',
      },
    },
    server: {
      host: true, // Allow network access
      proxy: {
        '/spacescan-api': {
          target: 'https://api.spacescan.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/spacescan-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.VITE_SPACESCAN_API_KEY) {
                proxyReq.setHeader('x-api-key', env.VITE_SPACESCAN_API_KEY);
              }
            });
          },
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
        '/parsebot-api': {
          target: 'https://api.parse.bot',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/parsebot-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('x-api-key', env.VITE_PARSEBOT_API_KEY || '');
            });
          },
        },
      },
    },
  }
})

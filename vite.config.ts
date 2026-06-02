import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:3000';

  return {
    plugins: [react(), VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.href.startsWith(apiUrl) &&
              url.pathname.includes('/companies/') &&
              url.pathname.endsWith('/branding'),
            handler: 'StaleWhileRevalidate' as const,
            options: {
              cacheName: 'branding-cache',
              expiration: { maxAgeSeconds: 60 },
            },
          },
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.href.startsWith(apiUrl) && url.pathname.includes('/catalog'),
            handler: 'StaleWhileRevalidate' as const,
            options: {
              cacheName: 'catalog-cache',
              expiration: { maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|svg)$/,
            handler: 'CacheFirst' as const,
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
      manifest: false,
    }), cloudflare()],
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, 'src/app'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@widgets': path.resolve(__dirname, 'src/widgets'),
        '@features': path.resolve(__dirname, 'src/features'),
        '@entities': path.resolve(__dirname, 'src/entities'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@generated': path.resolve(__dirname, 'src/generated'),
      },
    },
  };
});
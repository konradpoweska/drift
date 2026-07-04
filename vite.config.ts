import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// Served from a subpath on GitHub Pages (konradpoweska.github.io/drift/).
const BASE = '/drift/';

export default defineConfig({
  base: BASE,
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Drift',
        short_name: 'Drift',
        description: 'A focus timer with variable-ratio reinforcement',
        theme_color: '#111111',
        background_color: '#111111',
        display: 'standalone',
        start_url: BASE,
        scope: BASE,
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      devOptions: {
        enabled: true, // serve manifest + dev SW so `npm run dev` is installable
      },
    }),
  ],
});

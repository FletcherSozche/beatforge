import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1500,
    target: ['es2020', 'chrome88', 'safari14'],
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          tone: ['tone']
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: false
  },
  preview: {
    host: true,
    port: 4173
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'BeatForge - Music Studio',
        short_name: 'BeatForge',
        description: 'Drum n Bass, Dubstep ve daha fazlasi icin sezgisel muzik uretim stüdyosu',
        theme_color: '#0a0e1a',
        background_color: '#0a0e1a',
        display: 'standalone',
        orientation: 'any',
        scope: './',
        start_url: './',
        lang: 'tr',
        dir: 'ltr',
        categories: ['music', 'entertainment', 'productivity'],
        icons: [
          { src: 'icons/icon-72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        screenshots: [
          { src: 'screenshots/wide-1.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide' },
          { src: 'screenshots/narrow-1.png', sizes: '720x1280', type: 'image/png', form_factor: 'narrow' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ]
});

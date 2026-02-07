/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/fonts\.googleapis\.com/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'google-fonts-stylesheets' }
        }, {
          urlPattern: /^https:\/\/fonts\.gstatic\.com/,
          handler: 'CacheFirst',
          options: { cacheName: 'google-fonts-webfonts', expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 } }
        }]
      },
      manifest: false
    })
  ],
  base: '/oscal-viewer/',
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/types/**'],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 78,
        lines: 70,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          preact: ['preact']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})

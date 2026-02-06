import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  base: '/oscal-viewer/',
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
      '@': '/src'
    }
  }
})

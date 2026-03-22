import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Rami Score Tracker',
        short_name: 'Rami',
        description: 'Suivi des scores pour le jeu de Rami',
        theme_color: '#0A0E1A',
        background_color: '#0A0E1A',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['sql.js'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('sql.js')) return 'sqljs'
        },
      },
    },
  },
})

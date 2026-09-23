import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'elei — cafeterías cercanas',
        short_name: 'elei',
        description: 'Mapa de cafeterías: busca una ciudad y agrega tus lugares favoritos.',
        theme_color: '#4a7c59',
        background_color: '#e3e7ea',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Los tiles vectoriales y el geocoder son de terceros: no los cacheamos como "app shell",
        // solo el shell de la app (HTML/CSS/JS) para que funcione offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}']
      }
    })
  ]
});

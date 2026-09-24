import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    // En desarrollo, /api se reenvía al backend de NestJS: así el navegador ve un solo origen (sin CORS).
    proxy: { '/api': 'http://localhost:3000' },
    allowedHosts: ['.trycloudflare.com']
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'elei — cafeterías cercanas',
        short_name: 'elei',
        description: 'Mapa de cafeterías: busca una ciudad y descubre los lugares agregados.',
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
        // Los tiles vectoriales, el geocoder y la API son de terceros / dinámicos: no los cacheamos
        // como "app shell", solo el shell de la app (HTML/CSS/JS) para que abra offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Que el service worker nunca responda con index.html a una ruta de la API.
        navigateFallbackDenylist: [/^\/api/]
      }
    })
  ]
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  base: '/SPAReactFrontend/',
  plugins: [
    react(),
    mkcert(), // Включает HTTPS локально
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // Позволяет тестить PWA даже на localhost
      },
      manifest: {
        name: 'Radiations App',
        short_name: 'RadApp',
        description: 'Приложение для расчета излучений',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'favicon.svg', // Используем твою иконку из public
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    port: 52840,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
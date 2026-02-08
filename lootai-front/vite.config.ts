import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // MindAR запрашивает .mind — fetch идёт с origin страницы. Прокси избегает CORS.
      '/api': {
        target: 'http://localhost:3000', // backend port (см. backend .env PORT)
        changeOrigin: true,
      },
    },
  },
})

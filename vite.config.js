import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Bypasses browser CORS by secretly routing matching frontend API requests 
      // directly to DuckDuckGo via the local Node/Vite backend.
      '/search-proxy': {
        target: 'https://lite.duckduckgo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/search-proxy/, '')
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy Netlify API calls to avoid CORS (duplicate Access-Control-Allow-Origin header issue)
      '/api/netlify': {
        target: 'https://api.netlify.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/netlify/, '/api/v1'),
        secure: true,
        configure: (proxy) => {
          // Strip duplicate CORS headers added by Netlify's CDN layer
          proxy.on('proxyRes', (proxyRes) => {
            const acao = proxyRes.headers['access-control-allow-origin'];
            if (Array.isArray(acao)) {
              proxyRes.headers['access-control-allow-origin'] = acao[0];
            }
          });
        }
      },
      // Proxy Vercel API calls
      '/api/vercel': {
        target: 'https://api.vercel.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vercel/, ''),
        secure: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const acao = proxyRes.headers['access-control-allow-origin'];
            if (Array.isArray(acao)) {
              proxyRes.headers['access-control-allow-origin'] = acao[0];
            }
          });
        }
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('monaco-editor') || id.includes('@monaco-editor')) {
              return 'vendor-monaco';
            }
            if (id.includes('gsap')) {
              return 'vendor-gsap';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-recharts';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-core';
          }
        }
      }
    }
  }
})

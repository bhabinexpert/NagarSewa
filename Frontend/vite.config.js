import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from  '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Split large third-party libs into their own cacheable chunks
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react', 'react-icons'],
        },
      },
    },
  },
})

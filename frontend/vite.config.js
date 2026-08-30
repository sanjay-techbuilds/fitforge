import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss'; // This should already be here

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
    },
  },
  css: {
    postcss: {
      // ✨ THIS IS THE FINAL, GUARANTEED FIX ✨
      // We are no longer relying on auto-discovery. We are passing the config file directly.
      plugins: [
        tailwindcss('./tailwind.config.js'),
      ],
    },
  },
});
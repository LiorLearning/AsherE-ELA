import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // For local dev, you can still proxy to your API if desired.
    // When deploying, set VITE_API_BASE_URL on the client instead of using a proxy.
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8787',
    //     changeOrigin: true,
    //   },
    // },
  },
});



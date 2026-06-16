import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ajo-edge': {
        target: 'https://63.140.39.210',
        secure: false, // Bypass SSL altname check for the direct IP address
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ajo-edge/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            proxyReq.setHeader('Host', 'edge.adobedc.net');
          });
        }
      }
    }
  }
})

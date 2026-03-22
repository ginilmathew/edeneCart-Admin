import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // When VITE_API_BASE_URL is unset, use relative /v1/api and this proxy to the Nest app.
      "/v1/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 2525,
    allowedHosts: true,
    headers: {
      "ngrok-skip-browser-warning": "true",
	  "Cross-Origin-Opener-Policy": "same-origin",
    },
  }
})

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works when hosted on GitHub Pages project sites
  // (https://<user>.github.io/<repo>/) as well as user/org sites.
  base: './',
  plugins: [react(), tailwindcss()],
})

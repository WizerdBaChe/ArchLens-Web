import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 若部署至 GitHub Pages，將 base 改為 '/<repo-name>/'
// 例如：base: '/archlens-web/'
// 本機開發保持 '/' 即可
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "./", // biar path relatif
  ssr: false, // Nonaktifkan SSR jika tidak diperlukan

})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './components'),
      '@/services': resolve(__dirname, './services'),
      '@/hooks': resolve(__dirname, './hooks'),
      '@/types': resolve(__dirname, './types'),
      '@/utils': resolve(__dirname, './utils'),
    },
  },
  server: {
    port: 3000,
  },
})
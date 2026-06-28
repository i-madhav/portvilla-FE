import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@typings': path.resolve(__dirname, 'src/typings'),
      '@app': path.resolve(__dirname, 'src'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@api-hooks': path.resolve(__dirname, 'src/api-hooks'),
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@shared-components': path.resolve(__dirname, 'src/shared-components'),
    },
  },
  plugins: [react()],
  optimizeDeps: {
    // Pre-bundle heavy 3D deps for faster dev startup
    include: ['three', '@react-three/fiber', '@react-three/drei', 'gsap'],
  },
  build: {
    rollupOptions: {
      output: {
        // Split Three.js into its own chunk for lazy loading
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'gsap-vendor': ['gsap'],
        },
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
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

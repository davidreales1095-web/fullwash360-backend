import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // ✅ IMPORTANTE: Base path para producción y HashRouter
  base: './',
  
  server: {
    port: 3000,
    // ⚠️ ESTO SOLO FUNCIONA EN DESARROLLO - NO AFECTA PRODUCCIÓN
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  
  // ✅ CONFIGURACIÓN DE BUILD PARA PRODUCCIÓN
  build: {
    outDir: 'dist',                    // Directorio de salida
    assetsDir: 'assets',               // Donde irán JS/CSS/imágenes
    sourcemap: false,                  // Desactiva sourcemaps para producción
    rollupOptions: {
      output: {
        // Nombres de archivos con hash para cache busting
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  }
})
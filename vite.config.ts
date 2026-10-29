import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Evita que Vitest reutilice un registro de handlers viejo al agregar archivos en mocks/handlers.
    fsModuleCache: false,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    // En equipos lentos, el primer test de cada archivo supera los 5 s por defecto al correr todo en paralelo.
    testTimeout: 15000,
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000/api/v1',
    },
  },
  
})

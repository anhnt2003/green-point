import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const fromRoot = (p: string) => fileURLToPath(new URL(p, import.meta.url))

/**
 * Public base path. "/" locally; the GitHub Pages workflow sets BASE_PATH to the
 * repository sub-path (e.g. "/green-point/"), so every asset URL is prefixed with it.
 */
const base = (process.env.BASE_PATH ?? '/').replace(/\/*$/, '/')

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': fromRoot('./src') },
  },
  build: {
    // The MapLibre chunk (~1 MB) is loaded lazily with the map screen only.
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      input: {
        shell: fromRoot('./index.html'),
        app: fromRoot('./app.html'),
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})

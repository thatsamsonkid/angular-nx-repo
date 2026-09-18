import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const appRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: appRoot,
  cacheDir: resolve(appRoot, '../../node_modules/.vite/button-element-react'),
  plugins: [react()],
  server: {
    port: 4500,
    host: 'localhost',
  },
  preview: {
    port: 4501,
    host: 'localhost',
  },
  build: {
    outDir: resolve(appRoot, '../../dist/apps/button-element-react'),
    emptyOutDir: true,
    reportCompressedSize: true,
  },
  test: {
    name: 'button-element-react',
    globals: true,
    watch: false,
    environment: 'jsdom',
    setupFiles: [resolve(appRoot, 'src/test-setup.ts')],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});

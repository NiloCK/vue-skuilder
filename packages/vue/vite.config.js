import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: 'window',
    'process.env': process.env,
    'process.browser': true,
    'process.version': JSON.stringify(process.version),
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // events: 'events-browserify',
      events: 'node-events',
    },
    extensions: ['.js', '.ts', '.json', '.vue'],
  },
  optimizeDeps: {
    include: ['events-browserify'],
  },
});

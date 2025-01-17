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
      events: 'events',
      'pouchdb-browser': 'pouchdb-browser/lib/index.js',
      'pouchdb-find': 'pouchdb-find/lib/index.js',
    },
    extensions: ['.js', '.ts', '.json', '.vue'],
  },
  optimizeDeps: {
    include: ['events', 'pouchdb-browser', 'pouchdb-find', 'pouchdb-authentication'],
  },
});

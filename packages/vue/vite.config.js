import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import eslint from 'vite-plugin-eslint';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      keep_classnames: true,
    },
  },
  define: {
    global: 'window',
    'process.env': process.env,
    'process.browser': true,
    'process.version': JSON.stringify(process.version),
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
      },
      manifest: {
        name: 'eduQuilt',
        short_name: 'eQ',
        theme_color: '#dd33ff',
        icons: [
          // Add your icons here
        ],
      },
    }),
    eslint({
      failOnError: false,
      failOnWarning: false,
      cache: false,
      include: ['src/**/*.js', 'src/**/*.vue', 'src/**/*.ts'], // Files to include
      exclude: ['node_modules'], // Files to exclude
    }),
  ],
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

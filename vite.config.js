import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import shopify from 'vite-plugin-shopify';

export default defineConfig({
  plugins: [
    vue(),
    shopify({
      // Theme files are in the shopify/ subdirectory
      themeRoot: './shopify',
      // Source directory for entrypoints
      sourceCodeDir: './src',
      // Entry points that will be compiled
      entrypointsDir: './src',
    }),
  ],

  build: {
    // Output to shopify/assets
    outDir: './shopify/assets',
    emptyOutDir: false, // Don't delete existing assets
    manifest: true,
    rollupOptions: {
      input: {
        main: './src/main.js',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },

  server: {
    // Watch Liquid files for changes
    watch: {
      // Don't watch output directory to prevent infinite loops
      ignored: ['**/shopify/assets/**', '**/node_modules/**'],
    },
  },

  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@utils': '/src/utils',
      '@styles': '/src/styles',
    },
  },

  css: {
    postcss: './postcss.config.js',
  },
});

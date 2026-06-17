import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import shopify from 'vite-plugin-shopify';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const themeRoot = isDev ? './shopify' : './dist';
  const outDir = isDev ? './shopify/assets' : './dist/assets';

  return {
    plugins: [
      vue(),
      shopify({
        themeRoot,
        sourceCodeDir: './src',
        entrypointsDir: './src',
      }),
    ],

    build: {
      outDir,
      emptyOutDir: false,
      cssCodeSplit: false,
      manifest: true,
      rollupOptions: {
        input: {
          main: './src/main.js',
        },
        output: {
          // Content hashes in the filename are what cache-bust theme assets:
          // the vite-plugin-shopify snippet strips Shopify's ?v= param, so an
          // unhashed name (main.js) gets cached by the CDN forever and deploys
          // never take effect. A hashed name changes the URL on every code change.
          entryFileNames: '[name]-[hash].js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: '[name].[ext]',
        },
      },
    },

    server: {
      watch: {
        // Watch Liquid files and ignore output directories
        ignored: ['**/dist/**', '**/shopify/assets/main.*', '**/node_modules/**'],
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
  };
});

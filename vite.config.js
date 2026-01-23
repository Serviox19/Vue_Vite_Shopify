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
      emptyOutDir: false, // Don't delete existing theme assets
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

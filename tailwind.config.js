/** @type {import('tailwindcss').Config} */
export default {
  // Use tw- prefix to avoid conflicts with Shopify/Dawn classes
  prefix: 'tw-',

  content: [
    './shopify/**/*.liquid',
    './shopify/**/*.json',
    './src/**/*.{vue,js,ts}',
  ],

  theme: {
    extend: {
      // Custom theme extensions
      colors: {
        // Add custom colors here
      },
      fontFamily: {
        // Add custom fonts here
      },
    },
  },

  plugins: [
    // Add Tailwind plugins here
  ],
};

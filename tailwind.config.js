/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './shopify/**/*.liquid',
    './shopify/**/*.json',
    './src/**/*.{vue,js,ts}',
    // Note: We scan source files, not dist/
  ],

  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
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

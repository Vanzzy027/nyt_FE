/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#e6f4ea',
          DEFAULT: '#16a34a',
          dark: '#15803d',
        },
        dark: '#111827', // deep slate for text
      }
    },
  },
  plugins: [],
}
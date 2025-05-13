/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          green: {
            700: '#2D6A4F',
            800: '#1B4332',
            50: '#F0FFF4',
          },
        },
      },
    },
    plugins: [],
  }
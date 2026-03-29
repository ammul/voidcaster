/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a0e1a',
          800: '#0f1526',
          700: '#141c33',
          600: '#1a2440',
        },
      },
    },
  },
  plugins: [],
}

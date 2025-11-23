/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#064e3b', // emerald-900
        secondary: '#f5f5f4', // stone-100
        accent: '#d1fae5', // emerald-100
        beige: '#e7e5e4', // stone-200
      },
      fontFamily: {
        sans: ['"Noto Sans KR"', 'sans-serif'],
        serif: ['"Noto Sans KR"', 'serif'],
      }
    },
  },
  plugins: [],
}

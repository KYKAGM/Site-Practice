/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'keyboard-key--correct',
    'keyboard-key--present',
    'keyboard-key--absent',
    'tile--correct',
    'tile--present',
    'tile--absent',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
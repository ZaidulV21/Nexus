/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#FDF9EC',
          100: '#FBF0C9',
          200: '#F5DC8A',
          300: '#EEC84B',
          400: '#E6B524',
          500: '#C9A84C',
          600: '#A07C2A',
          700: '#7A5C1E',
          800: '#543D14',
          900: '#2E200A',
        }
      },
      fontFamily: {
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

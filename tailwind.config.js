/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#f2f8ff',
          100: '#e5f1ff',
          200: '#c8e2ff',
          300: '#9acaff',
          400: '#64a9ff',
          500: '#2f86f6',
          600: '#0071e3',
          700: '#0066cc',
          800: '#0053a6',
          900: '#07477f',
          950: '#052d54',
        },
        ink: '#141310',
        paper: '#f7f5f1',
        clay: {
          DEFAULT: '#b45309',
          soft: '#c4782a',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 8px 28px rgba(20, 19, 16, 0.06)',
        card: '0 1px 2px rgba(20, 19, 16, 0.04)',
      },
    },
  },
  plugins: [],
};

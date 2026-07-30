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
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0, 0, 0, 0.06)',
        card: '0 2px 16px rgba(0, 0, 0, 0.055)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          light: '#eef2ff',
        },
        accent: {
          DEFAULT: '#0d9488',
          light: '#f0fdfa',
        },
        coral: {
          DEFAULT: '#e11d48',
          light: '#fff1f2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 28px rgba(17, 24, 39, 0.06)',
        card: '0 1px 2px rgba(17, 24, 39, 0.04)',
      },
    },
  },
  plugins: [],
};

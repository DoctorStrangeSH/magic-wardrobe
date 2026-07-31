/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        romantic: {
          pink: '#f8e8e8',
          lightPink: '#fdf2f2',
          dark: '#2d1b4e',
          darker: '#1a0f2e',
          gold: '#d4a574',
          lightGold: '#e8d5b7',
          crimson: '#c41e3a',
          softCrimson: '#e8475b',
        }
      },
      fontFamily: {
        cormorant: ['Cormorant Garamond', 'serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'magic': '0 4px 20px rgba(212, 167, 116, 0.15), 0 1px 3px rgba(45, 27, 78, 0.1)',
        'magic-lg': '0 8px 32px rgba(212, 167, 116, 0.2), 0 2px 8px rgba(45, 27, 78, 0.12)',
        'card': '0 2px 12px rgba(45, 27, 78, 0.08), 0 1px 2px rgba(45, 27, 78, 0.06)',
        'card-hover': '0 6px 24px rgba(212, 167, 116, 0.2), 0 2px 6px rgba(45, 27, 78, 0.1)',
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
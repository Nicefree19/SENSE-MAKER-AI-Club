/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo 600
          dark: '#3730A3', // Indigo 800
          light: '#818CF8', // Indigo 400
        },
        secondary: {
          DEFAULT: '#64748B', // Slate 500
          dark: '#334155', // Slate 700
        },
        accent: {
          DEFAULT: '#06B6D4', // Cyan 500
          glow: '#22D3EE', // Cyan 400
        },
        dark: {
          bg: '#0F172A', // Slate 900
          surface: '#1E293B', // Slate 800
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

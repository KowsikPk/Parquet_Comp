/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode palette
        dark: {
          bg: '#0F1117',
          card: '#1A1D27',
          border: '#2D3148',
          text: {
            primary: '#F1F5F9',
            secondary: '#94A3B8',
          },
          hover: '#1E2130',
        },
      },
      animation: {
        'bounce-scale': 'bounceScale 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'pulse-scale': 'pulseScale 0.2s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        bounceScale: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseScale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

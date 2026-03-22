/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0E1A',
        'bg-secondary': '#111827',
        gold: '#C9A84C',
        'gold-light': '#E8C97A',
        ivory: '#F5F0E8',
        'green-felt': '#1A3A2A',
        'red-card': '#C0392B',
        success: '#2ECC71',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        shake: 'shake 0.4s ease-in-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%': { transform: 'translateX(-6px)' },
          '45%': { transform: 'translateX(6px)' },
          '75%': { transform: 'translateX(-4px)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(201,168,76,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(201,168,76,0.6), 0 0 50px rgba(201,168,76,0.2)' },
        },
      },
    },
  },
  plugins: [],
}

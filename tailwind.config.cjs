/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand accent (green), stay consistent across the app
        primary: { DEFAULT: '#22C55E', light: '#DCFCE7', dark: '#16A34A' },
        info: '#38BDF8',
        warning: '#FBBF24',
        // Dark library theme
        background: '#070B1B',
        surface: '#0B132D',
        surface2: '#0E1B3A',
        textPrimary: '#EAF0FF',
        textSecondary: '#AAB7D4',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2, 6, 23, .28)',
        lift: '0 18px 60px rgba(2, 6, 23, .38)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(24px, -14px) scale(1.05)' },
          '66%': { transform: 'translate(-18px, 18px) scale(.98)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(22, 163, 74, .35)' },
          '50%': { boxShadow: '0 0 0 12px rgba(22, 163, 74, 0)' },
        },
      },
      animation: {
        blob: 'blob 8s ease-in-out infinite',
        fadeUp: 'fadeUp .6s cubic-bezier(.22, 1, .36, 1) both',
        shimmer: 'shimmer 1.4s ease-in-out infinite',
        bounceSubtle: 'bounceSubtle 2.6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

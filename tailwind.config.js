/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0b0f19',
        primary: {
          DEFAULT: '#60a5fa',
          hover: '#3b82f6',
        },
        secondary: '#a78bfa',
        accent: '#34d399',
        danger: '#f87171',
      },
      backgroundImage: {
        'app-radial':
          'radial-gradient(circle at top left, #1e293b, #0b0f19)',
        'brand-gradient': 'linear-gradient(135deg, #60a5fa, #a78bfa)',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
        fadeInDown: 'fadeInDown 0.6s ease-out',
        fadeInRight: 'fadeInRight 0.3s ease-out',
      },
    },
  },
  plugins: [],
};

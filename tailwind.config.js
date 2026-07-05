/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070c17',
          900: '#0b1220',
          800: '#111a2e',
          700: '#182541',
          600: '#22335a',
        },
        ember: {
          400: '#ff9a5c',
          500: '#ff7a3d',
          600: '#f2621f',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,122,61,0.15), 0 20px 60px -20px rgba(255,122,61,0.35)',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(60% 60% at 50% 0%, rgba(255,122,61,0.16) 0%, rgba(7,12,23,0) 70%)',
      },
    },
  },
  plugins: [],
}

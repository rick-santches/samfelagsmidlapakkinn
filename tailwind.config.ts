import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark-friendly base palette
        ink: {
          950: '#0A0E14',
          900: '#0F141C',
          850: '#141B25',
          800: '#1A2230',
          700: '#242E3F',
          600: '#334055',
          500: '#4A5A75',
          400: '#6B7C99',
          300: '#93A3BC',
          200: '#BCC8DA',
          100: '#E2E8F2',
        },
        // Signature acid green — savings, wins
        savings: {
          DEFAULT: '#A3E635',
          dim: '#84CC16',
          glow: '#BEF264',
        },
        // Red-orange — flags, waste
        flame: {
          DEFAULT: '#FB7245',
          dim: '#EA580C',
          soft: '#FDBA74',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config

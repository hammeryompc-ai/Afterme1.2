import tailwindConfig from 'tailwindcss/defaultConfig'

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          500: '#0084ff',
          600: '#0073e6',
          700: '#0059cc'
        },
        secondary: {
          50: '#f3f0ff',
          500: '#7928ca',
          600: '#6b1eb8'
        }
      },
      animation: {
        'pulse-ring': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: []
}

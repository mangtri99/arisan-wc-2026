/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          DEFAULT: '#06140E', // stadium night, near-black green
          panel: '#0C2018',
          line: '#16352A',
        },
        turf: {
          DEFAULT: '#10B97A',
          deep: '#0C7A52',
        },
        chalk: {
          DEFAULT: '#EDF2EA', // pitch-line white
          dim: '#8DA496',
        },
        gold: {
          DEFAULT: '#F2C84B', // trophy / champion
          deep: '#C9971F',
        },
        whistle: '#E5482F', // live / alert, used sparingly
      },
      fontFamily: {
        display: ['Anton', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ticket: '0 1px 0 0 rgba(237,242,234,0.06), 0 24px 60px -24px rgba(0,0,0,0.8)',
        glow: '0 0 0 1px rgba(242,200,75,0.35), 0 0 48px -8px rgba(242,200,75,0.45)',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'translateY(-8%)', opacity: '0.2' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        rise: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shine: {
          '0%,100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        flip: 'flip 90ms ease-out',
        rise: 'rise 420ms cubic-bezier(0.22,1,0.36,1) both',
        shine: 'shine 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

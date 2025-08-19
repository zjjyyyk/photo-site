/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fdf9f3',
          100: '#faf4e6',
          200: '#f5e6cc',
          300: '#efd4a8',
          400: '#e8bd7f',
          500: '#e2a85c',
          600: '#d89449',
          700: '#b47f3e',
          800: '#906539',
          900: '#765431',
        },
        cream: {
          50: '#fffef7',
          100: '#fefcf0',
          200: '#fcf6d9',
          300: '#f9eeb8',
          400: '#f5e392',
          500: '#f0d563',
          600: '#e8c547',
          700: '#deb036',
          800: '#b8912a',
          900: '#967526',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'serif': ['Playfair Display', 'ui-serif', 'Georgia'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'zoom-in': 'zoomIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}


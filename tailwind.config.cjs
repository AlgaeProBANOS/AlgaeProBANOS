// eslint-disable-next-line @typescript-eslint/no-require-imports
const preset = require('@intavia/ui/dist/tailwind-preset.config.cjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.@(css|ts|tsx)', './node_modules/@intavia/ui/dist/**/*.js'],
  // darkMode: 'media',
  preset: [preset],
  theme: {
    extend: {
      colors: {
        'apb-dark': '#0B0B0B',
        'apb-gray': '#3c3c3c',
        'apb-gray-light': '#f2f3ea',
        'apb-green-dark': '#223500',
        'apb-green': '#5f7a2f',
        'apb-green-light': '#7fa43f',
        'apb-aubergine': '#781847',
        'apb-gold': {
          100: '#DDD1A0',
          50: '#EDE8D4',
        },
        'apb-pink': {
          100: '#DDA0AF',
          50: '#EDD4DA',
        },
        'apb-blue': {
          50: '#f2f7fb',
          100: '#e7f0f8',
          200: '#d4e3f1',
          300: '#bacfe7',
          400: '#a0b8dd',
          500: '#849dd0',
          600: '#6b80c0',
          700: '#5a6ba8',
          800: '#4b5988',
          900: '#424e6d',
          950: '#262c40',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'], //Default font for text
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
};

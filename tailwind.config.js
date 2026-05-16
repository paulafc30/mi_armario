/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic colors driven by CSS vars (auto-flip light/dark)
        page:           'rgb(var(--c-page) / <alpha-value>)',
        surface:        'rgb(var(--c-surface) / <alpha-value>)',
        'surface-soft': 'rgb(var(--c-surface-soft) / <alpha-value>)',
        'surface-glass':'rgb(var(--c-surface) / 0.75)',
        ink:            'rgb(var(--c-ink) / <alpha-value>)',
        muted:          'rgb(var(--c-muted) / <alpha-value>)',
        line:           'rgb(var(--c-line) / <alpha-value>)',
        'line-soft':    'rgb(var(--c-line-soft) / <alpha-value>)',
        'brand-soft':   'rgb(var(--c-brand-soft) / <alpha-value>)',

        // Brand palette pivote en #FF5771 (coral rosado, no demasiado rosa).
        brand: {
          50:  '#fff1f3',
          100: '#ffe2e7',
          200: '#ffc5cf',
          300: '#ffa1b1',
          400: '#ff7d92',
          500: '#ff5771',  // primary
          600: '#ef3a59',
          700: '#c92847',
          800: '#a31e3a',
          900: '#831a31',
          950: '#480d1b',
        },
        base: '#fff7f8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.6875rem',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 4px 16px -8px rgba(255, 87, 113, 0.14)',
        lift: '0 10px 30px -10px rgba(239, 58, 89, 0.30), 0 4px 12px -4px rgba(15, 23, 42, 0.06)',
        glow: '0 0 0 4px rgba(255, 87, 113, 0.22)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ff5771 0%, #ef3a59 100%)',
        'brand-soft':     'linear-gradient(180deg, #fff1f3 0%, #ffffff 100%)',
        'hero-glow':      'radial-gradient(60% 50% at 50% 0%, rgba(255,87,113,0.30) 0%, rgba(255,87,113,0) 100%)',
      },
      animation: {
        'fade-in':  'fadeIn 240ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn: { from: { opacity: 0, transform: 'scale(.97)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}

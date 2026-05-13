/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic colors driven by CSS vars (auto-flip light/dark)
        surface:        'rgb(var(--c-surface) / <alpha-value>)',
        'surface-soft': 'rgb(var(--c-surface-soft) / <alpha-value>)',
        'surface-glass':'rgb(var(--c-surface) / 0.75)',
        ink:            'rgb(var(--c-ink) / <alpha-value>)',
        muted:          'rgb(var(--c-muted) / <alpha-value>)',
        line:           'rgb(var(--c-line) / <alpha-value>)',
        'line-soft':    'rgb(var(--c-line-soft) / <alpha-value>)',
        'brand-soft':   'rgb(var(--c-brand-soft) / <alpha-value>)',

        // Brand palette (constante en ambos temas)
        brand: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        base: '#faf7ff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.6875rem',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 4px 16px -8px rgba(124, 58, 237, 0.10)',
        lift: '0 10px 30px -10px rgba(124, 58, 237, 0.25), 0 4px 12px -4px rgba(15, 23, 42, 0.06)',
        glow: '0 0 0 4px rgba(168, 85, 247, 0.18)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
        'brand-soft':     'linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)',
        'hero-glow':      'radial-gradient(60% 50% at 50% 0%, rgba(168,85,247,0.25) 0%, rgba(168,85,247,0) 100%)',
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

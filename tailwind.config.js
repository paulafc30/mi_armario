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

        // Brand palette: coral cálido (tirando a rojo).
        // Constante en ambos temas.
        brand: {
          50:  '#fff3f0',
          100: '#ffe4dd',
          200: '#ffc6b8',
          300: '#ff9d8a',
          400: '#ff7359',
          500: '#f15041',   // primary
          600: '#dc3a2a',
          700: '#b82e20',
          800: '#92271c',
          900: '#75221a',
          950: '#400d08',
        },
        base: '#fff7f4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.6875rem',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 4px 16px -8px rgba(241, 80, 65, 0.12)',
        lift: '0 10px 30px -10px rgba(220, 58, 42, 0.28), 0 4px 12px -4px rgba(15, 23, 42, 0.06)',
        glow: '0 0 0 4px rgba(241, 80, 65, 0.20)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #f15041 0%, #dc3a2a 100%)',
        'brand-soft':     'linear-gradient(180deg, #fff3f0 0%, #ffffff 100%)',
        'hero-glow':      'radial-gradient(60% 50% at 50% 0%, rgba(241,80,65,0.28) 0%, rgba(241,80,65,0) 100%)',
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

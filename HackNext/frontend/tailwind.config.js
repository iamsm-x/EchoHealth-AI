/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Stitch Design System: "The Clinical Authority" ── */
        primary:               { DEFAULT: '#003fb1', container: '#1a56db' },
        secondary:             { DEFAULT: '#006c4b', container: '#96f6c8' },
        tertiary:              { DEFAULT: '#882800', container: '#b13600' },
        error:                 { DEFAULT: '#ba1a1a', container: '#ffdad6' },

        surface: {
          DEFAULT:             '#f8f9fa',
          dim:                 '#d9dadb',
          bright:              '#f8f9fa',
          container:           '#edeeef',
          'container-high':    '#e7e8e9',
          'container-highest': '#e1e3e4',
          'container-low':     '#f3f4f5',
          'container-lowest':  '#ffffff',
          tint:                '#1353d8',
          variant:             '#e1e3e4',
        },

        'on-surface':         { DEFAULT: '#191c1d', variant: '#434654' },
        'on-primary':         '#ffffff',
        'on-secondary':       '#ffffff',
        'on-tertiary':        '#ffffff',
        'on-error':           '#ffffff',

        outline:              { DEFAULT: '#737686', variant: '#c3c5d7' },
        'primary-fixed':      { DEFAULT: '#dbe1ff', dim: '#b5c4ff' },
        'secondary-fixed':    { DEFAULT: '#96f6c8', dim: '#7ad9ad' },
        'tertiary-fixed':     { DEFAULT: '#ffdbd0', dim: '#ffb59d' },

        'inverse-primary':    '#b5c4ff',
        'inverse-surface':    '#2e3132',
        'inverse-on-surface': '#f0f1f2',
      },

      fontFamily: {
        display: ['"Public Sans"', 'system-ui', 'sans-serif'],
        headline: ['"Public Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        label: ['"Inter"', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.15', fontWeight: '700' }],
        'display-md': ['2.75rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-sm': ['2.25rem', { lineHeight: '1.25', fontWeight: '600' }],
        'headline-lg': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-md': ['1.75rem', { lineHeight: '1.35', fontWeight: '600' }],
        'headline-sm': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'title-lg': ['1.375rem', { lineHeight: '1.4', fontWeight: '600' }],
        'title-md': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        'title-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['0.875rem', { lineHeight: '1.55', fontWeight: '400' }],
        'body-sm': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1.35', fontWeight: '500' }],
        'label-sm': ['0.6875rem', { lineHeight: '1.3', fontWeight: '500' }],
      },

      borderRadius: {
        'xs': '0.25rem',
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.625rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      boxShadow: {
        'whisper': '0 20px 40px rgba(25, 28, 29, 0.05)',
        'soft': '0 4px 12px rgba(25, 28, 29, 0.06)',
        'glow-primary': '0 0 0 3px #dbe1ff',
        'pulse': '0 0 0 12px rgba(19, 83, 216, 0.2)',
      },

      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(19, 83, 216, 0.25)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(19, 83, 216, 0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

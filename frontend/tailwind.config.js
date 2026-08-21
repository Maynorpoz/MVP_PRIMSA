/** @type {import('tailwindcss').Config} */
// Brand tokens from the Fase 2 design pass (see INSTRUCCIONES.md section 5
// and the published "Primsa Design System" canvas). These are transcribed
// literally from the approved mockups, not improvised — colors are oklch(),
// matching the design canvas exactly.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: 'oklch(18% 0.02 55)',
          700: 'oklch(32% 0.02 55)',
          400: 'oklch(52% 0.015 55)',
        },
        paper: {
          50: 'oklch(98.5% 0.008 80)',
          100: 'oklch(96% 0.012 75)',
          200: 'oklch(90% 0.016 72)',
        },
        brand: {
          DEFAULT: 'oklch(62% 0.16 55)', // amber-600
          hover: 'oklch(54% 0.16 53)', // amber-700
          tint: 'oklch(93% 0.05 60)', // amber-100
        },
        success: {
          DEFAULT: 'oklch(52% 0.09 175)', // teal-600
          tint: 'oklch(93% 0.035 175)', // teal-100
        },
        danger: {
          DEFAULT: 'oklch(50% 0.15 30)', // rust-600
          tint: 'oklch(93% 0.04 30)', // rust-100
        },
      },
      borderRadius: {
        xs: '2px',
        sm: '6px',
        md: '10px',
      },
      boxShadow: {
        // Deliberately minimal: most surfaces use a 1px paper-200 border,
        // not a shadow. "elevated" is reserved for the cart drawer and
        // modals only — never applied to ordinary cards.
        panel: '0 1px 2px oklch(18% 0.02 55 / 0.04)',
        elevated: '0 24px 48px -16px oklch(18% 0.02 55 / 0.28)',
      },
    },
  },
  plugins: [],
}

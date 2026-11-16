import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Cambio de estado en /pedido/:token. Siempre con `motion-safe:`; cortas y sin bucles.
      keyframes: {
        'step-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'dot-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.35)' },
        },
        'status-halo': {
          '0%': {
            transform: 'scale(0.98)',
            boxShadow: '0 0 0 0 color-mix(in srgb, var(--pwa-accent) 45%, transparent)',
          },
          '40%': { transform: 'scale(1.02)' },
          '100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 12px color-mix(in srgb, var(--pwa-accent) 0%, transparent)',
          },
        },
      },
      animation: {
        'step-in': 'step-in 450ms ease-out both',
        'dot-pulse': 'dot-pulse 600ms ease-in-out 2',
        'status-halo': 'status-halo 700ms ease-out 1',
      },
    },
  },
  plugins: [],
} satisfies Config;

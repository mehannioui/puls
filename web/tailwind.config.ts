import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './nuxt.config.ts',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          DEFAULT: 'var(--pulse-brand)',
          quiet: 'var(--pulse-brand-quiet)',
          faint: 'var(--pulse-brand-faint)',
          on: 'var(--pulse-on-brand)',
        },
        // Status
        'status-op':      { DEFAULT: 'var(--status-op)',      bg: 'var(--status-op-bg)' },
        'status-deg':     { DEFAULT: 'var(--status-degraded)', bg: 'var(--status-degraded-bg)' },
        'status-out':     { DEFAULT: 'var(--status-outage)',   bg: 'var(--status-outage-bg)' },
        'status-maint':   { DEFAULT: 'var(--status-maint)',   bg: 'var(--status-maint-bg)' },
        'status-paused':  'var(--status-paused)',
        // Surfaces
        canvas:    'var(--bg-canvas)',
        'surf-base':    'var(--bg-base)',
        'surf-raised':  'var(--bg-raised)',
        'surf-overlay': 'var(--bg-overlay)',
        'surf-input':   'var(--bg-input)',
        'surf-hover':   'var(--bg-hover)',
        // Borders
        'line-subtle':  'var(--border-subtle)',
        'line-def':     'var(--border-default)',
        'line-strong':  'var(--border-strong)',
        // Text / foreground
        ink: {
          DEFAULT: 'var(--fg-primary)',
          sec:     'var(--fg-secondary)',
          ter:     'var(--fg-tertiary)',
          quiet:   'var(--fg-quiet)',
          accent:  'var(--fg-on-accent)',
        },
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'JetBrains Mono', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '14px',
      },
      boxShadow: {
        card: '0 1px 0 0 oklch(1 0 0 / 0.03) inset, 0 1px 2px oklch(0 0 0 / 0.4)',
        pop:  '0 12px 32px oklch(0 0 0 / 0.45), 0 0 0 1px var(--border-subtle)',
      },
      letterSpacing: {
        tight:   '-0.015em',
        tighter: '-0.025em',
        wide:    '0.08em',
        wider:   '0.12em',
      },
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
} satisfies Config

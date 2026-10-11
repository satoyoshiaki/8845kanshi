/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#05070A',
        panel: '#0B1017',
        'panel-hover': '#101722',
        line: '#172033',
        primary: '#F8FAFC',
        secondary: '#94A3B8',
        accent: '#218BFF',
        cyan: '#22D3EE',
      },
      boxShadow: {
        glow: '0 0 32px rgba(33, 139, 255, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}

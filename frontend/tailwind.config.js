/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#020b14',
          900: '#061626',
          850: '#0a2139',
          800: '#0e2b49',
          700: '#143d63',
          600: '#1d5485',
          500: '#2770ae',
          400: '#3c93db',
          300: '#73b4eb',
        },
        cyan: {
          accent: '#00f2fe',
          glow: '#00e5ff',
          deep: '#00a3c4',
        },
        coral: {
          glow: '#ff4081',
          soft: '#ff6e99',
        },
        marine: {
          emerald: '#00e676',
          amber: '#ffd600',
          orange: '#ff9100',
          violet: '#7c4dff',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scan 2.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'sonar': 'sonar 2s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { top: '0%', opacity: '0.8' },
          '50%': { top: '95%', opacity: '0.4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sonar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'ocean-mesh': 'radial-gradient(at 10% 20%, rgba(0, 242, 254, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(0, 230, 118, 0.1) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(10, 33, 57, 0.95) 0px, #020b14 100%)',
      }
    },
  },
  plugins: [],
}

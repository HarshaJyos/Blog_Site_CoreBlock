import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          50: '#eef2ff',
          100: '#dce4ff',
          200: '#b9c9ff',
          300: '#8ba6ff',
          400: '#5c7cff',
          500: '#3b5bdb',
          600: '#2b44b8',
          700: '#1e3494',
          800: '#162871',
          900: '#0f1d4e',
          950: '#0a1233',
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7cd4fd',
          400: '#36bffa',
          500: '#0ca5ea',
          600: '#0083c9',
          700: '#0169a3',
          800: '#065886',
          900: '#0b496f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #0a1233 0%, #1e3494 50%, #3b5bdb 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'card': '0 4px 16px 0 rgba(10, 18, 51, 0.08)',
        'card-hover': '0 8px 30px 0 rgba(10, 18, 51, 0.15)',
        'nav': '0 2px 20px 0 rgba(10, 18, 51, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config;

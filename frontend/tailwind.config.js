/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Primary brand colors as specified
        'primary': {
          'day': '#67C7FF', // Sky-blue for day theme
          'night': '#9FE3FF', // Lighter sky-blue for night theme
          'dark': '#0A84FF', // Deeper blue for CTAs
        },
        
        // Background colors
        'bg': {
          'day': '#FFFFFF', // White for day
          'night': '#0F1724', // Deep navy for night
          'card-day': '#FFFFFF', // White cards
          'card-night': '#0E1722', // Slightly lighter than night bg
          'surface-day': '#F8FAFC', // Light surface
          'surface-night': '#1A2332', // Dark surface
        },
        
        // Text colors
        'text': {
          'day': '#0B0B0B', // Black for day
          'night': '#E6F7FF', // Soft light for night
          'secondary-day': '#4B5563', // Gray for day
          'secondary-night': '#94A3B8', // Light gray for night
        },
        
        // Platform name colors
        'brand': {
          'name-day': '#0B0B0B', // Black in day mode
          'name-night': '#9FE3FF', // Light sky-blue in night mode
        },
        
        // Status colors
        'status': {
          'error': '#EF4444', // Red
          'success': '#10B981', // Green
          'warning': '#F59E0B', // Amber
          'info': '#3B82F6', // Blue
        },
        
        // Legacy colors for backward compatibility
        'nawi-sky': '#67C7FF',
        'nawi-sky-light': '#9FE3FF',
        'nawi-sky-dark': '#0A84FF',
        'nawi-dark': '#0F1724',
        'nawi-dark-lighter': '#0E1722',
        'nawi-white': '#FFFFFF',
      },
      
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'arabic': ['Tajawal', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        'h1': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }], // 32px
        'h2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }], // 24px
        'h3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 20px
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // 16px
        'small': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // 14px
      },
      
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-dark': 'glow-dark 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'particle-float': 'particle-float 10s infinite linear',
      },
      
      keyframes: {
        glow: {
          from: { textShadow: '0 0 10px #67C7FF, 0 0 20px #67C7FF' },
          to: { textShadow: '0 0 20px #9FE3FF, 0 0 30px #9FE3FF' }
        },
        'glow-dark': {
          from: { textShadow: '0 0 10px #9FE3FF, 0 0 20px #9FE3FF' },
          to: { textShadow: '0 0 20px #67C7FF, 0 0 30px #67C7FF' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(103, 199, 255, 0.5)',
          },
          '50%': {
            opacity: '.8',
            boxShadow: '0 0 40px rgba(159, 227, 255, 0.8)',
          },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'particle-float': {
          '0%': { transform: 'translateY(0) translateX(0)' },
          '25%': { transform: 'translateY(-10px) translateX(10px)' },
          '50%': { transform: 'translateY(5px) translateX(-5px)' },
          '75%': { transform: 'translateY(-5px) translateX(-10px)' },
          '100%': { transform: 'translateY(0) translateX(0)' },
        },
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-day': 'linear-gradient(135deg, #67C7FF 0%, #9FE3FF 100%)',
        'gradient-night': 'linear-gradient(135deg, #0F1724 0%, #1A2332 100%)',
      },
      
      boxShadow: {
        'card-day': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-night': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'glow-day': '0 0 20px rgba(103, 199, 255, 0.4)',
        'glow-night': '0 0 20px rgba(159, 227, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'responsive-xs': 'var(--text-xs)',
        'responsive-sm': 'var(--text-sm)',
        'responsive-base': 'var(--text-base)',
        'responsive-lg': 'var(--text-lg)',
        'responsive-xl': 'var(--text-xl)',
        'responsive-2xl': 'var(--text-2xl)',
        'responsive-3xl': 'var(--text-3xl)',
      },
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
      },
      colors: {
        // Custom color system for dark mode
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'accent-primary': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        primary: {
          50: '#F3F4F6',
          100: '#E5E7EB',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: 'var(--color-primary)',
          600: 'var(--color-primary-dark)',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        dark: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Enhanced purple gradient for dark mode
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'normal': 'var(--transition-normal)',
        'slow': 'var(--transition-slow)',
      },
      screens: {
        'mobile': '480px',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1280px',
      },
      animation: {
        'pulse-recording': 'pulse-recording 2s infinite',
        'loading': 'loading 1.5s infinite',
      },
      keyframes: {
        'pulse-recording': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        'loading': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
    },
  },
  plugins: [
    // Custom plugin for accessibility and responsive utilities
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.touch-target': {
          minWidth: '48px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.focus-ring': {
          '&:focus': {
            outline: '2px solid var(--color-primary)',
            outlineOffset: '2px',
          },
        },
        '.glass-effect': {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.scrollable-content': {
          maxHeight: '60vh',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-gray-300) transparent',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--color-gray-300)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'var(--color-gray-400)',
          },
        },
        '.container-responsive': {
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 var(--spacing-md)',
          '@media (min-width: 768px)': {
            padding: '0 var(--spacing-lg)',
          },
          '@media (min-width: 1024px)': {
            padding: '0 var(--spacing-xl)',
          },
        },
        '.visually-hidden': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
        '.skip-link': {
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: 'var(--color-primary)',
          color: 'white',
          padding: '8px',
          textDecoration: 'none',
          borderRadius: '4px',
          zIndex: '1000',
          '&:focus': {
            top: '6px',
          },
        },
      });

      addComponents({
        '.card-grid': {
          display: 'grid',
          gap: 'var(--spacing-lg)',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: 'var(--spacing-md)',
          },
        },
        '.progress-bar': {
          width: '100%',
          height: '8px',
          background: 'var(--color-gray-200)',
          borderRadius: '4px',
          overflow: 'hidden',
        },
        '.progress-fill': {
          height: '100%',
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
          transition: 'width var(--transition-normal)',
        },
        '.interactive-spacing > * + *': {
          marginTop: 'var(--spacing-md)',
        },
        '.offline-badge': {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '8px',
            height: '8px',
            background: 'var(--color-warning)',
            borderRadius: '50%',
            border: '2px solid white',
          },
        },
        '.recording-pulse': {
          animation: 'pulse-recording 2s infinite',
        },
        '.skeleton': {
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s infinite',
        },
      });
    },
  ],
};
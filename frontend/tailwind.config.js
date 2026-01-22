/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Updated color palette */
        'agri-green': '#2E7D32',      /* Crop Green - Secondary */
        'agri-light': '#F5F1E3',      /* Wheat Beige - Surface */
        'agri-accent': '#F57C00',     /* Harvest Orange - CTA */
        'agri-dark': '#3E2723',       /* Soil Brown - Primary */
      },
      keyframes: {
        slideInUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        slideInUp: 'slideInUp 0.6s ease-out',
        fadeIn: 'fadeIn 1s ease-in',
        bounce: 'bounce 3s infinite',
      },
    },
  },
  plugins: [],
}

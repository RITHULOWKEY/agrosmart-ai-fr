/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agro: {
          50: '#f2f8f4',
          100: '#e1efe6',
          200: '#c5dfd0',
          300: '#9ec6b1',
          400: '#71a78e',
          500: '#4e8a70',
          600: '#3a6f58',
          700: '#2f5947',
          800: '#28483b',
          900: '#1b4332',
          950: '#0d241a',
        },
        earth: {
          50: '#fbfaf8',
          100: '#f6f4ef',
          200: '#ece7dc',
          300: '#ded4c2',
          400: '#c7b79d',
          500: '#ad9b7c',
          600: '#8e7a5e',
          700: '#6f5d47',
          800: '#534536',
          900: '#3a3026',
        },
        limeacc: {
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(27, 67, 50, 0.06), 0 2px 6px -1px rgba(27, 67, 50, 0.04)',
        'premium': '0 12px 32px -4px rgba(27, 67, 50, 0.08), 0 4px 12px -2px rgba(27, 67, 50, 0.03)',
        'elevated': '0 20px 40px -6px rgba(27, 67, 50, 0.12), 0 8px 16px -4px rgba(27, 67, 50, 0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}

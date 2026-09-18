/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#0b0f19',
          900: '#0f172a',
          850: '#172033',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          amber: '#f59e0b',
          orange: '#ea580c',
          cyan: '#06b6d4',
          blue: '#2563eb',
          emerald: '#10b981',
          rose: '#f43f5e'
        }
      }
    },
  },
  plugins: [],
}



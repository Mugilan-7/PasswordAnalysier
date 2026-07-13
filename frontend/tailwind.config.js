/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#050b14',
          card: 'rgba(10, 20, 38, 0.7)',
          border: 'rgba(16, 185, 129, 0.2)',
          'border-blue': 'rgba(59, 130, 246, 0.2)',
          green: '#00ff66',
          'green-dim': '#0ea5e9',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          glow: '#059669'
        }
      },
      fontFamily: {
        cyber: ['Space Grotesk', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}

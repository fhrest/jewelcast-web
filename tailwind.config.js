/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0E0E11',        // Темный фон
        panel: '#151518',     // Панели
        panelLight: '#1C1C22',// Активные элементы
        border: '#2A2A33',    // Рамки
        silver: '#C0C5CE',    // Серебро (акцент)
        text: '#E2E4E9',      // Белый текст
        muted: '#7A7D85',     // Серый текст
        danger: '#E74C3C',
      },
    },
  },
  plugins: [],
}
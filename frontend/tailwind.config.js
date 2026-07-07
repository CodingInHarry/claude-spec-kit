/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#3b6fed",
          600: "#2f59c4",
          700: "#26479c",
        },
        status: {
          todo: "#6b7280",
          progress: "#b45309",
          done: "#15803d",
        },
      },
      spacing: {
        18: "4.5rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

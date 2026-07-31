/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cinema: { red: "#e50914", "red-dark": "#b20710", dark: "#0a0a0a", card: "#111827" },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      animation: { shimmer: "shimmer 1.5s infinite" },
      keyframes: { shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } } },
    },
  },
  plugins: [],
};

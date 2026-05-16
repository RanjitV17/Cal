/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ladder: {
          1: "#bfdbfe", // light blue
          2: "#bbf7d0", // light green
          3: "#fef3c7", // light amber
          4: "#fecaca", // light red
          5: "#fda4af", // rose
          6: "#fb7185",
          7: "#e11d48",
          8: "#9f1239",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 8px 30px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

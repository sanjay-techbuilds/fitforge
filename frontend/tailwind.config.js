/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#38bdf8", // main bright cyan
          50: "#e0f7ff",
          100: "#b6f0ff",
          200: "#8ce9ff",
          300: "#62e2ff",
          400: "#38dbff",
          500: "#00d4ff", // middle-bright for buttons, borders
          600: "#00b8e6", // hover / active
          700: "#0099b3", // headings / dark buttons
          800: "#007380", // focus / ring
          900: "#004d4d", // deepest accents / text
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'), // <-- ADD THIS
    require('@tailwindcss/line-clamp'),  // <-- ADD THIS
  ],
};
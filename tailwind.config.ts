import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f7f5",
          100: "#dcece5",
          400: "#3f9c7d",
          500: "#237a5c",
          600: "#18604a",
          900: "#0e3a2e"
        }
      }
    }
  },
  plugins: []
};

export default config;
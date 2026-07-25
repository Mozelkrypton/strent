import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F1ECDD",
        ink: "#211D16",
        clay: {
          DEFAULT: "#B54A2C",
          dark: "#8F3A21"
        },
        mustard: "#E3A73A",
        leaf: "#4C6B4F",
        mute: "#8C8272"
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-work-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
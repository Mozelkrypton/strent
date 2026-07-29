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
<<<<<<< HEAD
=======
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(33,29,22,0.04), 0 8px 24px -8px rgba(33,29,22,0.10)",
        card: "0 2px 10px -4px rgba(33,29,22,0.12)",
        "card-hover": "0 16px 32px -12px rgba(33,29,22,0.18)",
        lift: "0 12px 28px -10px rgba(181,74,44,0.35)"
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)"
>>>>>>> master
      }
    }
  },
  plugins: []
};

export default config;
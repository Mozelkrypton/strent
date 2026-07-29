import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F7F5",
        surface: "#FFFFFF",
        ink: "#14171A",
        mute: "#6B7280",
        primary: {
          DEFAULT: "#0E7A5F",
          dark: "#0A5C47",
          light: "#E4F3EE"
        },
        accent: {
          DEFAULT: "#E8A33D",
          light: "#FBEDD3"
        },
        danger: {
          DEFAULT: "#DC4B4B",
          light: "#FBE9E9"
        },
        // kept for anything still referencing the old palette during transition
        paper: "#F7F7F5",
        clay: {
          DEFAULT: "#0E7A5F",
          dark: "#0A5C47"
        },
        mustard: "#E8A33D",
        leaf: "#0E7A5F"
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        body: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"]
      },
      borderRadius: {
        "4xl": "2rem"
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(20,23,26,0.04), 0 8px 24px -8px rgba(20,23,26,0.08)",
        card: "0 2px 12px -4px rgba(20,23,26,0.10)",
        "card-hover": "0 20px 40px -12px rgba(20,23,26,0.18)",
        lift: "0 14px 30px -10px rgba(14,122,95,0.35)",
        glow: "0 0 0 4px rgba(14,122,95,0.12)"
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};

export default config;

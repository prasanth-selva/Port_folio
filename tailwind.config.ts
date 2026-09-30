import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#080D12",
        accent: {
          cyan: "#73E0BE",
          violet: "#B3A0FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        blink: "blink 1.1s step-end infinite",
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      boxShadow: {
        glow: "0 0 24px rgba(115, 224, 190, 0.18)",
        "glow-sm": "0 0 12px rgba(115, 224, 190, 0.24)",
        "glow-violet": "0 0 24px rgba(179, 160, 255, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;

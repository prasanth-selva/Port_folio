import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#0C1018",
        accent: {
          cyan: "#E3AE62",
          violet: "#9AA8D8",
          coral: "#D98068",
          ink: "#171B25",
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
        glow: "0 0 28px rgba(227, 174, 98, 0.18)",
        "glow-sm": "0 0 16px rgba(227, 174, 98, 0.26)",
        "glow-violet": "0 0 28px rgba(154, 168, 216, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;

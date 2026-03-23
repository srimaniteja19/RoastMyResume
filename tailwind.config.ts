import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a2e",
        ink2: "#2d2d44",
        sky: "#b8d4f5",
        sky2: "#d4e8fa",
        "accent-green": "#00c853",
        "accent-red": "#ff1744",
        "accent-blue": "#2979ff"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        display: ["var(--font-display)", "sans-serif"]
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        drift1: {
          from: { transform: "translateX(-300px)" },
          to: { transform: "translateX(calc(100vw + 300px))" }
        },
        drift2: {
          from: { transform: "translateX(calc(100vw + 300px))" },
          to: { transform: "translateX(-300px)" }
        }
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease both",
        "drift1": "drift1 60s linear infinite",
        "drift2": "drift2 80s linear infinite"
      },
      boxShadow: {
        soft: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        card: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)"
      }
    }
  },
  plugins: []
};

export default config;

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
        "accent-blue": "#2979ff",
        pop: "#e040fb",
        "pop-purple": "#b044ff",
        "pop-lavender": "#b388ff",
        "pop-light": "#fce4ec"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        display: ["var(--font-display)", "sans-serif"],
        handwritten: ["var(--font-handwritten)", "cursive"]
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
        },
        float1: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "33%": { transform: "translate(8px, -12px) rotate(2deg)" },
          "66%": { transform: "translate(-6px, 8px) rotate(-1deg)" }
        },
        float2: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "50%": { transform: "translate(-10px, -8px) rotate(-3deg)" }
        },
        float3: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(6px, 10px)" },
          "75%": { transform: "translate(-8px, -6px)" }
        },
        "resume-float": {
          "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
          "50%": { transform: "translateY(-12px) rotate(1deg)" }
        },
        "icon-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" }
        },
        "check-draw": {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" }
        }
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease both",
        drift1: "drift1 60s linear infinite",
        drift2: "drift2 80s linear infinite",
        float1: "float1 6s ease-in-out infinite",
        float2: "float2 8s ease-in-out infinite",
        float3: "float3 7s ease-in-out infinite",
        "resume-float": "resume-float 4s ease-in-out infinite",
        "icon-pulse": "icon-pulse 2s ease-in-out infinite",
        "check-draw": "check-draw 0.4s ease-out forwards"
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

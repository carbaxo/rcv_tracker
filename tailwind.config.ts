import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#080b10",
          900: "#0e141c",
          850: "#131b25",
          800: "#18222f",
          700: "#243343",
          600: "#324459",
        },
        accent: {
          DEFAULT: "#34d399",
          dark: "#059669",
          soft: "#6ee7b7",
        },
        cardio: "#fb7185",
        gym: "#38bdf8",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      boxShadow: {
        // Sombras suaves y con profundidad, no el borde gris plano de siempre.
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.7)",
        float: "0 20px 50px -20px rgba(0,0,0,0.8)",
        glow: "0 8px 28px -8px rgba(52,211,153,0.55)",
        "glow-sm": "0 4px 16px -6px rgba(52,211,153,0.5)",
      },
      transitionTimingFunction: {
        // Movimiento "Silk": aceleración natural, salida suave y con cuerpo.
        silk: "cubic-bezier(0.22, 1, 0.36, 1)",
        "silk-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        sheet: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        rise: "rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        pop: "pop 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
        sheet: "sheet 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        fade: "fade 0.25s ease both",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        "bg-primary": "#0E1113",
        "bg-secondary": "#151A1D",
        "bg-elevated": "#1B2024",
        // Text
        "text-pp": {
          primary: "#F5F7F8",
          secondary: "#C8CDD1",
          muted: "#8C949C",
          disabled: "#5E656D",
        },
        // Accent
        "accent": {
          primary: "#4ADE80",
          dark: "#22C55E",
          light: "#86EFAC",
        },
        // Status
        "status": {
          success: "#4ADE80",
          warning: "#FACC15",
          danger: "#F87171",
          info: "#60A5FA",
        },
        // Borders (referenced as CSS vars in globals.css)
        "border-subtle": "rgba(255,255,255,0.06)",
        "border-strong": "rgba(255,255,255,0.12)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Instrument Serif", "serif"],
      },
      fontSize: {
        "display": ["56px", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "600" }],
        "heading-xl": ["40px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        "heading-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        "heading-md": ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "500" }],
        "heading-sm": ["20px", { lineHeight: "1.4", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "1.5" }],
        "body-md": ["16px", { lineHeight: "1.5" }],
        "body-sm": ["14px", { lineHeight: "1.4" }],
        "caption": ["12px", { lineHeight: "1.4" }],
      },
      borderRadius: {
        "card": "16px",
        "button": "12px",
        "input": "12px",
        "modal": "20px",
        "panel": "18px",
      },
      boxShadow: {
        "soft": "0 8px 32px rgba(0,0,0,0.18)",
        "elevated": "0 16px 48px rgba(0,0,0,0.28)",
        "glow-accent": "0 0 20px rgba(74,222,128,0.15)",
      },
      transitionTimingFunction: {
        "pp": "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      transitionDuration: {
        "fast": "150ms",
        "base": "200ms",
        "slow": "250ms",
      },
      spacing: {
        "18": "72px",   // sidebar collapsed width
        "60": "240px",  // sidebar expanded width
        "topbar": "56px",
        "inspector": "420px",
      },
      screens: {
        "phone": "375px",
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1440px",
      },
      animation: {
        "fade-slide": "fadeSlideIn 250ms cubic-bezier(0.2,0.8,0.2,1) forwards",
        "fade-collapse": "fadeCollapse 200ms cubic-bezier(0.2,0.8,0.2,1) forwards",
        "skeleton": "skeletonPulse 1.5s ease-in-out infinite",
        "slide-in-right": "slideInRight 250ms cubic-bezier(0.2,0.8,0.2,1)",
        "slide-in-bottom": "slideInBottom 250ms cubic-bezier(0.2,0.8,0.2,1)",
        "backdrop-in": "backdropIn 250ms cubic-bezier(0.2,0.8,0.2,1)",
        "spin-slow": "spin 1.5s linear infinite",
      },
      keyframes: {
        fadeSlideIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeCollapse: {
          from: { opacity: "1", maxHeight: "200px" },
          to: { opacity: "0", maxHeight: "0" },
        },
        skeletonPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        slideInRight: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        slideInBottom: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        backdropIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

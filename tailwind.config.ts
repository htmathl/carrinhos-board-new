import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        upNDown: {
          "0%, 49%": { transform: "translateY(0px)" },
          "50%, 100%": { transform: "translateY(-10px)" },
        },
        flicker0: {
          "0%, 49%": { backgroundColor: "rgb(220, 38, 38)" },
          "50%, 100%": { backgroundColor: "transparent" },
        },
        flicker1: {
          "0%, 49%": { backgroundColor: "transparent" },
          "50%, 100%": { backgroundColor: "rgb(220, 38, 38)" },
        },
        eyesMovement: {
          "0%, 49%": { transform: "translateX(0px)" },
          "50%, 99%": { transform: "translateX(10px)" },
          "100%": { transform: "translateX(0px)" },
        },
        shadowMovement: {
          "0%, 49%": { opacity: "0.5" },
          "50%, 100%": { opacity: "0.2" },
        },
      },
      animation: {
        upNDown: "upNDown 0.5s infinite",
        flicker0: "flicker0 0.5s infinite",
        flicker1: "flicker1 0.5s infinite",
        eyesMovement: "eyesMovement 3s infinite",
        shadowMovement: "shadowMovement 0.5s infinite",
      },
      gridTemplateColumns: {
        "14": "repeat(14, minmax(0, 1fr))",
      },
      gridTemplateRows: {
        "14": "repeat(14, minmax(0, 1fr))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

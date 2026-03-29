import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A237E",
          light: "#283593",
        },
        accent: {
          DEFAULT: "#F9A825",
        },
        danger: {
          DEFAULT: "#B71C1C",
        },
        success: {
          DEFAULT: "#2E7D32",
        },
        surface: {
          dark: "#263238",
          dark2: "#37474F",
          light: "#F5F7FA",
          light2: "#ECEFF1",
        },
        "text-main": "#212121",
        "text-secondary": "#546E7A",
        border: "#CFD8DC",
        action: "#1565C0",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "IBM Plex Sans", "sans-serif"],
      },
      fontSize: {
        table: ["13px", { lineHeight: "1.4" }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

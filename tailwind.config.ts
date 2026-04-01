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
          DEFAULT: "#004489",
          light: "#0056B3",
        },
        accent: {
          DEFAULT: "#E20025",
        },
        danger: {
          DEFAULT: "#E20025",
        },
        success: {
          DEFAULT: "#2E7D32",
        },
        surface: {
          dark: "#004489",
          light: "#F5F7FA",
        },
        "text-main": "#000000",
        "text-secondary": "#B5ABA1",
        border: "#DCDCDC",
        vinci: {
          bleu: "#004489",
          "bleu-dark": "#003370",
          "bleu-light": "#0056B3",
          "bleu-xlight": "#E5EFF8",
          rouge: "#E20025",
          "rouge-dark": "#B8001E",
          "rouge-xlight": "#FDEAED",
          gris: "#B5ABA1",
          "gris-light": "#F0F0F0",
          noir: "#000000",
        },
      },
      fontFamily: {
        sans: ["Arial", "Helvetica Neue", "Helvetica", "sans-serif"],
      },
      fontSize: {
        table: ["13px", { lineHeight: "1.4" }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

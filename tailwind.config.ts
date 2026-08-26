import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bronze: "#9c6b3e",
        bronzeDark: "#6b4423",
        gold: "#c9a15e",
        goldDark: "#a6790f",
        charcoal: "#1c1712",
        ivory: "#f7f1e6",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)"],
        cairo: ["var(--font-cairo)"],
        inter: ["var(--font-inter)"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #d9b46f 0%, #a6790f 45%, #6b4423 100%)",
        "gold-gradient-soft": "linear-gradient(135deg, #f7f1e6 0%, #c9a15e 100%)",
        "bronze-gradient": "linear-gradient(135deg, #9c6b3e 0%, #6b4423 100%)",
      },
    },
  },
  plugins: [],
};
export default config;

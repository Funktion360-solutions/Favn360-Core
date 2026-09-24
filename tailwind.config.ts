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
        funktion: {
          blue: "#141969",
          pale: "#F4F6FB",
          line: "#D9DEEA"
        }
      },
      boxShadow: {
        calm: "0 8px 24px rgba(20, 25, 105, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

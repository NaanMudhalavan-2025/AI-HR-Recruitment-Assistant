/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#14171C",
        surface: "#1B1F26",
        raised: "#232833",
        hairline: "#2E3440",
        ink: "#E7E9EE",
        muted: "#8A93A3",
        faint: "#5B6472",
        accent: "#E3A542",
        accentSoft: "#3A311E",
        good: "#4FAE8E",
        goodSoft: "#1C332C",
        risk: "#D9736B",
        riskSoft: "#3A2323",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
        md: "6px",
      },
    },
  },
  plugins: [],
};

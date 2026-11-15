import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        pocket: {
          bg: "#0B0E17",
          card: "#141926",
          elevated: "#1B2234",
          surface: "#181E2D",
          border: "#232C42",
          borderLight: "#2E3A56",
          muted: "#66728C",
          mutedForeground: "#8E99B3",
          accent: "#6B53FF",
          accentPurple: "#8F44FD",
          accentCyan: "#06B6D4",
          income: "#10B981",
          expense: "#FFFFFF",
        },
      },
      backgroundImage: {
        "purple-gradient": "linear-gradient(135deg, #5B4DFF 0%, #7E46FC 50%, #9D43FE 100%)",
        "card-gradient": "linear-gradient(145deg, #181E2D 0%, #131724 100%)",
        "glow-gradient": "radial-gradient(circle at 50% 0%, rgba(107, 83, 255, 0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "purple-glow": "0 10px 30px -5px rgba(107, 83, 255, 0.35)",
        "purple-glow-sm": "0 4px 15px -2px rgba(107, 83, 255, 0.25)",
        "card-subtle": "0 8px 24px -4px rgba(0, 0, 0, 0.4)",
        "dock": "0 -10px 35px -5px rgba(0, 0, 0, 0.6)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Poppins'", "system-ui", "-apple-system", "sans-serif"],
        poppins: ["'Poppins'", "sans-serif"],
        jakarta: ["'Plus Jakarta Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;


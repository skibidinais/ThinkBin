import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./screens/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ThinkBin Custom Color Tokens (tb-*)
        "tb-green": {
          primary: "#58cc02",
          dark: "#4caf00",
          deep: "#458807",
          light: "#8de423",
          dock: "#7cbd73",
          "dock-border": "#65a35b",
          "dock-active": "#a3cca0",
          "dock-active-border": "#bce2b8",
          grass: "#4da325",
          check: "#2ecc71",
          "check-glow": "#27ae60",
          emerald: "#318B35",
        },
        "tb-sky": {
          50: "#f0f9ff",
          100: "#e8f7fe",
          200: "#bae6fd",
          primary: "#1cb0f6",
          dark: "#1899d6",
          blue: "#3f82e2",
          navy: "#205493",
        },
        "tb-gold": {
          coin: "#fbc02d",
          dark: "#f57f17",
          light: "#fff59d",
          amber: "#ffc800",
          yellow: "#f5b82e",
          "yellow-dark": "#d39a1c",
          warm: "#FFA800",
        },
        "tb-wood": {
          light: "#8B5A2B",
          main: "#4a270f",
          dark: "#261307",
          border: "#7c4e18",
          sand: "#E2D3B8",
          cream: "#FDE8A5",
        },
        "tb-purple": {
          deep: "#1e093d",
          main: "#2b0d52",
          light: "#3e1672",
          card: "#240a45",
          "card-border": "#3c146d",
          header: "#8a62dc",
          "header-dark": "#764dc9",
        },
        "tb-text": {
          dark: "#382C22",
          muted: "#796F65",
          black: "#161514",
          body: "#3c3c3c",
          subtle: "#8e73be",
        },
        "tb-gray": {
          50: "#fafafa",
          100: "#f4f4f4",
          200: "#e5e5e5",
          300: "#d4d4d4",
          border: "#e5e5e5",
        }
      },
      fontFamily: {
        fredoka: ["var(--font-fredoka)", "Fredoka", "sans-serif"],
        nunito: ["var(--font-nunito)", "Nunito", "sans-serif"],
      },
      boxShadow: {
        "tb-btn-green": "0 6px 0 #4caf00",
        "tb-btn-green-active": "0 2px 0 #4caf00",
        "tb-btn-blue": "0 5px 0 #1899d6",
        "tb-btn-amber": "0 5px 0 #d39a1c",
        "tb-dock": "0 8px 24px rgba(101, 163, 91, 0.35), 0 2px 6px rgba(0, 0, 0, 0.1)",
        "tb-card": "0 8px 16px rgba(0, 0, 0, 0.08)",
        "tb-pill": "0 3px 0 rgba(0, 0, 0, 0.15)",
      },
      borderRadius: {
        "tb-dock": "36px",
        "tb-card": "24px",
        "tb-pill": "20px",
        "tb-unit": "22px",
      }
    },
  },
  plugins: [],
};

export default config;

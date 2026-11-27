import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { ivory: "#FDF8E4", champagne: "#E8D8C5", burgundy: "#6B2335", charcoal: "#1C2716", gold: "#B89A63" },
    fontFamily: { display: ["var(--font-playfair)", "serif"], body: ["var(--font-inter)", "sans-serif"] }
  } },
  plugins: []
} satisfies Config;

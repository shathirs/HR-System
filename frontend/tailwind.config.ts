import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#64748B",
        success: "#16A34A",
        danger: "#DC2626",
        warning: "#F59E0B",
        surface: "#F8FAFC",
      },
      fontSize: {
        heading: "24px",
        subheading: "18px",
        body: "14px",
        caption: "12px",
      },
    },
  },
};

export default config;

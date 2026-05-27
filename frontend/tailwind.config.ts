import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f4f4f1",
        ember: "#ef4d2f",
        line: "#e7e5df"
      },
      boxShadow: {
        soft: "0 18px 40px rgba(17, 17, 17, 0.08)",
        card: "0 1px 2px rgba(17, 17, 17, 0.05)"
      }
    }
  },
  plugins: []
};

export default config;

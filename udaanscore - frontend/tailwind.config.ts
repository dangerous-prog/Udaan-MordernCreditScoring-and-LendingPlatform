// Tailwind v4 — primary configuration is in app/globals.css via @theme {}
// This file is kept for editor tooling compatibility.
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;

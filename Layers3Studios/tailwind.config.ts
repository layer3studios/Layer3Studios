import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 18px 60px rgba(0,0,0,0.45)",
      },
      backgroundImage: {
        "radial-soft":
          "radial-gradient(1200px circle at 20% 0%, rgba(99,102,241,0.22), transparent 55%), radial-gradient(900px circle at 80% 20%, rgba(236,72,153,0.16), transparent 55%), radial-gradient(900px circle at 50% 100%, rgba(34,197,94,0.10), transparent 55%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        valentine: {
          pink: "#F7CAC9",
          red: "#D63447",
          cream: "#FFF5E1",
          gold: "#D4AF37",
          soft: "#B34E56",
        },
      },
    },
  },
  plugins: [],
};

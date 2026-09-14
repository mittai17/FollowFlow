/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: '#E4E7EC',
        background: '#F7F8FA',
      },
      borderRadius: {
        '2xl': '20px',
      },
    },
  },
  plugins: [],
};

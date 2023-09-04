import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        login: "url('../../public/login-background.webp')",
        'book-preview': "url('../../public/book-preview.webp')",
        register: "url('../../public/register-bg.webp')"
      },
      colors: {
        pink: '#FBA1B7',
        black: '#3a3a3a'
      },
      fontFamily: {
        hayward: 'Hayward',
        montserrat: 'Montserrat',
      }
    },
  },
  plugins: [],
} satisfies Config;

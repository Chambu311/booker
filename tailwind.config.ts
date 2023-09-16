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
        black: '#3a3a3a',
        'light-pink': '#FDE5EC',
        grey: '#D3D3D3',
        platinum: '#E5E4E2'
      },
      fontFamily: {
        hayward: 'Hayward',
        montserrat: 'Montserrat',
      },
      boxShadow: {
        normal: '0px 2px 5px #d9d9d9',
      },
      borderRadius: {
        normal: '10px'
      }
    },
  },
  plugins: [],
} satisfies Config;

import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        login: "url('../../public/login-background.webp')",
        "book-preview": "url('../../public/book-preview.webp')",
        register: "url('../../public/register-bg.webp')",
      },
      colors: {
        pink: "#FF90BB",
        black: "#3a3a3a",
        "light-pink": "#FDE5EC",
        grey: "#D3D3D3",
        platinum: "#E5E4E2",
        green: "#a0d911",
        cream: "#FBF4EA",
        lavender: "#E6D6F5",
        blue: "#ECF7FF",
        peach: "#F8EEEB",
        purple: "#9376E0",
        "dark-purple": "#2A2F4F",
      },
      fontFamily: {
        hayward: "Hayward",
        montserrat: "Montserrat",
      },
      boxShadow: {
        normal: "0px 2px 5px #d9d9d9",
      },
      borderRadius: {
        normal: "10px",
        small: "5px",
      },
      transitionProperty: {
        "opacity-button": "ease 0.7s",
      },
      border: {
        custom: "solid 1.5px #E5E4E2",
      }
    },
  },
  plugins: [],
} satisfies Config;

// pink: '#FBA1B7',

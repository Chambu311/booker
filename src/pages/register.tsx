import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function Register() {
  return (
    <div className="relative grid h-[100vh] grid-cols-1 place-items-center bg-register bg-cover bg-no-repeat font-montserrat">
      <div className="absolute left-10 top-10 font-hayward text-[40px] text-white">
        Booker
      </div>
      <div className="relative flex min-h-[500px] w-[500px] justify-center rounded-[5px]">
        <div className="absolute z-0 h-full w-full rounded-[5px] bg-pink opacity-70"></div>
        <div className="z-10 h-full w-full p-10">
          <div className="my-5 text-center text-[25px] font-black text-white">
            Registre su cuenta
          </div>
          <form action="grid grid-cols-1 h-full gap-10">
            <div className="flex flex-col">
              <label htmlFor="name" className="text-white">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                required
                className="h-10 rounded-[5px] px-4 text-black focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="name" className="text-white">
                Apellido
              </label>
              <input
                type="text"
                required
                name="name"
                className="h-10 rounded-[5px] px-4 text-black focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="name" className="text-white">
                Email
              </label>
              <input
                type="email"
                required
                name="name"
                className="h-10 rounded-[5px] px-4 text-black focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="name" className="text-white">
                Contraseña
              </label>
              <input
                type="text"
                required
                name="name"
                className="h-10 rounded-[5px] px-4 text-black focus:outline-none"
              />
            </div>
            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                className="bg-trasparent register-btn rounded-[5px] border-[1px] border-white p-3 font-bold text-white"
              >
                Registrarse
              </button>
            </div>
          </form>
          <Link href="/">
            <div className="mt-4 flex justify-center text-center transition-transform hover:scale-105">
              Ya poseo una cuenta de Booker
            </div>
          </Link>
        </div>
      </div>
      <style jsx>
        {`
          .register-btn {
            transition:
              color ease 0.7s,
              background-color ease 0.7s;
          }

          .register-btn:hover {
            color: #fba1b7;
            background-color: white;
          }
        `}
      </style>
    </div>
  );
}

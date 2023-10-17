import Link from "next/link";
import { useState } from "react";
import BookEffect from "~/components/ui/book-effect";
const CoolPage = () => {
  const [open, setIsOpen] = useState(false);
  
  return (
    <div className="relative grid h-screen w-screen place-content-center bg-login bg-cover bg-center bg-no-repeat font-montserrat">
      <div className="pointer-events-none fixed z-40 grid h-full w-full place-content-center">
        {open ? (
          <div className="login-fade bg-b pointer-events-auto min-h-[500px] w-[500px] rounded-normal p-10 border-[1px] border-black bg-white shadow-lg">
            <form>
              <div className="flex flex-col gap-5">
                <p className="text-center font-bold text-[30px]">Bienvenido</p>
                <label className="">Email</label>
                <input
                  type="email"
                  required
                  name="email"
                  className="h-9 rounded-small bg-platinum text-black"
                />
                <label className="text-carissma-50">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="h-9 rounded-small bg-platinum text-black"
                />
                <button
                  type="submit"
                  className="login-btn primary-btn mt-10"
                >
                  Ingresar
                </button>
                <Link href="/auth/signup" className="text-center">
                    No tengo cuenta
                </Link>
              </div>
            </form>
          </div>
        ) : null}
      </div>
      <div className="" onClick={() => setIsOpen(!open)}>
        <BookEffect open={open} />
      </div>
    </div>
  );
};
export default CoolPage;

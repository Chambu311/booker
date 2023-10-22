import { TRPCError } from "@trpc/server";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import BookEffect from "~/components/ui/book-effect";
import { LoadingSpinner } from "~/components/ui/loading";
import { api } from "~/utils/api";

export default function SignUp() {
  const createUser = api.user.createUser.useMutation();
  const router = useRouter();

  const parseErrorMessage = (message: string) => {
    if (message.includes("Username")) {
      return "El nombre de usuario ingresado ya existe, seleccione otro";
    } else {
      return "Ya existe una cuenta registrada a ese email";
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const name = data.get("name") as string;
    createUser.mutate(
      { email, password, name },
      {
        onSuccess: async () => {
          e.target.reset();
          await router.push("/auth/signin");
        },
        onError: (opts) => {
          toast.error(parseErrorMessage(opts.message));
        },
      },
    );
  };

  const handleKeyPress = (e: any) => {
    if (e.key === " " || e.keyCode === 32) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative grid h-screen  w-screen place-content-center overflow-hidden bg-register bg-cover bg-no-repeat font-montserrat">
      <Toaster position="top-center" />
      <div className="relative flex min-h-[500px] w-[500px] flex-col rounded-normal bg-white align-middle">
        <div className="z-10 mt-10 text-center text-[30px] font-bold text-black">
          Registrar
        </div>
        <form className="z-20 flex flex-col gap-5 p-10" onSubmit={handleSubmit}>
          <div className="text-[20px]">Nombre de usuario</div>
          <input
            required
            type="text"
            name="name"
            onKeyDown={handleKeyPress}
            maxLength={30}
            minLength={5}
            className="h-10 rounded-small bg-platinum px-3"
            placeholder="Martin1998"
          />
          <div className="text-[20px]">Email</div>
          <input
            required
            type="email"
            onKeyDown={handleKeyPress}
            name="email"
            className="h-10 rounded-small bg-platinum px-3"
            placeholder="martin1998@gmail.com"
          />
          <div className="text-[20px]">Contraseña</div>
          <input
            required
            type="password"
            name="password"
            maxLength={20}
            onKeyDown={handleKeyPress}
            minLength={10}
            className="h-10 rounded-small bg-platinum px-3"
            placeholder="*********"
          />
          <button
            type="submit"
            className="primary-btn mt-10 flex justify-center !p-3 text-[20px]"
          >
            {createUser.isLoading ? (
              <div className="flex gap-5">
                Registrando <LoadingSpinner color="border-white" />
              </div>
            ) : (
              <div className="">Registrarse</div>
            )}
          </button>
          <div
            className="flex cursor-pointer justify-center italic"
            onClick={() => router.push("/")}
          >
            Ya tengo cuenta
          </div>
        </form>
      </div>
    </div>
  );
}

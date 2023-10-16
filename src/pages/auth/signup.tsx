import { TRPCError } from "@trpc/server";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
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
  return (
    <div className="grid h-screen w-screen place-content-center bg-register bg-cover bg-no-repeat font-montserrat">
      <Toaster position="top-center" />
      <div className="relative flex min-h-[500px] w-[500px] flex-col rounded-normal bg-white align-middle">
        <div className="z-10 mt-10 text-center text-[30px] font-bold text-black">
          Registrar
        </div>
        <form className="z-10 flex flex-col gap-5 p-10" onSubmit={handleSubmit}>
          <div className="text-[20px]">Nombre de usuario</div>
          <input
            required
            type="text"
            name="name"
            maxLength={20}
            minLength={5}
            className="h-9 rounded-small bg-platinum"
          />
          <div className="text-[20px]">Email</div>
          <input
            required
            type="email"
            name="email"
            className="h-9 rounded-small bg-platinum"
          />
          <div className="text-[20px]">Contraseña</div>
          <input
            required
            type="password"
            name="password"
            maxLength={20}
            minLength={10}
            className="h-9 rounded-small bg-platinum"
          />
          <button
            type="submit"
            className="mt-10 flex justify-center rounded-small bg-pink p-3 text-[18px] font-bold text-white"
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

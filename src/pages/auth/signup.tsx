import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function SignUp() {
  const createUser = api.user.createUser.useMutation();
  const router = useRouter();

  function handleSubmit(e: any) {
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
        onError: () => {
          e.target.reset();
          window.alert("Error al registrarse");
        },
      },
    );
  }
  return (
    <div className="grid h-screen w-screen place-content-center bg-register bg-cover bg-no-repeat font-montserrat">
      <div className="relative flex min-h-[500px] w-[500px] flex-col rounded-normal bg-white align-middle">
        <div className="z-10 mt-10 text-center text-[30px] font-bold text-black">
          Registrar
        </div>
        <form className="z-10 flex flex-col gap-5 p-10" onSubmit={handleSubmit}>
          <div className="text-[20px]">Nombre completo</div>
          <input
            required
            type="text"
            name="name"
            className="h-9 rounded-small bg-platinum"
          />
          <div className="text-[20px]">Email</div>
          <input
            required
            type="text"
            name="email"
            className="h-9 rounded-small bg-platinum"
          />
          <div className="text-[20px]">Contraseña</div>
          <input
            required
            type="password"
            name="password"
            className="h-9 rounded-small bg-platinum"
          />
          <button
            type="submit"
            className="mt-10 rounded-small bg-pink p-3 text-[18px] font-bold text-white"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}

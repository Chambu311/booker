import { GetServerSidePropsContext, NextPage } from "next";
import { signIn, getProviders, useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";
import { mdiGithub, mdiGoogle } from "@mdi/js";
import MdIcon from "~/components/ui/mdIcon";
import { useState } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import BookEffect from "~/components/ui/book-effect";
const Signin: NextPage<{ csrfToken: never; providers: never }> = ({
  providers,
}) => {
  const router = useRouter();
  const [open, setIsOpen] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const login = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (login?.error) {
      toast.error("Credenciales invalidas", {
        duration: 4000,
      });
      e.target.reset();
    } else {
      await router.push("/home");
    }
  };
  return (
    <div className="relative grid h-screen w-screen place-content-center bg-login bg-cover bg-center bg-no-repeat font-montserrat">
      <Toaster position="top-center" />
      <div
        className={`background pointer-events-none fixed z-40 grid ${
          open ? "bg-black bg-opacity-70" : ""
        } h-full w-full place-content-center`}
      >
        {open ? (
          <div className="login-fade bg-b pointer-events-auto min-h-[500px] w-[500px] rounded-normal flex flex-col gap-y-5 border-[1px] border-black bg-white p-10 shadow-lg">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <p className="text-center text-[30px] font-bold">Bienvenido</p>
                <label className="">Email</label>
                <input
                  type="email"
                  required
                  name="email"
                  className="h-9 rounded-small bg-platinum text-black"
                />
                <label className="text-black">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="h-9 rounded-small bg-platinum text-black"
                />
                <button
                  type="submit"
                  className="login-btn primary-btn mt-10 text-[20px]"
                >
                  Ingresar
                </button>
              </div>
            </form>
            <div className="h-[1px] w-full bg-platinum" />
            {providers &&
              Object.values(providers).map((provider: any) => {
                return provider.name.includes("GitHub") ? (
                  <div
                    key={provider?.name}
                    style={{ marginBottom: 0 }}
                    className="flex justify-center"
                  >
                    <button
                      className="primary-btn flex gap-4 !bg-black"
                      type="button"
                      onClick={() =>
                        signIn(provider.id, { callbackUrl: "/home" })
                      }
                    >
                      <MdIcon
                        path={
                          provider.name.includes("GitHub")
                            ? mdiGithub
                            : mdiGoogle
                        }
                        color="white"
                        size={1}
                      />
                      Sign in with {provider.name}{" "}
                    </button>
                  </div>
                ) : null;
              })}
            <Link href="/auth/signup" className="text-center">
              No tengo cuenta
            </Link>
          </div>
        ) : null}
      </div>
      <div className="" onClick={() => setIsOpen(!open)}>
        <BookEffect open={open} />
      </div>
      <style jsx>
        {`
          .background {
            transition:
              background-color ease 0.7s,
              opacity ease 0.7s;
          }
        `}
      </style>
    </div>
  );
};

export default Signin;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session) {
    return { redirect: { destination: "/home" } };
  }
  const providers = await getProviders();
  return {
    props: { providers: providers ?? [] },
  };
}

{
  /* <main className="flex h-[100vh] overflow-y-hidden bg-white font-montserrat">
      <Toaster position="top-center" />
      <div className="relative h-full w-[70%] bg-login bg-cover bg-no-repeat"></div>
      <div className="relative flex h-full w-[30%] justify-center bg-white p-10">
        <div
          className="absolute bottom-5 left-3 cursor-pointer rounded-small bg-platinum p-2"
          onClick={() => router.push("/auth/signup")}
        >
          No tengo cuenta
        </div>
        <div className="flex flex-col gap-10">
          <div className="text-center font-hayward text-[70px] text-pink">
            Booker
          </div>
          <div className="flex flex-col items-center gap-5">
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="flex flex-col gap-5">
                <label className="">Email</label>
                <input
                  type="email"
                  required
                  name="email"
                  className="h-9 w-[230px] rounded-small bg-platinum text-black"
                />
                <label className="">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="h-9 rounded-small bg-platinum text-black"
                />
                <button
                  type="submit"
                  className="login-btn mt-5 rounded-small bg-pink p-3 text-[18px] font-bold text-white"
                >
                  Ingresar
                </button>
              </div>
            </form>
            <div className="h-[1px] w-full bg-platinum" />
            {providers &&
              Object.values(providers).map((provider: any) => {
                return provider.name.includes("GitHub") ? (
                  <div key={provider?.name} style={{ marginBottom: 0 }}>
                    <button
                      className="login-btn font-lg flex items-center gap-3 rounded-[10px] bg-pink p-5 font-bold text-white"
                      onClick={() =>
                        signIn(provider.id, { callbackUrl: "/home" })
                      }
                    >
                      <MdIcon
                        path={
                          provider.name.includes("GitHub")
                            ? mdiGithub
                            : mdiGoogle
                        }
                        color="white"
                        size={1}
                      />
                      Sign in with {provider.name}{" "}
                    </button>
                  </div>
                ) : null;
              })}
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .login-btn {
            transition: opacity 0.7s ease;
          }
          .login-btn:hover {
            opacity: 0.6;
          }
        `}
      </style>
    </main> */
}

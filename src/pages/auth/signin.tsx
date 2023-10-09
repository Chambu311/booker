import { GetServerSidePropsContext, NextPage } from "next";
import { signIn, getProviders, useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";
import { mdiGithub, mdiGoogle } from "@mdi/js";
import MdIcon from "~/components/ui/mdIcon";
import { useState } from "react";
import { useRouter } from "next/router";
const Signin: NextPage<{ csrfToken: never; providers: never }> = ({
  providers,
}) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function handleSubmit() {
    try {
      const userFound = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/home",
      });
      console.log("reponse", userFound);
    } catch (error) {
      console.log("error", error);
      window.alert("Invalid credentials");
    }
  }
  return (
    <main className="flex h-[100vh] overflow-y-hidden bg-white font-montserrat">
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
            <div className="">
              <div className="flex flex-col gap-5">
                <div className="">Email</div>
                <input
                  type="text"
                  required
                  name="email"
                  onChange={(e: any) => setEmail(e.target.value)}
                  className="h-9 w-[230px] rounded-small bg-platinum text-black"
                />
                <div className="">Contraseña</div>
                <input
                  type="password"
                  name="password"
                  required
                  onChange={(e: any) => setPassword(e.target.value)}
                  className="h-9 rounded-small bg-platinum text-black"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="login-btn mt-5 rounded-small bg-pink p-3 text-[18px] font-bold text-white"
                >
                  Ingresar
                </button>
              </div>
            </div>
            <div className="h-[1px] w-full bg-platinum" />
            <div className="flex justify-center">Or</div>
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
    </main>
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

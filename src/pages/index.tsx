import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <main className="flex h-[100vh] overflow-y-hidden bg-white font-montserrat">
      <div className="relative h-full w-[70%] bg-login bg-cover bg-no-repeat"></div>
      <div className="flex h-full w-[30%] justify-center bg-white p-10">
        <div className="flex flex-col gap-10">
          <div className="text-center font-hayward text-[50px] text-pink">
            Booker
          </div>
          <div className="rounded-[5px] border-[1px] p-5 shadow-xl">
            <form className="flex flex-col gap-5">
              <label htmlFor="email" className="text-[15px] text-black">
                Email
              </label>
              <input
                type="text"
                name="email"
                placeholder="email"
                className="h-10 w-[300px] border-b-[1px] px-1 focus:outline-none"
              />
              <label htmlFor="email" className="text-[15px] text-black">
                Contraseña
              </label>
              <input
                type="password"
                name=""
                placeholder="password"
                className="h-10 w-[300px] rounded-[5px] border-b-[1px]  px-1 text-black focus:outline-none"
              />
              <button
                type="submit"
                className="login-btn rounded-[5px] mt-10 bg-pink p-2 text-center text-[18px] font-bold text-white"
              >
                Ingresar
              </button>
            </form>
          </div>
          <Link href="/register">
            <div className="text-center italic text-black transition-transform hover:scale-105">
              No recuerdo mi contraseña
            </div>
          </Link>
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
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}

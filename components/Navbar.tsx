import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
export default function Navbar() {
  const session = useSession();
  return (
    <div className="min-h-10 fixed top-0 z-[999] flex w-full bg-pink p-5 px-10 align-middle font-montserrat text-white">
      <div className="my-auto flex w-[80%] justify-center gap-20">
        <div
          className="link text-white"
          onClick={() => {
            void signOut({ callbackUrl: "/" });
          }}
        >
          Salir
        </div>
      </div>
      <div className="flex w-[20%] gap-5 align-middle">
        <div className="grid place-content-center rounded-full border border-white p-2 ">
          <div className="mdi mdi-account text-[30px] text-white"></div>
        </div>
        <div className="flex flex-col">
          <div className="m-auto text-white">@ {session.data?.user.name}</div>
        </div>
      </div>
      <style jsx>
        {`
          .link {
            transition: border ease 0.3s;
            cursor: pointer;
          }
          .link:hover {
            border-bottom: 2px solid white;
          }
        `}
      </style>
    </div>
  );
}

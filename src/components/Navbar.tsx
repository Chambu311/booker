import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { mdiAccount, mdiLocationExit, mdiMagnify } from "@mdi/js";
import MdIcon from "./mdIcon";
import Image from "next/image";
interface INavbar {
  onSearchSubmit?: (input: unknown) => void;
}
export default function Navbar(props: INavbar) {
  const session = useSession();
  return (
    <div className="justify-between fixed top-0 z-50  flex h-[80px] w-full items-center bg-pink font-montserrat text-white">
      <Link href="/home">
        <div className="absolute left-5 top-0 cursor-pointer font-hayward text-[40px]">
          Booker
        </div>
      </Link>
      <div className="mx-10 flex w-[80%] justify-center">
        <form
          className="flex gap-4 align-middle"
          onSubmit={props.onSearchSubmit}
        >
          <label htmlFor="search my-auto">
            <MdIcon
              path={mdiMagnify}
              color="white"
              size={1}
              className="scale-[1.3]"
            />
          </label>
          <input
            className="h-[30px] w-[300px] rounded-[5px] px-3 focus:outline-black"
            placeholder="The lord of the rings"
          />
        </form>
      </div>
      <div className="flex w-[20%] gap-5 text-white">
        <div className="grid place-content-center rounded-[50%] border border-white p-3">
          {session.data?.user.image ? (
            <Image
              src={session.data.user.image}
              alt=""
              width={30}
              height={30}
              className="rounded-[50%]"
            />
          ) : (
            <MdIcon path={mdiAccount} size={1} color={"white"} />
          )}
        </div>
        <Link href={`/profile`} className="my-auto">
          <div className="text-xl">@{session.data?.user.name}</div>
        </Link>
        <div
          className="grid place-content-center"
          onClick={() => void signOut({ callbackUrl: "/" })}
        >
          <MdIcon
            path={mdiLocationExit}
            size={1}
            color="white"
            className="cursor-pointer transition-transform hover:scale-[1.2]"
          />
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

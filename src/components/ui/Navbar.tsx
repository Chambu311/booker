import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { mdiAccount, mdiBell, mdiLocationExit, mdiMagnify } from "@mdi/js";
import MdIcon from "./mdIcon";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import NotificationDropdown from "../notification-dropdown";
import { User } from "@prisma/client";

export default function Navbar() {
  const session = useSession();
  const searchParams = useSearchParams();
  const initialSearchValue = searchParams.get("search");
  const [search, setSearch] = useState<string>(initialSearchValue ?? "");

  const cleanStringForUrl = (input: string) => {
    input = input.toLowerCase();
    input = input.replace(/[áàäâ]/g, "a");
    input = input.replace(/[éèëê]/g, "e");
    input = input.replace(/[íìïî]/g, "i");
    let cleanedString = input.replace(/[^a-z0-9\s-]/g, ""); // Keep spaces and hyphens
    cleanedString = cleanedString.replace(/\s+/g, "-"); // Replace spaces with hyphens
    return cleanedString;
  };

  return (
    <div className="fixed top-0 z-50 flex  h-[80px] w-full items-center justify-between bg-carisma-400 px-5 text-white">
      <Link href="/home">
        <div className="absolute left-5 top-0 hidden cursor-pointer font-hayward text-[40px] xl:block">
          Booker
        </div>
        <div className="absolute left-5 top-0 block cursor-pointer font-hayward text-[40px] xl:hidden ">
          B
        </div>
      </Link>
      <div className="mx-10 flex w-[80%] justify-center">
        <input
          className="h-[30px] w-[300px] rounded-[5px] px-3 text-black focus:outline-black"
          placeholder="The lord of the rings"
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link
          href={`/home?search=${cleanStringForUrl(search)}`}
          className="search mx-5 my-auto cursor-pointer items-center"
        >
          <MdIcon
            path={mdiMagnify}
            color="white"
            size={1}
            className="scale-[1.3]"
          />
        </Link>
      </div>
      <div className="flex w-[40%] gap-5 text-white xl:w-[25%]">
        <NotificationDropdown user={session.data?.user as User} />
        <div
          style={{
            backgroundImage: `url('${session.data?.user.image ?? ""}')`,
          }}
          className="grid h-10 w-10 place-content-center rounded-[50%] border border-white bg-cover bg-center bg-no-repeat p-5 xl:h-14 xl:w-14"
        >
          {!session.data?.user.image ? (
            <MdIcon path={mdiAccount} size={1} color={"white"} />
          ) : null}
        </div>
        <Link
          href={`/profile/${session.data?.user.name}?view=library`}
          className="my-auto"
        >
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

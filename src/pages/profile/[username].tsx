import { useSession } from "next-auth/react";
import Navbar from "~/components/ui/Navbar";
import MdIcon from "~/components/ui/mdIcon";
import { mdiAccount, mdiBook } from "@mdi/js";
import Image from "next/image";
import { mdiBookmarkBoxMultiple } from "@mdi/js";
import { mdiSwapHorizontalCircleOutline } from "@mdi/js";
import { useState } from "react";
import LibraryView from "~/components/profile/library-view";
import { GetServerSidePropsContext } from "next";
import { prisma } from "~/server/db";
import { User } from "@prisma/client";

const Profile = (props: { user: User }) => {
  const [tab, setTab] = useState<number>(0);
  const { user } = props;
  const session = useSession();
  const isMyProfile = session.data?.user.id === props.user.id;
  function switchTab(index: number) {
    setTab(index);
  }

  return (
    <>
      <header className="pb-20">
        <Navbar />
      </header>
      <div className="h-screen w-full bg-white p-10 font-montserrat">
        <div className="flex gap-10">
          <div className="flex w-[20%] flex-col">
            <div className="w-full flex-col rounded-[10px] px-10 py-10 shadow-normal">
              <div className="flex justify-center">
                <div className="flex-col">
                  <div className="mx-auto grid h-[150px] w-[150px] place-content-center rounded-[50%] border-[2px] border-black p-5">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt=""
                        width={100}
                        height={100}
                        className="rounded-[50%]"
                      />
                    ) : (
                      <MdIcon
                        path={mdiAccount}
                        color="black"
                        className="text-pink"
                        size={3}
                      />
                    )}
                  </div>
                  <div className="flex justify-center">
                    <div className="mb-10 mt-5 text-center text-[25px]">
                      {user.name}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 text-[18px]">
                <div className="flex gap-3 align-middle">
                  <MdIcon path={mdiBook} size={1} color="black" />
                  <span className="cursor-pointer" onClick={() => switchTab(0)}>
                    Librería
                  </span>
                </div>
                {isMyProfile ? (
                  <div className="flex gap-3">
                    <MdIcon
                      path={mdiSwapHorizontalCircleOutline}
                      size={1}
                      color="black"
                    />
                    <span
                      className="cursor-pointer"
                      onClick={() => switchTab(2)}
                    >
                      Mis intercambios
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="w-[80%] flex-col rounded-normal p-10 shadow-normal">
            {tab === 0 ? <LibraryView userId={user.id ? user.id : ""} isMyUser={isMyProfile} /> : null}
          </div>
        </div>
        <style jsx>
          {`
            .add-col {
              transition: transform ease 0.7s;
              cursor: pointer;
            }

            .add-col:hover {
              transform: scale(1.1);
            }
          `}
        </style>
      </div>
    </>
  );
};

export default Profile;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const username = ctx.params?.username as string;
  const userFound = await prisma.user.findUnique({
    where: {
      email: username ?? "",
    },
    include: {
      books: true,
    },
  });
  const parsedUser = {
    ...userFound,
    emailVerified: JSON.parse(JSON.stringify(userFound?.emailVerified)),
  };
  return {
    props: {
      user: parsedUser,
    },
  };
}

import { useSession } from "next-auth/react";
import Navbar from "~/components/ui/Navbar";
import MdIcon from "~/components/ui/mdIcon";
import { mdiBook, mdiChartBar, mdiCog, mdiStar } from "@mdi/js";
import { mdiSwapHorizontalCircleOutline } from "@mdi/js";
import { useState } from "react";
import LibraryView from "~/components/profile/library-view";
import { GetServerSidePropsContext } from "next";
import { prisma } from "~/server/db";
import { User } from "@prisma/client";
import SwapRequestsView from "~/components/profile/swap-requests-view";
import ProfileSettings from "~/components/profile/profile-settings";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import ModalForm from "~/components/ui/modal";
import { Toaster, toast } from "react-hot-toast";
import MetricsView from "~/components/profile/metrics-view";

const Profile = (props: { user: User }) => {
  const { user } = props;
  const [rating, setRating] = useState<number>(3);
  const [reviewModal, setReviewModal] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();
  const tabView = searchParams.get("view") ?? null;
  const isMyProfile = session.data?.user.id === props.user?.id;
  const reviewsRatingQuery = api.userReview.getUserReviewsRating.useQuery({
    userId: user?.id,
  });
  const reviewMutation = api.userReview.createReview.useMutation();
  const canPostReviewQuery = api.userReview.canIPostAReview.useQuery({
    fromUserId: session.data?.user.id ?? "",
    toUserId: user?.id,
  });

  const onReviewSubmit = async (input: any) => {
    input.preventDefault();
    toast.loading("Enviando...", {
      id: "loading",
    });
    const data = new FormData(input.target);
    const comment = data.get("comment") as string;
    await reviewMutation.mutateAsync(
      {
        rating,
        comment,
        fromUserId: session.data?.user?.id ?? "",
        toUserId: user.id,
      },
      {
        onSuccess: async () => {
          toast.dismiss("loading");
          setReviewModal(false);
          await canPostReviewQuery.refetch();
        },
      },
    );
  };
  return (
    <>
      <header className="pb-20">
        <Navbar />
      </header>
      <Toaster />
      <div className="w-full bg-white p-10">
        <div className="flex justify-center gap-10">
          <div className="flex w-[20%] flex-col">
            <div className="w-full flex-col rounded-[10px] px-10 py-10 shadow-normal">
              <div className="flex justify-center">
                <div className="flex-col">
                  <div
                    style={{
                      backgroundImage: `url('${user?.image ? user.image : ""}')`,
                    }}
                    className="mx-auto h-[150px] w-[150px] rounded-[50%] border-[2px]  border-black bg-cover bg-center bg-no-repeat p-5"
                  ></div>
                  <div className="relative flex justify-center">
                    <div className="mb-10 mt-5 text-center text-[25px]">
                      {user?.name}
                    </div>
                    {reviewsRatingQuery.data && !isMyProfile ? (
                      <div className="absolute bottom-4 flex">
                        <p className="text-xl">{reviewsRatingQuery.data}</p>
                        <MdIcon
                          path={mdiStar}
                          size={0.8}
                          color="gold"
                          className="my-auto"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <ul className="grid grid-cols-1 gap-5 text-[18px]">
                <li className="flex gap-3 align-middle">
                  <MdIcon path={mdiBook} size={1} color="black" />
                  <span
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/profile/${user.name}?view=library`)
                    }
                  >
                    Librería
                  </span>
                </li>
                {isMyProfile ? (
                  <>
                    <li className="flex gap-3">
                      <MdIcon
                        path={mdiSwapHorizontalCircleOutline}
                        size={1}
                        color="black"
                      />
                      <span
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/profile/${user.name}?view=swaps`)
                        }
                      >
                        Mis intercambios
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <MdIcon path={mdiCog} size={1} color="black" />
                      <span
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/profile/${user.name}?view=settings`)
                        }
                      >
                        Configuración
                      </span>
                    </li>
                    {user.role === "ADMIN" ? (
                      <li className="flex gap-3">
                        <MdIcon path={mdiChartBar} size={1} color="black" />
                        <span
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(`/profile/${user.name}?view=metrics`)
                          }
                        >
                          Métricas
                        </span>
                      </li>
                    ) : null}
                  </>
                ) : !isMyProfile && canPostReviewQuery.data ? (
                  <li
                    className="flex gap-3"
                    onClick={() => setReviewModal(true)}
                  >
                    <MdIcon path={mdiStar} size={1} color="black" />
                    <span className="cursor-pointer">Puntuar experiencia</span>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
          <div className="w-[80%] flex-col rounded-normal p-10 shadow-normal">
            {tabView === "library" ? (
              <LibraryView userId={user?.id} isMyUser={isMyProfile} />
            ) : tabView === "swaps" && isMyProfile ? (
              <SwapRequestsView user={user} />
            ) : tabView === "settings" && isMyProfile ? (
              <ProfileSettings user={user} />
            ) : tabView === "metrics" &&
              user.role === "ADMIN" &&
              isMyProfile ? (
              <MetricsView />
            ) : null}
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
      <div style={{ display: reviewModal ? "block" : "none" }}>
        <ModalForm
          title={`¿Como fue tu experiencia con ${user.name}?`}
          style="w-[500px]"
        >
          <div className="flex flex-col">
            <div className="flex justify-center gap-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  onMouseLeave={() => setHoveredIndex(0)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onClick={() => setRating(index + 1)}
                >
                  <MdIcon
                    path={mdiStar}
                    color={
                      hoveredIndex >= index || rating - 1 >= index
                        ? "#f83c7c"
                        : "grey"
                    }
                    size={2}
                    className="cursor-pointer rounded-small !bg-platinum"
                  />
                </div>
              ))}
            </div>
            <form onSubmit={onReviewSubmit} className="mt-2 flex flex-col p-5">
              <label className="my-3 after:mx-2 after:text-sm after:italic after:content-['(opcional)']">
                Comentarios
              </label>
              <textarea
                className="max-h-[300px] rounded-normal bg-platinum p-3"
                name="comment"
              />
              <div className="mt-5 flex justify-end gap-5">
                <button
                  onClick={() => setReviewModal(false)}
                  type="button"
                  className="secondary-btn"
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </ModalForm>
      </div>
    </>
  );
};

export default Profile;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const username = ctx.params?.username as string;
  const userFound = await prisma.user.findUnique({
    where: {
      name: username,
    },
    include: {
      books: true,
    },
  });
  return {
    props: {
      user: JSON.parse(JSON.stringify(userFound)),
    },
  };
}

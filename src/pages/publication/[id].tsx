import { GetServerSidePropsContext } from "next";
import {
  BookWithPublications,
  PublicationData,
} from "~/components/ui/book-card";
import { prisma } from "~/server/db";
import Image from "next/image";
import Navbar from "~/components/ui/Navbar";
import { api } from "~/utils/api";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { LoadingPage, LoadingSpinner } from "~/components/ui/loading";
import toast, { Toaster } from "react-hot-toast";
import Carousel from "~/components/ui/carousel";

export default function PublicationDetail(props: {
  publication: PublicationData;
}) {
  const { publication } = props;
  const session = useSession();
  const bookQuery = api.book.findById.useQuery({
    id: publication.book.id,
  });
  const book = bookQuery.data as BookWithPublications;
  const userQuery = api.user.findById.useQuery({ id: book?.userId });
  const swapQuery = api.swap.findSwapByUsersIdsAndBookId.useQuery({
    holderId: book?.userId,
    requesterId: session.data?.user.id ?? "",
    holderBookId: book?.id,
  });
  const newSwapMutation = api.swap.createInitialSwapRequest.useMutation();

  if (bookQuery.isLoading) {
    return <LoadingPage />;
  }
  const onClickSendSwapRequest = () => {
    newSwapMutation.mutate(
      {
        requesterId: session.data?.user.id ?? "",
        holderId: book.userId,
        holderBookId: book.id,
      },
      {
        onSuccess: async () => {
          await swapQuery.refetch();
          toast.success("Solicitud enviada con éxito.");
        },
        onError: () => {
          toast.error("Ya has seleccionado este libro en otra solicitud");
        },
      },
    );
  };
  return (
    <>
      <nav className="pb-20">
        <Navbar />
      </nav>
      <div className="flex flex-col p-10 font-montserrat">
        <Toaster position="top-center" />
        <div className="flex h-[500px] gap-10">
          <div className="w-[50%] bg-carisma-50">
            <Carousel slides={publication.images} />
          </div>
          <div className="platinum-border relative flex w-[50%] flex-col gap-y-3 rounded-normal px-10 py-2 shadow-lg">
            <div className="my-3 flex justify-end italic text-black">
              <span className="text-[20px] text-blue">
                @{userQuery?.data?.name ?? userQuery?.data?.email}
              </span>
            </div>
            <div className="font-montserrat text-[20px] text-black">
              <b>Titulo: </b>
              {book?.title}
            </div>
            <div className="text-[20px] text-black">
              <b>Autor: </b>
              {book?.author}
            </div>
            <div className="flex flex-col gap-y-2">
              <p className="text-[20px] font-bold text-black">Descripción :</p>
              <p className="text-[18px]">{book.description}</p>
            </div>
            <div className="flex flex-col gap-y-2">
              <p className="text-[20px] font-bold text-black">Comentarios :</p>
              <p className="text-[18px]">{publication.comment}</p>
            </div>
            <div className="absolute bottom-5 flex gap-x-5">
              {!swapQuery.data ? (
                <button
                  onClick={onClickSendSwapRequest}
                  className="secondary-btn"
                >
                  {newSwapMutation.isLoading ? (
                    <div className="flex justify-center gap-5">
                      <p>Enviando...</p>
                      <LoadingSpinner color="border-pink" />
                    </div>
                  ) : (
                    <p>Enviar solicitud de intercambio</p>
                  )}
                </button>
              ) : (
                <div className="rounded-small bg-green p-2 text-[18px] font-bold text-white">
                  Solicitud enviada
                </div>
              )}
              <Link href={`/profile/${userQuery?.data?.name}`}>
                <button className="primary-btn">
                  Ver mas publicaciones del usuario
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const pubId = ctx.params?.id as string;
  const pubFound = await prisma.bookPublication.findUnique({
    where: { id: pubId ?? "" },
    include: {
      book: true,
      images: true,
    },
  });
  const parsedDatePub = {
    ...pubFound,
    createdAt: JSON.parse(JSON.stringify(pubFound?.createdAt)),
    updatedAt: JSON.parse(JSON.stringify(pubFound?.updatedAt)),
  };
  return {
    props: {
      publication: parsedDatePub,
    },
  };
}

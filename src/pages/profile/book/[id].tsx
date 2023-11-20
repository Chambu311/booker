import { Book, BookStatus } from "@prisma/client";
import { prisma } from "~/server/db";
import { GetServerSidePropsContext } from "next";
import Navbar from "~/components/ui/Navbar";
import AWS, { S3 } from "aws-sdk";
import { v4 as uuid } from "uuid";
import { ChangeEvent, useState } from "react";
import { mdiLoading } from "@mdi/js";
import { api } from "~/utils/api";
import Image from "next/image";
import MdIcon from "~/components/ui/mdIcon";
import { useRouter } from "next/router";
import { LoadingPage } from "~/components/ui/loading";
import { useSession } from "next-auth/react";
import Carousel from "~/components/ui/carousel";
import { BookWithImages } from "~/components/ui/book-card";
import toast, { Toaster } from "react-hot-toast";

export default function PublishBook(props: { book: BookWithImages }) {
  const { book } = props;
  const updateBookStatusMutation = api.book.updateBookStatus.useMutation();
  const router = useRouter();
  const session = useSession();

  const onUpdateBookStatus = (status: BookStatus) => {
    toast.loading("Actualizando...");
    updateBookStatusMutation.mutate(
      { status, bookId: book.id },
      {
        onSuccess: () => {
          toast.dismiss();
          router.reload()
        },
      },
    );
  };

  return (
    <div className="">
      <Toaster />
      <header className="pb-20">
        <Navbar />
      </header>
      <div className="grid grid-cols-2">
        <div className="relative flex flex-col p-10">
          <div
            className="w-20 cursor-pointer rounded-small bg-platinum px-3 text-black"
            onClick={() => router.push(`/profile/${session.data?.user.name}?view=library`)}
          >
            Volver
          </div>

          <div className="banner my-5 w-full rounded-normal p-5 shadow-normal">
            <h1 className="text-[30px]">{book.title}</h1>
            <h2 className="text-[25px] italic">{book.author}</h2>
            <div className="flex gap-10 my-10">
              <div
                className={`secondary-btn ${
                  book.status === "PUBLISHED"
                    ? "bg-green text-white"
                    : "bg-platinum text-black"
                }`}
              >
                Estado: {book.status}
              </div>
              <div className="">
                {book.status === "PUBLISHED" ? (
                  <button
                    onClick={() => onUpdateBookStatus("NOT_PUBLISHED")}
                    className="primary-btn my-auto"
                  >
                    Pausar publicación
                  </button>
                ) : book.status === "NOT_PUBLISHED" ? (
                  <button
                    onClick={() => onUpdateBookStatus("PUBLISHED")}
                    className="primary-btn"
                  >
                    Publicar
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <div className="w-full rounded-normal bg-platinun p-10 shadow-lg gap-y-4 flex-col flex min-h-[200px]">
            <p className="text-black text-[25px] font-bold">Descripción</p>
            <p>{book.description}</p>
          </div>
        </div>
        <div className="m-10 bg-carisma-50 max-h-[500px]">
          <Carousel slides={book?.images ?? []} />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const bookId = ctx.params?.id as string;
  const bookFound = await prisma.book.findUnique({
    where: { id: bookId ? bookId : "" },
    include: {
      images: true,
    },
  });
  return {
    props: {
      book: bookFound,
    },
  };
}

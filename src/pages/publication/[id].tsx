import { GetServerSidePropsContext } from "next";
import { Carousel } from "react-responsive-carousel";
import { BookWithPublications, PublicationData } from "~/components/book-card";
import { prisma } from "~/server/db";
import Image from "next/image";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Navbar from "~/components/Navbar";
import { api } from "~/utils/api";

export default function PublicationDetail(props: {
  publication: PublicationData;
}) {
  const { publication } = props;
  const bookQuery = api.book.findById.useQuery({
    id: publication.book.id,
  });
  const book = bookQuery.data as BookWithPublications;
  const userQuery = api.user.findById.useQuery({ id: book?.userId });
  return (
    <>
      <nav className="pb-20">
        <Navbar />
      </nav>
      <div className="flex flex-col p-10 font-montserrat">
        <div className="flex gap-10">
          <div className="w-[50%]">
            <Carousel
              className="grid place-content-center rounded-normal object-cover shadow-lg"
              showThumbs={false}
            >
              {publication?.images?.map((img, index) => (
                <Image
                  src={img.src}
                  key={index}
                  alt="slider"
                  className="h-[500px] w-[500px]"
                  width={200}
                  height={200}
                  quality={100}
                />
              ))}
            </Carousel>
          </div>
          <div className="flex w-[50%] flex-col relative gap-y-3 rounded-normal p-10 shadow-lg">
            <div className="flex justify-end">
              <div className="my-3 w-[50%] rounded-small border-[1px] border-black p-3 text-black shadow-lg">
                <span>@{userQuery?.data?.name ?? userQuery?.data?.email}</span>
              </div>
            </div>
            <div className="font-montserrat text-[27px] text-black">
              <b>Titulo: </b>
              {book?.title}
            </div>
            <div className=" text-[27px] text-black">
              <b>Autor: </b>
              {book?.author}
            </div>
            <div className="flex absolute gap-x-5 bottom-5">
              <button className="rounded-normal border-[1px] border-pink p-2 text-pink text-[18px]">
                Enviar solicitud de intercambio
              </button>
              <button className="rounded-normal border-[1px] border-pink p-2 text-pink text-[18px]">
                Ver mas publicaciones del usuario
              </button>
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

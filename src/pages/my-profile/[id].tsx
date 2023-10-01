import { Book, BookPublication } from "@prisma/client";
import { prisma } from "~/server/db";
import { GetServerSidePropsContext } from "next";
import Navbar from "~/components/Navbar";
import AWS, { S3 } from "aws-sdk";
import { v4 as uuid } from "uuid";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { ChangeEvent, useState } from "react";
import { mdiLoading } from "@mdi/js";
import { api } from "~/utils/api";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";
import MdIcon from "~/components/mdIcon";
import { useRouter } from "next/router";

export default function PublishBook(props: { book: Book }) {
  const [fileList, setFileList] = useState<FileList | null>();
  const { book } = props;
  const router = useRouter();
  const createPublication = api.publication.createPublication.useMutation();
  const publicationQuery = api.publication.findByBookId.useQuery({
    id: book.id,
  });
  const publication = publicationQuery.data;
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFileList(e.target.files);
  }

  async function handleUploadImages(input: any) {
    input.preventDefault();
    const keys: string[] = [];
    if (!fileList) {
      window.alert("Seleccione al menos una imagen");
      return;
    }
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    });
    const s3 = new S3();
    const formData = new FormData(input.target);
    const comment = formData.get("comment") as string;
    for (const file of [...fileList]) {
      const uploadResult = await s3
        .upload({
          Bucket: "booker-tesis",
          Body: file,
          Key: `booker-image-${book.title}-${uuid()}`,
          ContentType: "image/png",
        })
        .promise();

      const img = uploadResult.Location;
      keys.push(img);
    }
    createPublication.mutate(
      {
        bookId: book.id,
        imgs: keys,
        comment,
      },
      {
        onSuccess: async () => {
          await publicationQuery.refetch();
        },
      },
    );
  }
  return (
    <div className="">
      <header className="pb-20">
        <Navbar />
      </header>
      <div className="grid grid-cols-2">
        <div className="relative flex flex-col p-10">
          <div
            className="w-20 cursor-pointer rounded-small bg-platinum px-3 text-black"
            onClick={() => router.push("/my-profile")}
          >
            Volver
          </div>
          {!publicationQuery.isLoading ? (
            <div className="m-5 w-full rounded-normal p-5 shadow-normal">
              <h1 className="text-[30px]">{book.title}</h1>
              <h2 className="text-[25px] italic">{book.author}</h2>
              <div className="flex gap-10">
                <div
                  className={`my-3 w-[200px] rounded-small ${
                    publication?.isActive ? "bg-green" : "bg-platinum"
                  } border-[1px] p-1`}
                >
                  Estado: {publication?.isActive ? "Publicado" : "No publicado"}
                </div>
                {publication?.isActive ? (
                  <button
                    type="button"
                    className="my-3 w-[200px] cursor-pointer rounded-small bg-red-400 p-1 text-white"
                  >
                    Pausar publicación
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="absolute bottom-0 left-[50%] h-10 w-10 animate-spin rounded-[50%] border-[2px] border-pink border-t-transparent p-3"></div>
          )}
          {!publication && !publicationQuery.isLoading ? (
            <form
              className="flex w-[40%] flex-col gap-5 p-5"
              onSubmit={handleUploadImages}
            >
              <textarea
                name="comment"
                className="w-[400px] rounded-normal bg-platinum p-5"
                placeholder="e.g libro en buenas condiciones, algunas anotaciones"
              />
              <p className="text-[20px] font-bold">Imagenes</p>
              <input
                className="w-[300px] rounded-small bg-pink text-white"
                type="file"
                multiple
                onChange={(e) => handleFileChange(e)}
                accept="image/*"
              />
              <button
                type="submit"
                className="mt-5 w-[200px] rounded-small bg-pink p-2 font-bold text-white"
              >
                {createPublication.isLoading ? (
                  <div className="flex justify-center gap-3">
                    <p>Publicando...</p>
                    <MdIcon path={mdiLoading} spin size={1} color="white" />
                  </div>
                ) : (
                  <p>Publicar</p>
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-5 p-5">
              <span className="text-[30px] font-bold italic">Comentarios</span>
              <p className="text-[20px]">{publication?.comment}</p>
            </div>
          )}
        </div>
        <div className="m-10 h-full">
          <Carousel
            showThumbs={false}
            className="grid place-content-center rounded-normal bg-light-pink"
          >
            {publication?.images?.map((img, index) => (
              <Image
                src={img.src}
                key={index}
                alt="slider"
                className="h-[400px] w-[400px]"
                width={100}
                height={100}
                quality={100}
              />
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const bookId = ctx.params?.id as string;
  const bookFound = await prisma.book.findUnique({
    where: { id: bookId ? bookId : "" },
  });
  return {
    props: {
      book: bookFound,
    },
  };
}

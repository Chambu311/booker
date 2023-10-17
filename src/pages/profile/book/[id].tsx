import { Book } from "@prisma/client";
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

export default function PublishBook(props: { book: Book }) {
  const [fileList, setFileList] = useState<FileList | null>();
  const { book } = props;
  const router = useRouter();
  const session = useSession();
  const createPublication = api.publication.createPublication.useMutation();
  const pausePublication = api.publication.pausePublication.useMutation();
  const publicationQuery = api.publication.findByBookId.useQuery({
    id: book.id,
  });
  const publication = publicationQuery.data;
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileList(e.target.files);
  };

  if (publicationQuery.isLoading) return <LoadingPage />;

  const handleUploadImages = async (input: any) => {
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
  };
  return (
    <div className="">
      <header className="pb-20">
        <Navbar />
      </header>
      <div className="grid grid-cols-2">
        <div className="relative flex flex-col p-10">
          <div
            className="w-20 cursor-pointer rounded-small bg-platinum px-3 text-black"
            onClick={() => router.push(`/profile/${session.data?.user.name}`)}
          >
            Volver
          </div>

          <div className="m-5 w-full banner rounded-normal p-5 shadow-normal">
            <h1 className="text-[30px]">{book.title}</h1>
            <h2 className="text-[25px] italic">{book.author}</h2>
            <div className="flex gap-10">
              <div
                className={`my-3 w-[200px] rounded-small text-center font-bold ${
                  publication?.isActive
                    ? "bg-green text-white"
                    : "bg-platinum text-black"
                } border-[1px] p-1`}
              >
                Estado: {publication?.isActive ? "Publicado" : "No publicado"}
              </div>
              {publication?.isActive && publication ? (
                <button
                  type="button"
                  onClick={() =>
                    pausePublication.mutate(
                      {
                        id: publication.id,
                        isActive: false,
                      },
                      {
                        onSuccess: async () => {
                          await publicationQuery.refetch();
                        },
                      },
                    )
                  }
                  className="my-3 w-[200px] cursor-pointer primary-btn"
                >
                  {pausePublication.isLoading ? (
                    <div className="flex justify-center gap-3">
                      <p>Pausando...</p>
                      <MdIcon path={mdiLoading} spin size={1} color="white" />
                    </div>
                  ) : (
                    <p>Pausar publicación</p>
                  )}
                </button>
              ) : publication && !publication.isActive ? (
                <button
                  type="button"
                  onClick={() =>
                    pausePublication.mutate(
                      {
                        id: publication?.id ?? "",
                        isActive: true,
                      },
                      {
                        onSuccess: async () => {
                          await publicationQuery.refetch();
                        },
                      },
                    )
                  }
                  className="my-3 w-[200px] cursor-pointer primary-btn"
                >
                  {pausePublication.isLoading ? (
                    <div className="flex justify-center gap-3">
                      <p>Publicando...</p>
                      <MdIcon path={mdiLoading} spin size={1} color="white" />
                    </div>
                  ) : (
                    <p>Reanudar publicación</p>
                  )}
                </button>
              ) : null}
            </div>
          </div>
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
                className="w-[300px] rounded-small bg-carisma-500 text-white"
                type="file"
                multiple
                onChange={(e) => handleFileChange(e)}
                accept="image/*"
              />
              <button
                type="submit"
                className="mt-5 w-[200px] primary-btn"
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
        <div className="m-10 bg-carisma-50">
          <Carousel slides={publication?.images ?? []} />
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

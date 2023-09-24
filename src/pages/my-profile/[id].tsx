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

export default function PublishBook(props: { book: Book }) {
  const [fileList, setFileList] = useState<FileList | null>();
  const { book } = props;
  const createPublication = api.publication.createPublication.useMutation();
  const publicationQuery = api.publication.findByBookId.useQuery({
    id: book.id,
  });
  const publication = publicationQuery.data
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFileList(e.target.files);
  }

  async function handleUploadImages() {
    const keys: string[] = [];
    if (!fileList) {
      window.alert("Seleccione al menos una imagen");
      return;
    }
    AWS.config.update({
      accessKeyId: "AKIAZO5K35H4SPMDHNX3",
      secretAccessKey: "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",
    });
    const s3 = new S3();
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
      <div className="flex flex-col p-10">
        <div className="m-5">
          <h1 className="text-[30px]">{book.title}</h1>
          <h2 className="text-[25px] italic">{book.author}</h2>
          <div className="my-3 w-[200px] rounded-small border-[1px] border-pink p-1">
            Estado: {publication?.isActive ? "Publicado" : "No publicado"}
          </div>
        </div>
        {!publication ? (
          <>
            <input
              name="images"
              className="w-[300px] rounded-small bg-pink text-white"
              type="file"
              multiple
              onChange={(e) => handleFileChange(e)}
              accept="image/*"
            />
            <button
              type="button"
              className="mt-5 w-[200px] rounded-small bg-pink p-2 font-bold text-white"
              onClick={() => handleUploadImages()}
            >
              {createPublication.isLoading ? (
                <div className="flex justify-center gap-3">
                  <p>Subiendo...</p>
                  <MdIcon path={mdiLoading} spin size={1} color="white" />
                </div>
              ) : (
                <p>Subir</p>
              )}
            </button>
          </>
        ) : null}
        <Carousel className="grid w-[40%]  place-items-center rounded-normal border-[1px] border-pink bg-light-pink">
          {publication?.images?.map((img, index) => (
            <div className="" key={index}>
              <Image src={img.src} alt="slider" width={200} height={200} />
            </div>
          ))}
        </Carousel>
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

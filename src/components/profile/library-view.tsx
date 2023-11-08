import { mdiPlus } from "@mdi/js";
import MdIcon from "../ui/mdIcon";
import { api } from "~/utils/api";
import { ChangeEvent, useState } from "react";
import Modal from "../ui/modal";
import BookCard, { BookWithImages, LightBookCard } from "../ui/book-card";
import { Book } from "@prisma/client";
import { useRouter } from "next/router";
import AddBookModal, { CreateBookInput } from "./add-book-modal";
import toast, { Toaster } from "react-hot-toast";
import { LoadingSpinner } from "../ui/loading";
import AWS, { S3 } from "aws-sdk";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useForm } from "react-hook-form";

export default function LibraryView(props: {
  userId: string;
  isMyUser: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const form = useForm<CreateBookInput>();
  const [fileList, setFileList] = useState<FileList | null>();
  const [animationParent] = useAutoAnimate();
  const router = useRouter();
  const [isDeleteBookModalOpen, setIsDeleteBookModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookWithImages>();
  const genreListQuery = api.genre.getAll.useQuery();
  const bookMutation = api.book.createBook.useMutation();
  const updateBookMutation = api.book.updateBook.useMutation();
  const deleteBookMutation = api.book.deleteBook.useMutation();
  const bookQuery = api.book.getAllByUserId.useQuery({
    userId: props.userId,
    isPublished: !props.isMyUser,
  });
  const bookList = bookQuery.data;

  const onClickDeleteBook = (book: BookWithImages) => {
    setSelectedBook(book);
    setIsDeleteBookModalOpen(true);
  };

  const onFileUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileList(e.target.files);
  };

  const onConfirmDeleteBook = () => {
    setIsDeleteBookModalOpen(false);
    toast.loading("Eliminando...", {
      icon: <LoadingSpinner color="border-carisma-500" />,
      id: "delete-book",
    });
    deleteBookMutation.mutate(
      { id: selectedBook?.id ?? "" },
      {
        async onSuccess() {
          await bookQuery.refetch();
          setSelectedBook(undefined);
          toast.dismiss("delete-book");
        },
      },
    );
  };

  const onClickCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(undefined);
    form.reset();
  };

  const onClickEditBook = (book: BookWithImages) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const onFormSubmit = async (data: CreateBookInput) => {
    const keys: string[] = [];
    if (!fileList && !selectedBook) {
      toast.error("Ingrese al menos una imagen");
      return;
    }
    toast.loading("Guardando...", {
        id: "create-book",
    });

    if (fileList)  {
        AWS.config.update({
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
        });
        const s3 = new S3();
        for (const file of [...fileList]) {
          const uploadResult = await s3
            .upload({
              Bucket: "booker-tesis",
              Body: file,
              Key: `booker-image-${data.title}-${crypto.randomUUID()}`,
              ContentType: "image/png",
            })
            .promise();
    
          const img = uploadResult.Location;
          keys.push(img);
        }
    }
    if (!selectedBook) {
      bookMutation.mutate(
        {
          title: data.title,
          author: data.author,
          genre: data.genre,
          userId: props.userId,
          description: data.description,
          imgs: keys,
        },
        {
          async onSuccess() {
            await bookQuery.refetch();
            setIsModalOpen(false);
            toast.dismiss("create-book");
            form.reset();
          },
        },
      );
    } else {
      updateBookMutation.mutate(
        {
          title: data.title,
          author: data.author,
          genre: data.genre,
          description: data.description,
          imgs: keys,
          id: selectedBook.id,
        },
        {
          async onSuccess() {
            await bookQuery.refetch();
            setIsModalOpen(false);
            setSelectedBook(undefined);
            toast.dismiss("create-book");
          },
        },
      );
    }
    setFileList(undefined);
  };
  return (
    <div className="relative max-w-full">
      <Toaster />
      {props.isMyUser ? (
        <div
          className="absolute -bottom-5 right-10 cursor-pointer hover:scale-[1.3]"
          onClick={() => setIsModalOpen(true)}
        >
          <MdIcon path={mdiPlus} color="black" size={1.5} className="my-aut" />
        </div>
      ) : null}
      <div className="border-b-[1px] border-b-black pb-2 align-middle text-black">
        <div className="flex gap-10">
          <span className="text-[35px]">Libreria</span>
        </div>
      </div>
      {!bookQuery.isLoading || !bookQuery.isRefetching ? (
        <div
          ref={animationParent}
          className="grid max-h-[600px] w-full grid-cols-3 gap-5 overflow-y-auto p-5"
        >
          {bookList?.map((book: BookWithImages) => {
            return (
              <div
                className="relative flex w-[200px] cursor-pointer flex-col gap-y-4"
                key={book.id}
              >
                {props.isMyUser ? (
                  <>
                    <BookCard
                      book={book}
                      onClickDelete={onClickDeleteBook}
                      onClickEdit={onClickEditBook}
                    />
                    {book.status === "PUBLISHED" ? (
                      <div className="flex">
                        <div className="rounded-small bg-green p-1 text-center text-sm font-bold text-white">
                          Publicado
                        </div>
                      </div>
                    ) : book.status === "NOT_PUBLISHED" ? (
                      <div className="flex">
                        <div className="rounded-small bg-platinum p-1 text-center text-sm font-bold text-black">
                          No publicado
                        </div>
                      </div>
                    ) : (
                      <div className="flex">
                        <div className="rounded-small bg-carisma-500 p-1 text-center text-sm font-bold text-white">
                          Intercambiado
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div onClick={() => router.push(`/publication/${book.id}`)}>
                    <LightBookCard bookId={book.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-40 flex h-full w-full justify-center align-middle">
          <div className="">Loading</div>
        </div>
      )}
      <div className="modal" style={{ display: isModalOpen ? "block" : "none" }}>
        <AddBookModal
          onClickCloseModal={onClickCloseModal}
          onFormSubmit={onFormSubmit}
          genreList={genreListQuery.data}
          onFileChange={onFileUploadChange}
          files={fileList}
          form={form}
          book={selectedBook ?? undefined}
        />
      </div>
      <div style={{ display: isDeleteBookModalOpen ? "block" : "none" }}>
        <Modal title="Eliminar libro" style="h-[280px] w-[400px] relative">
          <div className=" flex flex-col gap-y-5">
            <p className="text-balance text-[18px]">
              ¿Seguro quieres eliminar este libro? Se eliminaran todas sus
              publicaciones y se cancelaran sus intercambios.
            </p>
            <div className="flex justify-end gap-5">
              <button
                onClick={() => setIsDeleteBookModalOpen(false)}
                type="button"
                className="bg-transparent text-[20px] text-carisma-300"
              >
                Salir
              </button>
              <button
                type="button"
                onClick={() => onConfirmDeleteBook()}
                className="rounded-small bg-red-600 p-2 font-bold text-white"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

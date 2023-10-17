import {
  mdiAccount,
  mdiPlus,
  mdiArrowLeft,
  mdiLoading,
  mdiCheck,
  mdiTrashCan,
} from "@mdi/js";
import MdIcon from "../ui/mdIcon";
import { api } from "~/utils/api";
import { useState } from "react";
import Modal from "../ui/modal";
import BookCard, { BookWithPublications, LightBookCard } from "../ui/book-card";
import { Book } from "@prisma/client";
import { useRouter } from "next/router";
import AddBookModal from "./add-book-modal";

export default function LibraryView(props: {
  userId: string;
  isMyUser: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [isDeleteBookModalOpen, setIsDeleteBookModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string>("");
  const genreListQuery = api.genre.getAll.useQuery();
  const bookMutation = api.book.createBook.useMutation();
  const deleteBookMutation = api.book.deleteBook.useMutation();
  const bookQuery = api.book.getAllByUserId.useQuery({
    userId: props.userId,
    isPublished: !props.isMyUser,
  });
  const bookList = bookQuery.data;

  const onClickDeleteBook = (id: string) => {
    setBookToDelete(id);
    setIsDeleteBookModalOpen(true);
  };

  const onConfirmDeleteBook = () => {
    deleteBookMutation.mutate(
      { id: bookToDelete },
      {
        async onSuccess() {
          setIsDeleteBookModalOpen(false);
          await bookQuery.refetch();
        },
      },
    );
  };

  const isBookPublicated = (book: BookWithPublications) => {
    return book.publications.some((pub) => pub.isActive);
  };

  const onClickCloseModal = () => {
    setIsModalOpen(false);
  };

  const onFormSubmit = (input: any) => {
    input.preventDefault();
    const formData = new FormData(input.target);
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const genre = formData.get("genre") as string;
    bookMutation.mutate(
      {
        title,
        author,
        genre: genre,
        userId: props.userId,
      },
      {
        async onSuccess() {
          await bookQuery.refetch();
        },
      },
    );
    if (!bookMutation.isLoading) {
      setIsModalOpen(false);
      input.target.reset();
    }
  };
  return (
    <div className="relative w-full">
      <div className="relative border-b-[1px] border-b-black pb-2 align-middle text-black">
        <div className="flex gap-10">
          <span className="text-[35px]">Libreria</span>
        </div>
        {props.isMyUser ? (
          <div className="add-col absolute -bottom-10 right-0 flex">
            <MdIcon path={mdiPlus} color="pink" size={1} className="my-auto" />
            <span
              className="my-auto cursor-pointer italic"
              onClick={() => setIsModalOpen(!isModalOpen)}
            >
              Agregar
            </span>
          </div>
        ) : null}
      </div>
      {!bookQuery.isLoading || !bookQuery.isRefetching ? (
        <div className="grid h-full w-full grid-cols-3 gap-5 p-5">
          {bookList?.map((book: BookWithPublications) => {
            return (
              <div
                className="relative flex w-[200px] cursor-pointer flex-col gap-y-4"
                key={book.id}
              >
                {props.isMyUser ? (
                  <>
                    <BookCard book={book} onClickDelete={onClickDeleteBook} />
                    {isBookPublicated(book) ? (
                      <div className="flex">
                        <div className="rounded-small bg-green p-1 text-center text-sm font-bold text-white">
                          Publicado
                        </div>
                      </div>
                    ) : (
                      <div className="flex">
                        <div className="rounded-small bg-platinum p-1 text-center text-sm font-bold text-black">
                          No publicado
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                    <div onClick={() => router.push(`/publication/${book.publications[0]?.id}`)}>
                        <LightBookCard book={book} />
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
      <div style={{ display: isModalOpen ? "block" : "none" }}>
        <AddBookModal
          onClickCloseModal={onClickCloseModal}
          onFormSubmit={onFormSubmit}
          genreList={genreListQuery.data}
        />
      </div>
      <div style={{ display: isDeleteBookModalOpen ? "block" : "none" }}>
        <Modal title="Eliminar libro" style="">
          <div className="flex justify-end gap-10">
            <button
              onClick={() => setIsDeleteBookModalOpen(false)}
              type="button"
              className="bg-transparent text-[20px] text-pink"
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
        </Modal>
      </div>
    </div>
  );
}

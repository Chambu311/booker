import {
  mdiAccount,
  mdiPlus,
  mdiArrowLeft,
  mdiLoading,
  mdiCheck,
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
                className="relative w-[200px] cursor-pointer"
                key={book.id}
                onClick={async () => {
                  if (props.isMyUser) {
                    await router.push(`/profile/book/${book.id}`);
                  } else {
                    await router.push(
                      `/publication/${book.publications[0]?.id}`,
                    );
                  }
                }}
              >
                {props.isMyUser ? (
                  <BookCard book={book} onClickDelete={onClickDeleteBook} />
                ) : (
                  <LightBookCard book={book} />
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
        <Modal title="Eliminar libro">
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

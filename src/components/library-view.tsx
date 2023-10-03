import { mdiAccount, mdiPlus, mdiArrowLeft, mdiLoading, mdiCheck } from "@mdi/js";
import MdIcon from "./mdIcon";
import { api } from "~/utils/api";
import { useState } from "react";
import Modal from "./modal";
import BookCard, { BookWithPublications } from "./book-card";
import { Book } from "@prisma/client";
import { useRouter } from "next/router";


export default function LibraryView(props: { userId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter()
  const [isDeleteBookModalOpen, setIsDeleteBookModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string>("");
  const genreListQuery = api.genre.getAll.useQuery();
  const bookMutation = api.book.createBook.useMutation();
  const deleteBookMutation = api.book.deleteBook.useMutation();
  const bookQuery = api.book.getAllByUserId.useQuery({
    userId: props.userId,
  });
  const bookList = bookQuery.data;

  function onClickDeleteBook(id: string) {
    setBookToDelete(id);
    setIsDeleteBookModalOpen(true);
  }

  function onConfirmDeleteBook() {
    deleteBookMutation.mutate(
      { id: bookToDelete },
      {
        async onSuccess() {
          setIsDeleteBookModalOpen(false);
          await bookQuery.refetch();
        },
      },
    );
  }

  function onFormSubmit(input: any) {
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
  }
  return (
    <div className="relative w-full">
      <div className="relative border-b-[1px] border-b-black pb-2 align-middle text-black">
        <div className="flex gap-10">
          <span className="text-[35px]">Mi libreria</span>
        </div>
        <div className="add-col absolute -bottom-10 right-0 flex">
          <MdIcon path={mdiPlus} color="pink" size={1} className="my-auto" />
          <span
            className="my-auto cursor-pointer italic"
            onClick={() => setIsModalOpen(!isModalOpen)}
          >
            Agregar
          </span>
        </div>
      </div>
      {!bookQuery.isLoading || !bookQuery.isRefetching ? (
        <div className="grid h-full w-full grid-cols-3 gap-5 p-5">
          {bookList?.map((book: BookWithPublications) => (
            <div className="cursor-pointer relative w-[200px]" key={book.id} onClick={() => router.push(`/my-profile/${book.id}`)}>
              <BookCard
                book={book}
                onClickDelete={onClickDeleteBook}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-40 flex h-full w-full justify-center align-middle">
          <div className="">Loading</div>
        </div>
      )}
      <div style={{ display: isModalOpen ? "block" : "none" }}>
        <Modal title="Añadir libro">
          <form className="flex flex-col gap-2" onSubmit={onFormSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-[15px]">
                Título
              </label>
              <input
                type="text"
                name="title"
                className="w-[70%] rounded-small bg-platinum px-3"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-[15px]">
                Autor
              </label>
              <input
                type="text"
                name="author"
                className="w-[70%] rounded-small bg-platinum px-3"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-[15px]">
                Género
              </label>
              <select
                name="genre"
                className="h-7 w-[70%] rounded-small bg-platinum px-3"
              >
                {genreListQuery.data?.map((genre) => (
                  <option key={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-10 flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                type="button"
                className="bg-transparent text-[20px] text-red-600"
              >
                Salir
              </button>
              <button
                type="submit"
                className="rounded-small bg-pink p-2 font-bold text-white"
              >
                Guardar
              </button>
            </div>
          </form>
        </Modal>
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

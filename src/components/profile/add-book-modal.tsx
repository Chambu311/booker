import { Genre } from "@prisma/client";
import Modal from "../ui/modal";
import Carousel from "../ui/carousel";
import { useEffect, useRef, useState } from "react";
import { BookWithImages } from "../ui/book-card";
import { UseFormReturn, useForm } from "react-hook-form";
interface IAddBookModal {
  onFormSubmit: (e: any) => void;
  onClickCloseModal: () => void;
  genreList: Genre[] | undefined;
  files?: FileList | null | undefined;
  onFileChange: (e: any) => void;
  book?: BookWithImages | undefined;
  form: UseFormReturn<CreateBookInput, any, undefined>;
}

export type CreateBookInput = {
  title: string;
  author: string;
  genre: string;
  description: string;
};

const AddBookModal = (props: IAddBookModal) => {
  const { form, book } = props;
  const bookImages: { src: string }[] = [];
  const [slides, setSlides] = useState<
    {
      src: string;
    }[]
  >([]);
  if (book && !props.files) {
    form.setValue("author", book.author);
    form.setValue("title", book.title);
    form.setValue("genre", book.genre.name);
    form.setValue("description", book.description ?? "");
    book.images.forEach((image) => bookImages.push({ src: image.src}))
  }
  const uploadRef = useRef(null) as any;
  useEffect(() => {
    if (props.files) {
      const filesAsArray = [...props.files];
      const images = filesAsArray.map((file) => {
        return {
          src: URL.createObjectURL(file),
        };
      });
      setSlides(images);
    } else {
      setSlides([]);
    }
  }, [props.files]);

  return (
    <Modal title={book ? "Editar libro" : "Añadir libro"} style="w-[900px]">
      <div className="flex h-full w-full gap-5">
        <form
          className="flex w-[50%] flex-col gap-y-5 overflow-y-auto overflow-x-hidden"
          onSubmit={form.handleSubmit(props.onFormSubmit)}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-[15px]">
              Título
            </label>
            <input
              {...form.register("title")}
              type="text"
              name="title"
              maxLength={40}
              required
              className="h-10 w-full rounded-small bg-platinum px-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-[15px]">
              Autor/es
            </label>
            <input
              {...form.register("author")}
              type="text"
              name="author"
              required
              className="h-10 w-full rounded-small bg-platinum px-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-[15px]">
              Género
            </label>
            <select
              {...form.register("genre")}
              name="genre"
              className="h-10 w-full rounded-small bg-platinum px-3"
            >
              {props.genreList?.map((genre) => (
                <option key={genre.id} value={genre.name}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-[15px]">
              Descripción
            </label>
            <textarea
              {...form.register("description")}
              name="description"
              placeholder="Decínos de que se trata"
              maxLength={200}
              required
              className=" max-h-[200px] w-full rounded-small bg-platinum p-3"
            />
          </div>
          <div className="mt-10 flex gap-10">
            <button
              onClick={() => {
                setSlides([]);
                props.onClickCloseModal();
              }}
              type="button"
              className="bg-transparent text-[20px] text-red-600"
            >
              Salir
            </button>
            <button type="submit" className="primary-btn">
              Guardar
            </button>
          </div>
        </form>
        <div className="relative flex h-full w-[50%] justify-center">
          <div className="m-auto flex h-full w-full flex-col gap-y-10">
            <div className="h-[400px] rounded-normal bg-carisma-50">
              <Carousel slides={bookImages.length > 0 ? bookImages : slides} />
            </div>
            <div className="flex h-[30%] justify-end">
              <input
                type="file"
                multiple
                ref={uploadRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => props.onFileChange(e)}
              />
              <button
                onClick={() => uploadRef?.current.click()}
                className="secondary-btn !h-10"
              >
                Subir imágenes
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddBookModal;

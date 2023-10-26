import { Genre } from "@prisma/client";
import Modal from "../ui/modal";
import Carousel from "../ui/carousel";
import { useState } from "react";
interface IAddBookModal {
  onFormSubmit: (e: any) => void;
  onClickCloseModal: () => void;
  genreList: Genre[] | undefined;
  files?: FileList | null | undefined;
  onFileChange: (e: any) => void;
}
const AddBookModal = (props: IAddBookModal) => {
  const files = props.files ? [...props.files] : [];
  const images = files.map((file) => URL.createObjectURL(file));
  return (
    <Modal title="Añadir libro" style="w-[900px] h-[600px]">
      <div className="flex h-full w-full gap-5">
        <form
          className="flex w-[50%] flex-col gap-y-5 overflow-y-auto overflow-x-hidden"
          onSubmit={props.onFormSubmit}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-[15px]">
              Título
            </label>
            <input
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
              name="description"
              placeholder="Decínos de que se trata"
              className=" w-full rounded-small bg-platinum p-3"
            />
          </div>
          <div className="mt-10 flex gap-10">
            <button
              onClick={() => props.onClickCloseModal()}
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
            <div className=" h-[70%]">
              <Carousel slides={images} />
            </div>
            <div className="h-[30%]">
              <input
                type="file"
                multiple
                accept="image/*"
                className=""
                onChange={(e) => props.onFileChange(e)}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddBookModal;

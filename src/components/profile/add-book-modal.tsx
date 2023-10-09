import { Genre } from "@prisma/client";
import Modal from "../ui/modal";
interface IAddBookModal {
  onFormSubmit: (e: any) => void;
  onClickCloseModal: () => void;
  genreList: Genre[] | undefined;
}
const AddBookModal = (props: IAddBookModal) => {
  return (
    <Modal title="Añadir libro">
      <form className="flex flex-col gap-2" onSubmit={props.onFormSubmit}>
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
            {props.genreList?.map((genre) => (
              <option key={genre.id}>{genre.name}</option>
            ))}
          </select>
        </div>
        <div className="mt-10 flex justify-between">
          <button
            onClick={() => props.onClickCloseModal()}
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
  );
};

export default AddBookModal;

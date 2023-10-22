import { Genre } from "@prisma/client";
import Modal from "../ui/modal";
interface IAddBookModal {
  onFormSubmit: (e: any) => void;
  onClickCloseModal: () => void;
  genreList: Genre[] | undefined;
}
const AddBookModal = (props: IAddBookModal) => {
  return (
    <Modal title="Añadir libro" style="w-[600px] min-h-[450px]">
      <form className="flex flex-col gap-2" onSubmit={props.onFormSubmit}>
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
            Autor
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
        <div className="mt-10 flex gap-10 justify-end">
          <button
            onClick={() => props.onClickCloseModal()}
            type="button"
            className="bg-transparent text-[20px] text-red-600"
          >
            Salir
          </button>
          <button
            type="submit"
            className="primary-btn"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddBookModal;

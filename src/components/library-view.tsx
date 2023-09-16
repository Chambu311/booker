import { mdiAccount, mdiPlus, mdiArrowLeft, mdiLoading } from "@mdi/js";
import CollectionCard from "./collection-card";
import MdIcon from "./mdIcon";
import { api } from "~/utils/api";
import { useState } from "react";
import { Catalog } from "@prisma/client";
import Modal from "./modal";
import ModalForm from "./modal";

interface ICatalogView {
  userId: string;
}

export default function LibraryView(props: ICatalogView) {
  const [isLoading, setIsLoading] = useState(false);
  const trpc = api.useContext();
  const [displayType, setDisplayType] = useState<string>("collections");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const catalogsQuery = api.catalog.getAllByUserId.useQuery({
    userId: props.userId,
  });
  const catalogs = catalogsQuery.data;
  const newCatalog = api.catalog.createCatalog.useMutation({
    onSettled: async () => {
      setIsLoading(true);
      await trpc.catalog.getAllByUserId.invalidate().then(() => {
        setIsLoading(false);
      });
    },
  });

  if (catalogsQuery.isLoading) {
    return (
      <div className="grid place-content-center items-center">
        <MdIcon size={3} color="#FBA1B7" path={mdiLoading} spin={true} />
      </div>
    );
  }

  function onChangeModal() {
    setIsModalOpen(!isModalOpen);
  }

  function onSwitchViewType(type: string) {
    setDisplayType(type);
  }

  function onFormSubmit(input: any) {
    input.preventDefault();
    const formData = new FormData(input.target);
    const catalogName = formData.get("name") as string;
    const catalogDesc = formData.get("desc") as string;
    newCatalog.mutate({
      name: catalogName,
      userId: props.userId,
      description: catalogDesc,
    });
    if (newCatalog.error) {
      window.alert("Error al crear catálogo");
      input.target.reset();
    } else {
      setIsModalOpen(false);
      input.target.reset();
    }
    return;
  }
  return (
    <div className="w-full">
      <div className="relative border-b-[1px] border-b-black pb-2 align-middle text-black">
        <div className="flex gap-10">
          <span className="text-[35px]">Mi libreria</span>
          <div className="my-auto">
            <select
              onChange={(type) => onSwitchViewType(type.target.value)}
              className="text-[20px] italic"
            >
              <option>Colecciones</option>
              <option>Libros</option>
            </select>
          </div>
        </div>
        <div className="add-col absolute -bottom-10 right-0 flex">
          <MdIcon path={mdiPlus} color="pink" size={1} className="my-auto" />
          <span
            className="my-auto cursor-pointer italic"
            onClick={() => onChangeModal()}
          >
            Agregar
          </span>
        </div>
      </div>
      {displayType === "collections" && !isLoading ? (
        <div className="mt-10 grid grid-cols-3 gap-10 p-10">
          {catalogs?.map((col) => (
            <div className="" key={col.id}>
              <CollectionCard id={col.id} name={col.name} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid place-content-center items-center my-auto mt-40">
          <MdIcon size={3} color="#FBA1B7" path={mdiLoading} spin={true} />
        </div>
      )}
      <div className={`${isModalOpen ? "block" : "hidden"}`}>
        <ModalForm title={"Crear colección"} onClose={() => onChangeModal()}>
          <form action="" onSubmit={onFormSubmit}>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Mi colección"
                  className="h-10 rounded-[5px] bg-platinum px-3"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="name">Descripción</label>
                <input
                  type="text"
                  name="desc"
                  required
                  placeholder="Libros especiales"
                  className="h-10 rounded-[5px] bg-platinum px-3"
                />
              </div>
              <div className="mt-10 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-transparent text-[20px] text-red-600"
                >
                  Salir
                </button>
                <button
                  type="submit"
                  className="rounded-small bg-pink p-2 text-white hover:opacity-70"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </form>
        </ModalForm>
      </div>
    </div>
  );
}

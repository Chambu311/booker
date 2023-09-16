import { mdiAccount, mdiPlus, mdiArrowLeft, mdiLoading } from "@mdi/js";
import CollectionCard from "./collection-card";
import MdIcon from "./mdIcon";
import { api } from "~/utils/api";
import { useState } from "react";
import { Catalog } from "@prisma/client";

interface ICatalogView {
  userId: string;
}

export default function CatalogView(props: ICatalogView) {
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [catalogList , setCatalogList] = useState<Catalog[]>([])
  const catalogsQuery = api.catalog.getAllByUserId.useQuery({
    userId: props.userId,
  });
  const catalogs = catalogsQuery.data;
  const newCatalog = api.catalog.createCatalog.useMutation();


  if (catalogsQuery.isLoading) {
    return (
        <div className="grid place-content-center items-center">
           <MdIcon size={3} color="#FBA1B7" path={mdiLoading} spin={true} />
        </div>
    )
  }

  function onFormSubmit(input: any) {
    input.preventDefault();
    setIsLoading(true);
    const formData = new FormData(input.target);
    const catalogName = formData.get("name") as string;
    const catalogDesc = formData.get('desc') as string;
    newCatalog.mutate({ name: catalogName, userId: props.userId, description: catalogDesc });
    if (newCatalog.error) {
        window.alert('Error al crear catálogo');
        input.target.reset()
    }

    setIsLoading(false);
    setIsAddFormVisible(false);
  }
  return (
    <div className="w-full">
      <div className="relative gap-10 border-b-[1px] border-b-black pb-2 align-middle text-black">
        <span className="text-[35px]">Mi libreria</span>
        <div className="add-col absolute -bottom-10 right-0 flex">
          <MdIcon
            path={isAddFormVisible ? mdiArrowLeft : mdiPlus}
            color="pink"
            size={1}
            className="my-auto"
          />
          <span
            className="my-auto cursor-pointer italic"
            onClick={() => setIsAddFormVisible(!isAddFormVisible)}
          >
            {isAddFormVisible ? "Volver" : "Agregar"}
          </span>
        </div>
      </div>
      {isAddFormVisible ? (
        <div className="p-10">
          <form action="flex flex-col" onSubmit={onFormSubmit}>
            <div className="flex">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                name="name"
                required
                className="ml-10 h-[30px] rounded-[5px] bg-platinum text-black"
              />
            </div>
            <div className="flex mt-5">
              <label htmlFor="desc">Descripción</label>
              <input
                type="text"
                name="desc"
                className="ml-10 h-[30px] rounded-[5px] bg-platinum text-black"
              />
            </div>
            <button
              type="submit"
              className="mt-20 rounded-[5px] bg-pink p-2 text-white"
            >
              {isLoading ? (
                <div className="flex">
                  <span>Guardando</span>
                  <div className="animate-spin rounded-[50%] border-[1px] border-white border-t-transparent p-1" />
                </div>
              ) : (
                <span>Guardar</span>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-3 p-10 gap-10">
          {catalogs?.map((col) => (
            <div className="" key={col.id}>
              <CollectionCard id={col.id} name={col.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

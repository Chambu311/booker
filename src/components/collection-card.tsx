import { useRouter } from "next/router";
import { mdiBookmarkBoxMultiple, mdiTrashCan } from "@mdi/js";
import MdIcon from "./mdIcon";
import { api } from "~/utils/api";

interface ICollection {
  name: string;
  id: string;
}

export default function CollectionCard(props: ICollection) {
  const router = useRouter();
  const trpc = api.useContext();
  const deleteMutation = api.catalog.deleteCatalog.useMutation({
    onSettled: async () => {
      await trpc.catalog.getAllByUserId.invalidate()
    },
  });

  function onClickDeleteCatalog(id: string, event: any) {
    event.stopPropagation();
    deleteMutation.mutate({ id });
  }
  return (
    <div
      className="card relative flex h-[200px] w-[180px] cursor-pointer flex-col rounded-normal bg-light-pink shadow-lg"
      onClick={() => router.push(`/profile/library/${props.id}`)}
    >
      <div className="absolute right-2 top-2">
        <MdIcon path={mdiBookmarkBoxMultiple} color="black" size={1} />
      </div>
      <div
        className="absolute left-2 top-2"
        onClick={(e) => onClickDeleteCatalog(props.id, e)}
      >
        <MdIcon path={mdiTrashCan} color="red" size={1} />
      </div>
      <div className="absolute bottom-2 left-2 text-[20px]">
        <span>{props.name}</span>
      </div>
      <style jsx>
        {`
          .card {
            transition: box-shadow ease 0.5s;
          }
          .card:hover {
            box-shadow:
              rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
              rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
          }
        `}
      </style>
    </div>
  );
}

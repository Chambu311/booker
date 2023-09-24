import { mdiPublish, mdiTrashCan, mdiPencil } from "@mdi/js";
import MdIcon from "./mdIcon";
import { Book } from "@prisma/client";

interface IBookCard {
  book: Book;
  onClickDelete: (id: string) => void;
}
export default function BookCard(props: IBookCard) {
  const { book } = props;
  return (
    <div className="relative grid h-[250px] w-full place-content-center rounded-normal bg-light-pink shadow-md">
      <div className="flex justify-center">
        <span className="text-black">{book.title}</span>
      </div>
      <div className="flex justify-end">{book.author}</div>
      <div className="absolute bottom-3 right-3 flex gap-2">
        <div className="hover:scale-110 cursor-pointer transition-transform" onClick={() => props.onClickDelete(book.id)}>
          <MdIcon path={mdiTrashCan} color="black" size={1} />
        </div>
      </div>
    </div>
  );
}

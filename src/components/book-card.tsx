import { mdiPublish, mdiTrashCan, mdiPencil, mdiCheck, mdiHelp } from "@mdi/js";
import MdIcon from "./mdIcon";
import { Book, BookPublication, Prisma } from "@prisma/client";

export type BookWithPublications = Prisma.BookGetPayload<{
  include: {
    publications: true;
  };
}>;
interface IBookCard {
  book: BookWithPublications;
  onClickDelete: (id: string) => void;
}
export default function BookCard(props: IBookCard) {
  const { book } = props;
  const isPublished = book.publications.some((pub) => pub.isActive);
  return (
    <div className="relative grid h-[250px] w-full place-content-center rounded-normal bg-light-pink shadow-md">
      {isPublished ? (
        <div
          className={`absolute -right-2 -top-2 grid place-content-center rounded-[50%] bg-green p-1`}
        >
          <MdIcon path={mdiCheck} color="white" size={1} />
        </div>
      ) : (
        <div
          className={`absolute -right-2 -top-2 grid place-content-center rounded-[50%] bg-platinum p-1`}
        >
          <MdIcon path={mdiHelp} color="black" size={1} />
        </div>
      )}
      <div className="flex justify-center">
        <span className="text-black">{book.title}</span>
      </div>
      <div className="flex justify-end">{book.author}</div>
      <div className="absolute bottom-3 right-3 flex gap-2">
        <div
          className="cursor-pointer transition-transform hover:scale-110"
          onClick={() => props.onClickDelete(book.id)}
        >
          <MdIcon path={mdiTrashCan} color="black" size={1} />
        </div>
      </div>
    </div>
  );
}

export type PublicationData = Prisma.BookPublicationGetPayload<{
  include: {
    images: true;
    book: true;
  };
}>;

export function PublicationCard(props: { publication: PublicationData }) {
  const { publication } = props;
  const book = publication.book;
  return (
    <div className="flex h-[300px] w-[300px] flex-col gap-y-2 rounded-normal font-montserrat align-middle shadow-lg">
      <div
        style={{ backgroundImage: `url('${publication.images[0]?.src}')` }}
        className="h-[70%] w-full rounded-t-normal bg-peach bg-contain bg-center bg-no-repeat"
      />
      <div className="p-3 flex flex-col">
        <span className="text-black font-bold">{book.title}</span>
        <span className="text-black font-normal text-sm italic">{book.author}</span>
      </div>
    </div>
  );
}

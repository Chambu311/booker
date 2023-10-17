import {
  mdiPublish,
  mdiTrashCan,
  mdiPencil,
  mdiCheck,
  mdiHelp,
  mdiCheckCircle,
  mdiMore,
  mdiDotsVertical,
  mdiBookEdit,
  mdiCommentEdit,
} from "@mdi/js";
import MdIcon from "./mdIcon";
import { Book, BookPublication, Prisma } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/router";

export type BookWithPublications = Prisma.BookGetPayload<{
  include: {
    publications: true;
    genre: true;
    user: true;
  };
}>;
interface IBookCard {
  book: BookWithPublications;
  onClickDelete: (id: string) => void;
}
export default function BookCard(props: IBookCard) {
  const { book } = props;
  const [areOptionsVisible, setAreOptionsVisible] = useState(false);
  const router = useRouter()
  return (
    <div
      className="relative"
      onClick={() => setAreOptionsVisible(!areOptionsVisible)}
    >
      <div className="relative flex h-[230px] w-[170px] rounded-normal">
        <div className="w-[20%] rounded-l-[25px] bg-carisma-500"></div>
        <div className="flex w-[80%] flex-col gap-y-2 rounded-r-normal bg-carisma-400 bg-opacity-75 px-5 pt-5">
          <p className="text-center text-[15px]">{book.title}</p>
          <p className="text-center text-[13px] font-bold italic text-black">
            {book.author}
          </p>
        </div>
        <div className="absolute bottom-[4px] left-[3px] grid h-10 w-full  grid-cols-1 place-content-center gap-y-[6px] rounded-l-[40px] rounded-r-none bg-white px-1">
          <div className="h-[1px] w-full bg-black bg-opacity-50"></div>
          <div className="h-[1px] w-full bg-black bg-opacity-50"></div>
          <div className="h-[1px] w-full bg-black bg-opacity-50"></div>
          <div className="h-[1px] w-full bg-black bg-opacity-50"></div>
        </div>
      </div>
      {areOptionsVisible ? (
        <div className="fade absolute -right-10 top-0 flex flex-col gap-y-5 rounded-big p-3 shadow-lg">
          <div onClick={() => props.onClickDelete(book.id)}>
            <MdIcon
              path={mdiTrashCan}
              color="black"
              className="icon"
              size={1.2}
            />
          </div>
          <div>
            <MdIcon
              path={mdiPencil}
              color="black"
              className="icon"
              size={1.2}
            />
          </div>
          <div
            onClick={async () => {
              await router.push(`/profile/book/${book.id}`);
            }}
          >
            <MdIcon
              path={mdiDotsVertical}
              color="black"
              className="icon"
              size={1.2}
            />
          </div>
        </div>
      ) : null}
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
    <div className="platinum-border flex h-[300px] w-[300px] flex-col gap-y-2 rounded-normal align-middle font-montserrat shadow-lg">
      <div
        style={{ backgroundImage: `url('${publication.images[0]?.src}')` }}
        className="h-[70%] w-full rounded-t-normal bg-peach bg-contain bg-center bg-no-repeat"
      />
      <div className="flex flex-col p-3">
        <span className="font-bold text-black">{book.title}</span>
        <span className="text-sm font-normal italic text-black">
          {book.author}
        </span>
      </div>
    </div>
  );
}

export const LightBookCard = (props: { book: BookWithPublications }) => {
  const { book } = props;
  return (
    <div className="relative flex h-[230px] w-[170px] rounded-normal">
      <div className="w-[20%] rounded-l-[25px] bg-carisma-500"></div>
      <div className="flex w-[80%] flex-col gap-y-2 rounded-r-normal bg-carisma-400 bg-opacity-75 px-5 pt-5">
        <p className="text-center text-[15px]">{book.title}</p>
        <p className="text-center text-[13px] font-bold italic text-black">
          {book.author}
        </p>
      </div>
      <div className="absolute bottom-[4px] left-[3px] grid h-10 w-full  grid-cols-1 place-content-center gap-y-[6px] rounded-l-[40px] rounded-r-none bg-white px-1">
        <div className="h-[1px] w-full bg-black bg-opacity-50"></div>
        <div className="h-[1px] w-full bg-black bg-opacity-50"></div>
        <div className="h-[1px] w-full bg-black bg-opacity-50"></div>
        <div className="h-[1px] w-full bg-black bg-opacity-50"></div>
      </div>
    </div>
  );
};

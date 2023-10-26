import {
  mdiTrashCan,
  mdiPencil,
  mdiDotsVertical,
} from "@mdi/js";
import MdIcon from "./mdIcon";
import { Book, Prisma } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export type BookWithPublications = Prisma.BookGetPayload<{
  include: {
    publications: true;
    genre: true;
    user: true;
  };
}>;
interface IBookCard {
  book: BookWithImages;
  onClickDelete: (id: string) => void;
}
export default function BookCard(props: IBookCard) {
  const { book } = props;
  const [areOptionsVisible, setAreOptionsVisible] = useState(false);
  const router = useRouter();
  return (
    <div
      className="relative h-[300px] w-[250px]"
      onClick={() => setAreOptionsVisible(!areOptionsVisible)}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-normal shadow-lg">
        <div
          style={{ backgroundImage: `url('${book?.images?.at(0)?.src}')` }}
          className="h-full w-full rounded-t-normal bg-cover bg-center bg-no-repeat transition-all duration-500 hover:[transform:scale(1.1)]"
        ></div>
      </div>
      {areOptionsVisible ? (
        <div className="fade absolute -right-20 top-0 flex flex-col gap-y-5 rounded-big p-3 shadow-lg">
          <div onClick={() => props.onClickDelete(book?.id)}>
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

export type BookWithImages = Prisma.BookGetPayload<{
  include: {
    images: true;
    genre: true;
  };
}>;

export function PublicationCard(props: { book: BookWithImages }) {
  const { book } = props;
  return (
    <div className="platinum-border flex h-[300px] w-[300px] flex-col gap-y-2 rounded-normal align-middle font-montserrat shadow-lg">
      <div
        style={{ backgroundImage: `url('${book.images[0]?.src}')` }}
        className="h-[70%] w-full rounded-t-normal bg-carisma-50 bg-contain bg-center bg-no-repeat"
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

export const LightBookCard = (props: { bookId : string}) => {
  const bookQuery = api.book.findById.useQuery({id: props.bookId})
  const book = bookQuery.data as BookWithImages;
  return (
    <div className="scene [perspective:1000px]">
      <div className="relative h-[350px] w-[300px] transition-transform duration-700 [transform-style:preserve-3d] hover:[transform:rotateY(180deg)]">
        <div
          style={{ backgroundImage: `url('${book?.images?.at(0)?.src}')` }}
          className="front absolute h-full w-full rounded-normal bg-cover bg-center bg-no-repeat"
        ></div>
        <div className="back flex h-full w-full flex-col flex-wrap gap-y-5 rounded-normal bg-platinum p-5 [backface-visibility:hidden] [transform:rotateY(-180deg)]">
          <div className="flex flex-col">
            <p className="text-xl font-bold text-balance">{book?.title}</p>
            <p className="text-lg text-balance italic">{book?.author}</p>
          </div>
          <div className="h-[1px] w-full bg-black"></div>
          <p>{book?.description}</p>
        </div>
      </div>
    </div>
  );
};

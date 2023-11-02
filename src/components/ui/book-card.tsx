import { mdiTrashCan, mdiPencil, mdiDotsVertical, mdiClose } from "@mdi/js";
import MdIcon from "./mdIcon";
import { Book, Prisma } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

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
      onMouseEnter={() => setAreOptionsVisible(true)}
      onMouseLeave={() => setAreOptionsVisible(false)}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-normal shadow-lg">
        <div
          style={{ backgroundImage: `url('${book?.images?.at(0)?.src}')` }}
          className={`h-full w-full rounded-t-normal bg-cover bg-center bg-no-repeat transition-all duration-500 ${
            areOptionsVisible ? "scale-[1.2]" : ""
          }`}
        ></div>
        <div
          className={`absolute w-full ${
            areOptionsVisible ? "opacity-100" : "opacity-0"
          } bottom-0 flex h-full flex-col gap-y-4  bg-black bg-opacity-80 p-5 text-white transition-[opacity] duration-500`}
        >
          <div className="flex flex-col overflow-ellipsis">
            <p className="text-balance text-xl font-bold">{book?.title}</p>
            <p className="text-balance text-lg italic">{book?.author}</p>
          </div>
          <div className="absolute bottom-5 flex w-full justify-evenly px-2">
            <div onClick={() => props.onClickDelete(book?.id)}>
              <MdIcon
                path={mdiTrashCan}
                color="white"
                className="icon"
                size={1.2}
              />
            </div>
            <div>
              <MdIcon
                path={mdiPencil}
                color="white"
                className="icon"
                size={1.2}
              />
            </div>
            <div
              onClick={async () => {
                await router.push(`/profile/book/${book?.id}`);
              }}
            >
              <MdIcon
                path={mdiDotsVertical}
                color="white"
                className="icon"
                size={1.2}
              />
            </div>
          </div>
        </div>
      </div>
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
    <div className=" relative flex h-[170px] w-full gap-5 p-5 font-montserrat">
      <div className="absolute -top-2 right-4 text-sm italic">
        {book?.genre?.name}
      </div>
      <div
        style={{ backgroundImage: `url('${book?.images.at(0)?.src}')` }}
        className="h-full w-[20%] bg-contain  bg-center bg-no-repeat"
      />
      <div className="flex w-[70%] flex-col gap-5">
        <div className="flex flex-col gap-y-2">
          <p className="text-balance text-[20px] font-bold">{book?.title}</p>
          <p className="text-balance italic">{book?.author}</p>
        </div>
        <p className="overflow-hidden overflow-ellipsis whitespace-nowrap">
          {book?.description}
        </p>
      </div>
    </div>
  );
}

export const LightBookCard = (props: { bookId: string }) => {
  const bookQuery = api.book.findById.useQuery({ id: props.bookId });
  const [detail, setDetail] = useState(false);
  const book = bookQuery.data as BookWithImages;
  return (
    <div
      className="relative h-[300px] w-[250px]"
      onMouseEnter={() => setDetail(true)}
      onMouseLeave={() => setDetail(false)}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-normal shadow-lg">
        <div
          style={{ backgroundImage: `url('${book?.images?.at(0)?.src}')` }}
          className={`h-full w-full rounded-t-normal bg-cover bg-center bg-no-repeat transition-all duration-500 ${
            detail ? "scale-[1.2]" : ""
          }`}
        ></div>
        <div
          className={`absolute w-full ${
            detail ? "opacity-100" : "opacity-0"
          } bottom-0 flex h-full flex-col gap-y-4  bg-black bg-opacity-80 p-5 text-white transition-[opacity] duration-500`}
        >
          <div className="flex flex-col overflow-ellipsis">
            <p className="text-balance text-xl font-bold">{book?.title}</p>
            <p className="text-balance text-lg italic">{book?.author}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

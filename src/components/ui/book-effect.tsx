import { api } from "~/utils/api";
import { BookWithPublications } from "./book-card";
import MdIcon from "./mdIcon";
import { mdiCheckCircle } from "@mdi/js";

const BookEffect = (props: { bookId: string }) => {
  const pubQuery = api.publication.findByBookId.useQuery({ id: props.bookId });
  const images = pubQuery.data?.images;
  return (
    <div className="book scale-[0.7]">
      <div className="back bg-black"></div>
      <div
        style={{ backgroundImage: images ? `url('${images[0]?.src}')` : "" }}
        className="page6 grid place-content-center bg-[#fdfdfd] bg-cover bg-center bg-no-repeat"
      ></div>
      <div
        style={{ backgroundImage: images ? `url('${images[1]?.src}')` : "" }}
        className="page5 bg-[#fafafa] bg-cover bg-center bg-no-repeat"
      ></div>
      <div className="page4 bg-[#f5f5f5]"></div>
      <div className="page3 bg-[#f5f5f5]"></div>
      <div className="page2 bg-[#efefef]"></div>
      <div className="page1 bg-[#efefef]"></div>
      <div className="front grid place-content-center bg-black"></div>
      <style jsx>
        {`
          .book {
            transform-style: preserve-3d;
            position: relative;
            height: 300px;
            cursor: pointer;
            backface-visibility: visible;
          }

          .front,
          .back,
          .page1,
          .page2,
          .page3,
          .page4,
          .page5,
          .page6 {
            transform-style: preserve-3d;
            position: absolute;
            width: 200px;
            height: 100%;
            top: 0;
            left: 0;
            transform-origin: left center;
            transition:
              transform 0.5s ease-in-out,
              box-shadow 0.35s ease-in-out;
          }

          .front,
          .page1,
          .page3,
          .page5 {
            border-bottom-right-radius: 0.5em;
            border-top-right-radius: 0.5em;
          }

          .back,
          .page2,
          .page4,
          .page6 {
            border-bottom-right-radius: 0.5em;
            border-top-right-radius: 0.5em;
          }

          .book:hover .front {
            transform: rotateY(-160deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book:hover .page1 {
            transform: rotateY(-150deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book:hover .page2 {
            transform: rotateY(-30deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book:hover .page3 {
            transform: rotateY(-140deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book:hover .page4 {
            transform: rotateY(-40deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book:hover .page5 {
            transform: rotateY(-130deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book:hover .page6 {
            transform: rotateY(-50deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book:hover .back {
            transform: rotateY(-20deg) scale(1.1);
          }
        `}
      </style>
    </div>
  );
};

export default BookEffect;

export const SimpleBookPreview = (props: { book: BookWithPublications }) => {
  const { book } = props;
  return (
    <>
      <div className="relative flex h-[300px] w-[200px] rounded-normal">
        <div className="w-[20%] rounded-l-[25px] bg-pink"></div>
        <div className="flex w-[80%] flex-col gap-y-5 rounded-r-normal bg-pink bg-opacity-75 px-10 pt-20">
            <p className="text-center text-[18px]">{book.title}</p>
            <p className="text-center text-black font-bold italic">{book.author}</p>
        </div>
        <div className="absolute bottom-[4px] left-[3px] grid h-10 w-full  grid-cols-1 place-content-center gap-y-[6px] rounded-l-[40px] rounded-r-none bg-white px-1">
          <div className="h-[1px] w-full bg-black bg-opacity-50"></div>
          <div className="h-[1px] w-full bg-black bg-opacity-50"></div>
          <div className="h-[1px] w-full bg-black bg-opacity-50"></div>
          <div className="h-[1px] w-full bg-black bg-opacity-50"></div>
        </div>
      </div>
    </>
  );
};

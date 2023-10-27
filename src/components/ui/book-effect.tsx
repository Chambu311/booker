import MdIcon from "./mdIcon";
import { mdiBookmark, mdiCheckCircle } from "@mdi/js";

const BookEffect = (props: { open: boolean }) => {
  return (
    <div
      className={`book relative scale-[2] ${
        props.open ? "clicked" : ""
      } bg-transparent`}
    >
      <div className="back bg-carisma-500"></div>
      <div className="page6 border-l-[1px] border-l-platinum bg-[#fdfdfd] p-5">
        <p className="text-[10px] font-normal italic text-black">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
      <div className="page5 bg-[#fafafa] p-5">
        <p className="mirror text-[10px] font-normal italic text-black">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
      <div className="page4 bg-[#f5f5f5]"></div>
      <div className="page3 bg-[#f5f5f5]"></div>
      <div className="page2 bg-[#efefef]"></div>
      <div className="page1 bg-[#efefef]"></div>
      <div className="front relative grid place-content-center bg-carisma-500">
        <p className="text-[28px] text-white">Booker.</p>
        <p className=" text-white">Where stories find you</p>
        <div className="absolute -top-2 right-2">
          <MdIcon path={mdiBookmark} color="white" size={2} />
        </div>
      </div>
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
          .page5,
          .back,
          .page2,
          .page4,
          .page6 {
            border-radius: 10px;
          }

          .mirror {
            transform: translateY(-180deg) perspective(1000px);
            transform-style: preserve-3d;
          }

          .book.clicked .front {
            transform: rotateY(-160deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book.clicked .page1 {
            transform: rotateY(-150deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book.clicked .page2 {
            transform: rotateY(-30deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book.clicked .page3 {
            transform: rotateY(-140deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book.clicked .page4 {
            transform: rotateY(-40deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book.clicked .page5 {
            transform: rotateY(-130deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book.clicked .page6 {
            transform: rotateY(-50deg) scale(1.1);
            box-shadow: 0 1em 3em 0 rgba(0, 0, 0, 0.2);
          }

          .book.clicked .back {
            transform: rotateY(-20deg) scale(1.1);
          }
        `}
      </style>
    </div>
  );
};

export default BookEffect;

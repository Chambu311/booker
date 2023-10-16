import { useState } from "react";
import Image from "next/image";
import MdIcon from "./mdIcon";
import { mdiArrowLeft, mdiArrowLeftThick, mdiArrowRightThick } from "@mdi/js";
export default function Carousel(props: { slides: any[] }) {
  const [current, setCurrent] = useState(0);
  const { slides } = props;
  const previousSlide = () => {
    if (current === 0) setCurrent(slides.length - 1);
    else setCurrent(current - 1);
  };

  const nextSlide = () => {
    if (current === slides.length - 1) setCurrent(0);
    else setCurrent(current + 1);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="flex h-full w-full transition ease-out"
        style={{
          width: `${slides.length * 100}%`, // Ensure that the container is wide enough to accommodate all slides
          transform: `translateX(-${current * (100 / slides.length)}%)`, // Move slides by a percentage of the total width
        }}
      >
        {slides.map((s, index) => (
          <div
            className="h-full w-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${s.src}')` }}
            key={index}
          />
        ))}
      </div>

      <div className="absolute top-0 flex h-full w-full items-center justify-between px-10 text-3xl text-white">
        <button onClick={previousSlide}>
          <MdIcon path={mdiArrowLeftThick} size={2} color="black" />
        </button>
        <button onClick={nextSlide}>
          <MdIcon path={mdiArrowRightThick} size={2} color="black" />
        </button>
      </div>

      <div className="absolute bottom-0 flex w-full justify-center gap-3 py-4">
        {slides.map((s, i) => {
          return (
            <div
              onClick={() => {
                setCurrent(i);
              }}
              key={"circle" + i}
              className={`h-5 w-5 cursor-pointer rounded-full  ${
                i == current ? "bg-white" : "bg-gray-500"
              }`}
            ></div>
          );
        })}
      </div>
    </div>
  );
}

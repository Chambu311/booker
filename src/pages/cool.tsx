import Link from "next/link";
import { useState } from "react";
import BookEffect from "~/components/ui/book-effect";
import Tilt from "react-parallax-tilt";
const CoolPage = () => {
  const [open, setIsOpen] = useState(false);

  return (
    <div className="relative grid h-screen w-screen place-content-center bg-black">
      {/* <FlipCard /> */}
      <Tilt className="relative [transform-style:preserve-3d]">
        <div className="grid h-[450px] w-[400px] place-content-center rounded-normal bg-white [transform-style:preserve-3d]">
          <div className="h-40 w-40 rounded-normal bg-black text-xl text-black  [transform:translateZ(200px)]"></div>
        </div>
      </Tilt>
    </div>
  );
};
export default CoolPage;

const FlipCard = () => {
  return (
    <div className="h-40 w-40 [perspective:1000px]">
      <div className="card relative h-full w-full transition-all duration-500  [transform-style:preserve-3d]  hover:[transform:rotateY(180deg)]">
        <div className="front absolute  inset-0 grid h-full w-full place-content-center rounded-normal bg-white">
          <p className="[transform: translateZ(40px)] text-blue">front</p>
        </div>
        <div className="back [transform: rotateY(180deg)] absolute inset-0 grid h-full w-full place-content-center rounded-normal bg-carisma-500 [backface-visibility:hidden]">
          <p className="text-blue">back</p>
        </div>
      </div>
    </div>
  );
};

const Carousel3d = () => {
  const [cellHover, setCellHover] = useState<number>();
  const getZTranslation = (cellSize: number, numberOfCells: number) => {
    const tz = Math.round(cellSize / 2 / Math.tan(Math.PI / numberOfCells));
    return tz;
  };
  const getYRotation = (index: number) => {
    const rotation = Math.round(360 / 5);
    return rotation * index;
  };
  return (
    <div className="h-[200px] w-[250px] [perspective:1000px]">
      <div
        className={`${
          !cellHover ? "carousel" : "carousel stop"
        }  relative h-full w-full [transform-style:preserve-3d]`}
      >
        {Array.from({ length: 5 }).map((_, index) => {
          const zTranslation = getZTranslation(200, 5);
          const yRotation = getYRotation(index);
          const transformStyle = `rotateY(${yRotation}deg) translateZ(${zTranslation}px) ${
            cellHover === index ? "scale(1.1)" : ""
          }`;
          return (
            <div
              key={index}
              onMouseEnter={() => setCellHover(index)}
              onMouseLeave={() => setCellHover(undefined)}
              className={`bg-blue-500 absolute mx-2 grid h-[150px] w-[170px] place-content-center overflow-hidden rounded-normal 
             border-2 border-black bg-white transition-transform duration-300`}
              style={{
                transform: transformStyle,
              }}
            >
              {index + 1}
            </div>
          );
        })}
      </div>
      <style jsx>
        {`
          .carousel {
            animation: carousel-rotate linear 20s infinite;
          }

          .active {
            transform: translateZ(-100px);
          }

          .stop {
            animation-play-state: paused;
          }

          @keyframes carousel-rotate {
            from {
              transform: rotateY(0deg);
            }
            to {
              transform: rotateY(320deg);
            }
          }
        `}
      </style>
    </div>
  );
};

const Cardstack = () => {
  return (
    <div className="scene [perspective:1000px]">
      <div className="stack relative h-[250px] w-[250px] stroke-black [transform-style:preserve-3d]">
        {Array.from({ length: 5 }).map((_, index) => {
          const transformStyle = `translate(${index * 20}px, -${
            index * 20
          }px) translateZ(-${index * 10}px)`;
          return (
            <div
              key={index}
              style={{ transform: transformStyle }}
              className="card grid place-content-center border-2 border-carisma-500 bg-white"
            >
              {index === 0 ? <p className="text-black">Hola</p> : null}
            </div>
          );
        })}
      </div>
      <style jsx>
        {`
          .card {
            position: absolute;
            height: 100%;
            width: 100%;
            border-radius: 10px;
          }

          .stack {
          }
        `}
      </style>
    </div>
  );
};

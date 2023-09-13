import Link from "next/link";

export default function Navbar() {
  return (
    <div className="bg-pink min-h-10 font-montserrat fixed top-0 z-[999] flex w-full p-5 px-10 align-middle text-white">
      <div className="my-auto flex w-[80%] justify-center gap-20">
        <div className="font-hayward absolute bottom-0 left-5 top-0 text-[45px] text-white">
          Booker
        </div>
        <Link href="/library">
          <div className="link text-white">Libreria</div>
        </Link>
        <div className="link text-white">Pedidos</div>
        <Link href="/">
          <div className="link text-white">Salir</div>
        </Link>
      </div>
      <div className="flex w-[20%] gap-5 align-middle">
        <div className="grid place-content-center rounded-full border border-white p-2 ">
          <div className="mdi mdi-account text-[30px] text-white"></div>
        </div>
        <div className="flex flex-col">
          <div className="m-auto text-white">@ Anomander</div>
        </div>
      </div>
      <style jsx>
        {`
          .link {
            transition: border ease 0.3s;
            cursor: pointer;
          }
          .link:hover {
            border-bottom: 2px solid white;
          }
        `}
      </style>
    </div>
  );
}

import Link from "next/link";

const Custom404 = () => {
  return (
    <div className="grid h-screen w-screen place-content-center bg-carisma-500">
      <div className="text-[50px] font-black text-white">
        PÁGINA NO ENCONTRADA
      </div>
      <Link
        className="text-center text-[30px] font-bold text-white"
        href="/home"
      >
        Volver
      </Link>
    </div>
  );
};

export default Custom404;

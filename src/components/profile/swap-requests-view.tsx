import { Prisma, SwapRequest, SwapStatus, User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";

const SwapRequestsView = (props: { user: User }) => {
  const [filter, setFilter] = useState<"SENT" | "RECEIVED" | "ALL">("ALL");
  const router = useRouter();
  const swapRequestsQuery = api.swap.findByUserId.useQuery({
    id: props.user.id,
    filter,
  });
  const swaps = swapRequestsQuery.data;

  return (
    <div className="flex h-full w-full flex-col gap-y-4">
      <h1 className="text-[30px]">Solicitudes</h1>
      <div className="relative mb-5 flex justify-end gap-10 border-b-[1px] border-platinum py-2 [&>b]:cursor-pointer">
        <b
          onClick={() => setFilter("RECEIVED")}
          className={filter.includes("RECEIVED") ? "font-bold text-blue" : ""}
        >
          Recibidas
        </b>
        <b
          onClick={() => setFilter("SENT")}
          className={filter.includes("SENT") ? "font-bold text-blue" : ""}
        >
          Enviadas
        </b>
        <b
          onClick={() => setFilter("ALL")}
          className={filter.includes("ALL") ? "font-bold text-blue" : ""}
        >
          Todas
        </b>
      </div>
      <div className="flex flex-col gap-y-5 px-3">
        {swaps?.map((swap, index) => (
          <div
            key={index}
            className="w-full cursor-pointer"
            onClick={() =>
              router.push(`/profile/${props.user.name}/${swap.id}`)
            }
          >
            <SwapRequestPreview swap={swap} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwapRequestsView;

export type SwapRequestFullInfo = Prisma.SwapRequestGetPayload<{
  include: {
    holderBook: true;
    holder: true;
    requester: true;
    requesterBook: true;
  };
}>;

const SwapRequestPreview = (props: { swap: SwapRequestFullInfo }) => {
  const { swap } = props;
  const parseStatus = (status: SwapStatus) => {
    switch (status) {
      case "PENDING_HOLDER":
        return "Esperando selección";
      case "ACCEPTED":
        return "Aceptado";
      case "CANCELLED":
        return "Cancelado";
    }
  };
  return (
    <div className="grid grid-cols-3 rounded-normal border-[1.5px] border-platinum p-5 shadow-normal">
      <div className="flex gap-5">
        <b>Hacia:</b>
        <p> {swap?.holder.email}</p>
      </div>
      <div className="flex gap-5">
        <b>Libro seleccionado</b>
        <p>{swap?.holderBook.title}</p>
      </div>
      <div className="flex gap-5">
        <b>Estado:</b>
        <p>{parseStatus(swap.status)}</p>
      </div>
    </div>
  );
};

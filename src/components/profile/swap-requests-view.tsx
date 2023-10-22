import { Prisma, SwapRequest, SwapStatus, User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";

const SwapRequestsView = (props: { user: User }) => {
  const session = useSession();
  const [filter, setFilter] = useState<"SENT" | "RECEIVED">("RECEIVED");
  const router = useRouter();
  const swapRequestsQuery = api.swap.findByUserId.useQuery({
    id: props.user.id,
    filter,
  });
  const swaps = swapRequestsQuery.data;

  const wasSwapSentToMe = (holderId: string) => {
    return session.data?.user.id === holderId;
  };

  return (
    <div className="flex h-full w-full flex-col gap-y-4">
      <h1 className="text-[30px]">Solicitudes</h1>
      <div className="relative mb-5 flex justify-end gap-10 border-b-[1px] border-platinum py-2 [&>b]:cursor-pointer">
        <b
          onClick={() => setFilter("RECEIVED")}
          className={
            filter.includes("RECEIVED") ? "font-bold text-carisma-500" : ""
          }
        >
          Recibidas
        </b>
        <b
          onClick={() => setFilter("SENT")}
          className={
            filter.includes("SENT") ? "font-bold text-carisma-500" : ""
          }
        >
          Enviadas
        </b>
      </div>
      <div className="flex flex-col gap-y-5 px-3">
        {swaps?.map((swap, index) => (
          <div key={index} className="w-full">
            {wasSwapSentToMe(swap.holder.id) ? (
              <ReceivedSwapRequestPreview swap={swap} />
            ) : (
              <SentSwapRequestPreview swap={swap} />
            )}
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

const ReceivedSwapRequestPreview = (props: { swap: SwapRequestFullInfo }) => {
  const { swap } = props;
  return (
    <div className="banner flex h-full shadow-normal">
      <div className="flex w-[50%] flex-col gap-y-5 p-5">
        <div className="flex gap-4 text-[20px]">
          <p>De :</p>
          <Link href={`/profile/${swap.requester.name}`} className="text-blue">
            @{swap.requester.name}
          </Link>
        </div>
        <div className="flex gap-4">
          <p>Su selección :</p>
          <b>
            {swap.holderBook.title} - {swap.holderBook.author}
          </b>
        </div>
        {swap.requesterBook ? (
          <div className="flex gap-4">
            <p>Tu selección :</p>
            <b>
              {swap.requesterBook.title} - {swap.requesterBook.author}
            </b>
          </div>
        ) : null}
      </div>
      <div className="relative grid h-full w-[50%] place-content-center border-[1px] border-l-carisma-500 p-5">
        <ReceivedSwapRequestStatusAction {...swap} />
      </div>
    </div>
  );
};

const SentSwapRequestPreview = (props: { swap: SwapRequestFullInfo }) => {
  const { swap } = props;
  return (
    <div className="banner flex h-full shadow-normal">
      <div className="flex w-[50%] flex-col gap-y-5 p-5">
        <div className="flex gap-4 text-[20px]">
          <p>Hacia :</p>
          <Link href={`/profile/${swap.holder.name}`} className="text-blue">
            @{swap.holder.name}
          </Link>
        </div>
        <div className="flex gap-4">
          <p>Tu selección :</p>
          <b>
            {swap.holderBook.title} - {swap.holderBook.author}
          </b>
        </div>
        {swap.requesterBook ? (
          <div className="flex gap-4">
            <p>Su selección :</p>
            <b>
              {swap.requesterBook.title} - {swap.requesterBook.author}
            </b>
          </div>
        ) : null}
      </div>
      <div className="relative grid h-full w-[50%] place-content-center border-[1px] border-l-carisma-500 p-5">
        <SentSwapRequestStatusAction {...swap} />
      </div>
    </div>
  );
};

const ReceivedSwapRequestStatusAction = (swap: SwapRequestFullInfo) => {
  const status = swap.status;
  switch (status) {
    case "PENDING_HOLDER":
      return (
        <Link href={`/profile/${swap.holder.name}/${swap.id}`}>
          <button className="primary-btn w-full">Seleccionar libro</button>
        </Link>
      );
    case "PENDING_REQUESTER":
      return (
        <div className="flex flex-col gap-y-5">
          <p>Esperando confirmación...</p>
          <Link href={`/profile/${swap.holder.name}/${swap.id}`}>
            <button className="primary-btn w-full">Ver estado</button>
          </Link>
        </div>
      );
    case "REJECTED":
      return (
        <div className="flex flex-col gap-y-5">
          <p>Han rechazado tu selección</p>
          <Link href={`/profile/${swap.holder.name}/${swap.id}`}>
            <button className="primary-btn w-full">Ver estado</button>
          </Link>
        </div>
      );
    case "ACCEPTED":
      return (
        <div className="flex flex-col gap-y-5">
          <p>Han aceptado tu selección</p>
          <Link href={`/profile/${swap.holder.name}/${swap.id}`}>
            <button className="primary-btn w-full">Ver estado</button>
          </Link>
        </div>
      );
    case "CANCELLED":
      return (
        <div className="flex flex-col gap-y-5">
          <p>Cancelado</p>
          <Link href={`/profile/${swap.holder.name}/${swap.id}`}>
            <button className="primary-btn w-full">Ver estado</button>
          </Link>
        </div>
      );
  }
};

const SentSwapRequestStatusAction = (swap: SwapRequestFullInfo) => {
  const status = swap.status;
  switch (status) {
    case "PENDING_HOLDER":
      return <p>Esperando selección</p>;
    case "PENDING_REQUESTER":
      return (
        <div className="flex flex-col gap-y-5">
          <p>Esperando confirmación...</p>
          <Link href={`/profile/${swap.holder.name}/${swap.id}`}>
            <button className="primary-btn w-full">Ver estado</button>
          </Link>
        </div>
      );
    case "REJECTED":
      return (
        <div className="flex flex-col gap-y-5">
          <p>Has rechazado el intercambio.</p>
          <Link href={`/profile/${swap.holder.name}/${swap.id}`}>
            <button className="primary-btn w-full">Ver estado</button>
          </Link>
        </div>
      );
    case "ACCEPTED":
      return (
        <div className="flex flex-col gap-y-5">
          <p>Has aceptado el intercambio.</p>
          <Link href={`/profile/${swap.holder.name}/${swap.id}`}>
            <button className="primary-btn w-full">Ver estado</button>
          </Link>
        </div>
      );
    case "CANCELLED":
      return (
        <div className="flex flex-col gap-y-5">
          <p>Cancelado.</p>
          <Link href={`/profile/${swap.holder.name}/${swap.id}`}>
            <button className="primary-btn w-full">Ver estado</button>
          </Link>
        </div>
      );
  }
};

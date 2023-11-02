import { type SwapRequestFullInfo } from "~/components/profile/swap-requests-view";
import { LoadingPage, LoadingSpinner } from "~/components/ui/loading";
import { prisma } from "~/server/db";
import { useSession } from "next-auth/react";
import { LightBookCard, type BookWithImages } from "~/components/ui/book-card";
import { api } from "~/utils/api";
import { useState } from "react";
import ModalForm from "~/components/ui/modal";
import Carousel from "~/components/ui/carousel";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import confetti from "canvas-confetti";
import { SwapStatus } from "@prisma/client";
import { useRouter } from "next/router";

const RequestPage = (props: { request: SwapRequestFullInfo }) => {
  const { request } = props;
  const router = useRouter();
  const [requestStatus, setRequestStatus] = useState<SwapStatus>(
    request.status,
  );
  const [selectedBookPreview, setSelectedBookPreview] =
    useState<BookWithImages>();
  const session = useSession();
  if (!request) {
    return <LoadingPage />;
  }
  const wasRequestSentToMe = session.data?.user.id === request.holderId;
  const requesterBooksQuery = api.book.getAllByUserId.useQuery({
    userId: request.requesterId,
    isPublished: true,
  });
  const booksToChooseFrom = requesterBooksQuery.data;
  console.log("books to choose", booksToChooseFrom);
  const confirmRequesterSelectionMutation =
    api.swap.confirmRequesterSelection.useMutation();
  const updateRequestMutation = api.swap.updateSwapRequest.useMutation();

  const onClickCloseModal = () => {
    setSelectedBookPreview(undefined);
  };
  const onChangeSelectedBookPreview = (book: BookWithImages) => {
    setSelectedBookPreview(book);
  };
  const onConfirmRequesterBookSelection = (bookId: string) => {
    toast.loading("Confirmando selección...", {
      id: "loading",
    });
    confirmRequesterSelectionMutation.mutate(
      {
        swapId: request.id,
        bookId,
        requesterId: request.requesterId,
        holderId: request.holderId,
      },
      {
        onSuccess: (data) => {
          toast.dismiss("loading");
          setSelectedBookPreview(undefined);
          router.reload();
        },
        onError: (error) => {
          toast.dismiss("loading");
          toast.error("Ya has seleccionado este libro en otra solicitud", {});
        },
      },
    );
  };

  const onUpdateSwapRequestStatus = (
    status: "ACCEPTED" | "CANCELLED" | "REJECTED",
  ) => {
    toast.loading(
      `${status === "ACCEPTED" ? "Confirmando..." : "Cancelando..."}`,
    );
    updateRequestMutation.mutate(
      { swapId: request.id, status: status },
      {
        onSuccess: async () => {
          toast.dismiss();
          setRequestStatus(status);
          if (status === "ACCEPTED") {
            await confetti({
              particleCount: 200,
              spread: 160,
            });
          }
        },
      },
    );
  };
  return (
    <div className="flex flex-col gap-y-10 p-10 font-montserrat">
      <div className="fixed left-3 top-3 cursor-pointer rounded-small bg-platinum p-2 text-black">
        <Link href={`/profile/${session.data?.user.name}`}>Volver</Link>
      </div>
      <Toaster position="top-center" />
      <div className="flex flex-col gap-y-5 border-b-2 border-carisma-400 pb-5">
        <h1 className="text-center text-[25px] font-bold text-black">
          Solicitud de intercambio
        </h1>
        <div className="flex justify-around text-[20px]">
          <p>
            Iniciada por: <b className="text-blue">@{request.requester.name}</b>
          </p>
          <p>
            Receptor: <b className="text-blue">@{request.holder.name}</b>
          </p>
        </div>
      </div>
      {wasRequestSentToMe && requestStatus === "PENDING_HOLDER" ? (
        <>
          <div className="flex items-stretch gap-5">
            <div className="flex w-[30%] flex-col rounded-normal p-5 shadow-lg">
              <span className="text-center text-[25px] text-black">
                Libro seleccionado por {request.requester.name}
              </span>
              <div className="flex justify-center p-5">
                <LightBookCard bookId={request.holderBook.id} />
              </div>
            </div>
            <div className="z-10 flex max-h-full w-[70%] flex-col gap-y-5 overflow-y-auto overflow-x-visible rounded-normal border-2 p-5 shadow-lg">
              <p className="font-bold">Libreria de @{request.requester.name}</p>
              <p className="text-center text-black">
                Seleccione el libro por el cual desea intercambiar su libro
              </p>
              <div className="grid w-full grid-cols-3 place-content-center p-5">
                {booksToChooseFrom?.map((book) => (
                  <div
                    key={book.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedBookPreview(book)}
                  >
                    <LightBookCard bookId={book.id} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              className="primary-btn"
              onClick={() => onUpdateSwapRequestStatus("CANCELLED")}
            >
              Rechazar intercambio
            </button>
          </div>
        </>
      ) : wasRequestSentToMe && requestStatus === "PENDING_REQUESTER" ? (
        <>
          <SwapBooksDetail
            request={request}
            wasRequestSentToMe={wasRequestSentToMe}
            onSelectBookPreview={onChangeSelectedBookPreview}
          />
          <p className="text-center text-[25px]">Esperando confirmación...</p>
          <div className="flex justify-center">
            <button className="secondary-btn">Cancelar intercambio</button>
          </div>
          .
        </>
      ) : !wasRequestSentToMe && requestStatus === "PENDING_REQUESTER" ? (
        <>
          <SwapBooksDetail
            wasRequestSentToMe={wasRequestSentToMe}
            request={request}
            onSelectBookPreview={onChangeSelectedBookPreview}
          />
          <div className="flex justify-center gap-10">
            <button
              onClick={() => onUpdateSwapRequestStatus("ACCEPTED")}
              className="primary-btn"
            >
              Confirmar intercambio
            </button>
            <button
              onClick={() => onUpdateSwapRequestStatus("REJECTED")}
              className="secondary-btn"
            >
              Rechazar intercambio
            </button>
          </div>
        </>
      ) : requestStatus === "ACCEPTED" ||
        requestStatus === "CANCELLED" ||
        requestStatus === "REJECTED" ? (
        <>
          <SwapBooksDetail
            request={request}
            wasRequestSentToMe={wasRequestSentToMe}
            onSelectBookPreview={onChangeSelectedBookPreview}
          />
          <div className="flex justify-center rounded-small">
            <p
              className={`${
                requestStatus === "ACCEPTED"
                  ? "primary-btn !bg-green"
                  : "secondary-btn"
              } pointer-events-none text-[30px]`}
            >
              {requestStatus}
            </p>
          </div>
        </>
      ) : null}
      <div style={{ display: selectedBookPreview ? "block" : "none" }}>
        <BookPreviewModal
          book={selectedBookPreview}
          hasSelectionEnded={request.status !== "PENDING_HOLDER"}
          onCloseModal={onClickCloseModal}
          onConfirm={onConfirmRequesterBookSelection}
        />
      </div>
    </div>
  );
};

export default RequestPage;

export const getServerSideProps = async (context: any) => {
  const id = context.params.swapId;
  const requestFound = await prisma.swapRequest.findUnique({
    where: {
      id: id,
    },
    include: {
      holder: true,
      requester: true,
      requesterBook: true,
      holderBook: true,
    },
  });

  return {
    props: {
      request: JSON.parse(JSON.stringify(requestFound)),
    },
  };
};

const BookPreviewModal = (props: {
  book: BookWithImages | undefined;
  onCloseModal: () => void;
  onConfirm: (id: string) => void;
  hasSelectionEnded: boolean;
}) => {
  const images = props.book?.images;
  return (
    <ModalForm
      style="min-w-[600px] min-h-[400px]"
      title={props.book?.title ?? "Preview"}
    >
        <div className="flex flex-col">
          <div className="h-[250px] w-full bg-carisma-50">
            <Carousel slides={images ?? []} />
          </div>
          <div className="max-w-[600px] p-5">
            <p className="max-w-[600px] text-[18px] text-black">
              {props.book?.description}
            </p>
          </div>
          <div className="mt-5 flex gap-10">
            {!props.hasSelectionEnded ? (
              <button
                onClick={() => props.onConfirm(props.book?.id ?? '')}
                className="primary-btn"
              >
                Confirmar selección
              </button>
            ) : null}
            <button
              onClick={props.onCloseModal}
              className="text-[20px] font-bold text-red-500"
            >
              Salir
            </button>
          </div>
        </div>
    </ModalForm>
  );
};

const SwapBooksDetail = (props: {
  request: SwapRequestFullInfo;
  onSelectBookPreview: (book: BookWithImages) => void;
  wasRequestSentToMe: boolean;
}) => {
  const { request, onSelectBookPreview, wasRequestSentToMe } = props;
  return (
    <div
      className={`flex w-full ${
        !wasRequestSentToMe ? "flex-row-reverse" : "flex-row"
      } justify-between gap-5 px-10`}
    >
      <div
        className="flex w-[50%] cursor-pointer flex-col rounded-normal shadow-lg"
        onClick={() =>
          onSelectBookPreview(request.requesterBook as BookWithImages)
        }
      >
        {wasRequestSentToMe ? (
          <p className="text-center text-[25px]">Tu selección</p>
        ) : (
          <p className="text-center text-[25px]">
            Selección de {request.holder.name}
          </p>
        )}
        <div className="flex justify-center p-5">
          {request.requesterBook ? (
            <LightBookCard bookId={request.requesterBook.id} />
          ) : null}
        </div>
      </div>
      <div
        onClick={() =>
          onSelectBookPreview(request.holderBook as BookWithImages)
        }
        className="flex w-[50%] cursor-pointer flex-col rounded-normal shadow-lg"
      >
        {wasRequestSentToMe ? (
          <p className="text-center text-[25px]">
            Selección de {request.requester.name}
          </p>
        ) : (
          <p className="text-center text-[25px]">Tu selección</p>
        )}
        <div className="flex justify-center p-5">
          <LightBookCard bookId={request.holderBook.id} />
        </div>
      </div>
    </div>
  );
};

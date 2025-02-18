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
import { useDebounce } from "~/utils/hooks";

const RequestPage = (props: { request: SwapRequestFullInfo }) => {
  const { request } = props;
  const router = useRouter();
  const [requestStatus, setRequestStatus] = useState<SwapStatus>(
    request.status,
  );
  const [selectedBookPreview, setSelectedBookPreview] =
    useState<BookWithImages>();
  const session = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

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

  // Filter books based on search
  const filteredBooks = booksToChooseFrom?.filter((book) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower)
    );
  });

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
    <div className="min-h-screen bg-gradient-to-b from-white via-carisma-50/30 to-carisma-100/20">
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        {/* Back button */}
        <div className="mb-10">
          <Link 
            href={`/profile/${session.data?.user.name}?view=library`}
            className="group inline-flex items-center gap-3 rounded-lg bg-white/80 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
          >
            <svg className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a mi biblioteca
          </Link>
        </div>

        <Toaster position="top-center" />
        <div className="flex flex-col gap-y-5 border-b-2 border-carisma-400 pb-5 mb-10">
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
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Selected Book Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-8 overflow-hidden rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm transition-all">
                <div className="relative mb-6">
                  <div className="absolute inset-x-0 -top-32 -z-10 h-48 bg-gradient-to-b from-carisma-100 to-transparent"></div>
                  <h2 className="text-center text-2xl font-semibold text-gray-900">
                    Libro seleccionado
                  </h2>
                  <p className="mt-2 text-center text-gray-500">
                    por <span className="font-medium text-carisma-600">@{request.requester.name}</span>
                  </p>
                </div>
                <div className="relative mx-auto max-w-[280px]">
                  <LightBookCard bookId={request.holderBook.id} />
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-carisma-500 p-1.5 shadow-lg">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Selection Area */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl bg-white/80 shadow-lg backdrop-blur-sm">
                {/* Header Section */}
                <div className="relative overflow-hidden rounded-t-2xl border-b border-gray-100 bg-gradient-to-r from-carisma-50 to-white p-8">
                  <div className="absolute inset-0 bg-grid-gray-900/[0.02]" />
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    Biblioteca de @{request.requester.name}
                  </h2>
                  <p className="text-gray-600">
                    Seleccione el libro por el cual desea intercambiar
                  </p>
                </div>

                {/* Search Section */}
                <div className="border-b border-gray-100 p-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por título o autor..."
                      className="w-full rounded-xl border-2 border-gray-100 bg-white/50 px-4 py-3 pl-12 text-gray-900 transition-all placeholder:text-gray-400 focus:border-carisma-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-carisma-100"
                    />
                    <svg
                      className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Books Grid */}
                <div className="p-8">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredBooks?.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => setSelectedBookPreview(book)}
                        className="group cursor-pointer rounded-xl transition-all hover:bg-white hover:shadow-lg"
                      >
                        <LightBookCard bookId={book.id} />
                      </div>
                    ))}
                  </div>

                  {/* Empty State */}
                  {filteredBooks?.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-xl bg-white/50 py-12">
                      <div className="rounded-full bg-gray-50 p-3">
                        <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="mt-4 text-lg font-medium text-gray-900">
                        No se encontraron libros
                      </p>
                      <p className="mt-2 text-gray-500">
                        No hay libros que coincidan con tu búsqueda
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : wasRequestSentToMe && requestStatus === "PENDING_REQUESTER" ? (
          <>
            <SwapBooksDetail
              request={request}
              wasRequestSentToMe={wasRequestSentToMe}
              onSelectBookPreview={onChangeSelectedBookPreview}
            />
            <p className="text-center text-[25px]">Esperando confirmación...</p>
            <div className="flex justify-center mt-20">
              <button className="secondary-btn">Cancelar intercambio</button>
            </div>
          </>
        ) : !wasRequestSentToMe && requestStatus === "PENDING_REQUESTER" ? (
          <>
            <SwapBooksDetail
              wasRequestSentToMe={wasRequestSentToMe}
              request={request}
              onSelectBookPreview={onChangeSelectedBookPreview}
            />
            <div className="flex justify-center gap-10 mt-20">
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
            <div className="flex justify-center rounded-small mt-20">
              <p
                className={`${requestStatus === "ACCEPTED"
                    ? "primary-btn !bg-green"
                    : "secondary-btn"
                  } pointer-events-none text-[30px]`}
              >
                {requestStatus === "ACCEPTED" ? "Intercambio confirmado" : requestStatus === "CANCELLED" ? "Intercambio cancelado" : "Intercambio rechazado"}
              </p>
            </div>
          </>
        ) : null}
      </div>
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
      className={`flex w-full ${!wasRequestSentToMe ? "flex-row-reverse" : "flex-row"
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

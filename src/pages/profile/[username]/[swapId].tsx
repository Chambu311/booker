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
      <div className="fixed left-3 top-3 cursor-pointer rounded-small bg-platinum p-2 text-black">
        <Link href={`/profile/${session.data?.user.name}?view=library`}>Volver</Link>
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
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="h-full rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900">
                Libro seleccionado por {request.requester.name}
              </h2>
              <div className="flex justify-center">
                <div className="transform transition-transform hover:scale-105">
                  <LightBookCard bookId={request.holderBook.id} />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-8 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Libreria de @{request.requester.name}
                </h2>
                
                {/* Search input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por título o autor..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-carisma-500 focus:outline-none focus:ring-2 focus:ring-carisma-500/20"
                  />
                  <svg
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <p className="text-center text-lg text-gray-600">
                  Seleccione el libro por el cual desea intercambiar su libro
                </p>
              </div>

              {/* Books grid */}
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBooks?.map((book) => (
                  <div
                    key={book.id}
                    className="group cursor-pointer"
                    onClick={() => setSelectedBookPreview(book)}
                  >
                    <div className="transform transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl">
                      <LightBookCard bookId={book.id} />
                    </div>
                  </div>
                ))}
              </div>

              {/* No results message */}
              {filteredBooks?.length === 0 && (
                <div className="mt-8 text-center">
                  <p className="text-lg text-gray-600">
                    No se encontraron libros que coincidan con tu búsqueda
                  </p>
                </div>
              )}
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
          .
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

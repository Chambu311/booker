import { type SwapRequestFullInfo } from "~/components/profile/swap-requests-view";
import { LoadingPage, LoadingSpinner } from "~/components/ui/loading";
import { prisma } from "~/server/db";
import { useSession } from "next-auth/react";
import { type BookWithPublications } from "~/components/ui/book-card";
import { api } from "~/utils/api";
import { useState } from "react";
import ModalForm from "~/components/ui/modal";
import Carousel from "~/components/ui/carousel";
import BookEffect, { SimpleBookPreview } from "~/components/ui/book-effect";

const RequestPage = (props: { request: SwapRequestFullInfo }) => {
  const { request } = props;
  const [selectedBookPreview, setSelectedBookPreview] =
    useState<BookWithPublications>();
  const session = useSession();
  if (!request) {
    return <LoadingPage />;
  }
  const onClickCloseModal = () => {
    setSelectedBookPreview(undefined);
  };
  const wasRequestSent = session.data?.user.id === request.holderId;
  const holderBooksQuery = api.book.getAllByUserId.useQuery({
    userId: request.requesterId,
    isPublished: true,
  });
  const booksToChooseFrom = holderBooksQuery.data;
  return (
    <div className="flex flex-col gap-y-10 p-10">
      <div className="flex w-[30%] flex-col rounded-normal p-5 shadow-lg">
        <h1 className="text-[20px] font-bold text-black">
          Solicitud de intercambio
        </h1>
        <span>Iniciada por: {request.requester.name}</span>
        <span></span>
      </div>
      <div className="flex gap-5">
        <div className="flex h-full w-[30%] flex-col rounded-normal border-[1px] border-black p-5">
          <span className="text-center text-[25px] text-black">
            Libro seleccionado por {request.requester.name}
          </span>
          <span className="text-center font-bold">
            {request.holderBook.title} - {request.holderBook.author}
          </span>
        </div>
        <div className="z-10 flex max-h-full w-[70%] flex-col gap-y-5 overflow-y-auto overflow-x-visible rounded-normal border-2 border-black p-5">
          <p className="text-center text-black">
            Seleccione el libro por el cual desea intercambiar su libro
          </p>
          <div className="grid w-full grid-cols-3 place-content-center p-5">
            {booksToChooseFrom?.map((book) => (
              <div
                key={book.id}
                className="z-40 cursor-pointer"
                onClick={() => setSelectedBookPreview(book)}
              >
                <SimpleBookPreview book={book} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: selectedBookPreview ? "block" : "none" }}>
        <BookPreviewModal
          bookId={selectedBookPreview?.id ?? ""}
          onCloseModal={onClickCloseModal}
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
  bookId: string;
  onCloseModal: () => void;
}) => {
  const publication = api.publication.findByBookId.useQuery({
    id: props.bookId,
  });
  const images = publication.data?.images;
  return (
    <ModalForm
      style="min-w-[600px] min-h-[400px]"
      title={publication.data?.book.title ?? "Preview"}
    >
      {publication.isLoading ? (
        <div className="grid h-full w-full place-content-center">
          <LoadingSpinner color="border-pink" />
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="h-[250px] w-full bg-black bg-opacity-30">
            <Carousel slides={images ?? []} />
          </div>
          <div className="mt-5 flex justify-between">
            <button className="rounded-small bg-pink p-2 font-bold text-white">
              Confirmar intercambio
            </button>
            <button
              onClick={props.onCloseModal}
              className="font-bold text-red-500"
            >
              Salir
            </button>
          </div>
        </div>
      )}
    </ModalForm>
  );
};

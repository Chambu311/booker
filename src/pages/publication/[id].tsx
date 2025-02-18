import { GetServerSidePropsContext } from "next";
import {
  BookWithImages,
} from "~/components/ui/book-card";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { LoadingSpinner } from "~/components/ui/loading";
import toast, { Toaster } from "react-hot-toast";
import Carousel from "~/components/ui/carousel";
import MainLayout from "~/components/layouts/MainLayout";

// Add this type if not already defined
type Review = {
  id: string;
  comment: string | null;
  rating: number;
  fromUserId: string;
  toUserId: string;
};

export default function PublicationDetail(props: {
  book: BookWithImages;
}) {
  const { book } = props;
  const session = useSession();
  const userQuery = api.user.findById.useQuery({ id: book?.userId });
  const swapQuery = api.swap.findSwapByUsersIdsAndBookId.useQuery({
    holderId: book?.userId,
    requesterId: session.data?.user.id ?? "",
    holderBookId: book?.id,
  });
  const newSwapMutation = api.swap.createInitialSwapRequest.useMutation();
  console.log("book user id", book.userId);
  const onClickSendSwapRequest = () => {
    newSwapMutation.mutate(
      {
        requesterId: session.data?.user.id ?? "",
        holderId: book.userId,
        holderBookId: book.id,
      },
      {
        onSuccess: async () => {
          await swapQuery.refetch();
          toast.success("Solicitud enviada con éxito.");
        },
        onError: () => {
          toast.error("Ya has seleccionado este libro en otra solicitud");
        },
      },
    );
  };
  return (
    <MainLayout>
      <div className="flex min-h-screen flex-col px-6 md:px-10 lg:px-20">
        <Toaster position="top-center" />
        
        {/* Main book info section */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-8">
          {/* Image Carousel Section */}
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden bg-gray-50">
            <Carousel slides={book.images} />
          </div>

          {/* Book Details Section */}
          <div className="w-full md:w-1/2 flex flex-col rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
            {/* User Info */}
            <div className="mb-6 flex justify-end">
              <Link
                href={`/profile/${userQuery?.data?.name}?view=library`}
                className="text-lg font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                @{userQuery?.data?.name ?? userQuery?.data?.email}
              </Link>
            </div>

            {/* Book Info */}
            <div className="space-y-6 flex-grow">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">Título</span>
                  <h1 className="text-2xl font-semibold text-gray-900">{book?.title}</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">Autor</span>
                  <p className="text-xl text-gray-800">{book?.author}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500 font-medium">Descripción</span>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-100">
              {!swapQuery.data ? (
                <button
                  onClick={onClickSendSwapRequest}
                  className="flex-1 rounded-xl bg-indigo-500 px-6 py-3 text-center 
                font-medium text-white shadow-sm"
                  disabled={newSwapMutation.isLoading}
                >
                  {newSwapMutation.isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <p>Enviando solicitud...</p>
                      <LoadingSpinner color="border-white" />
                    </div>
                  ) : (
                    "Enviar solicitud de intercambio"
                  )}
                </button>
              ) : (
                <div className="flex-1 rounded-xl bg-emerald-500 px-6 py-3 text-center 
              font-medium text-white shadow-sm">
                  Solicitud de intercambio enviada
                </div>
              )}

              <Link
                href={`/profile/${userQuery?.data?.name}?view=library`}
                className="flex-1"
              >
                <button className="w-full rounded-xl border border-gray-200 bg-white px-6 py-3 
                               text-center font-medium text-gray-700 shadow-sm hover:bg-gray-50 
                               focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 
                               transition-colors">
                  Ver más libros del usuario
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {userQuery.data?.reviewsPosted && userQuery.data.reviewsPosted.length > 0 && (
          <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Reseñas del usuario
            </h2>
            
            <div className="space-y-6">
              {userQuery.data.reviewsPosted.map((review: Review) => (
                <div 
                  key={review.id} 
                  className="flex flex-col gap-2 pb-6 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Star rating */}
                      <div className="flex items-center">
                        {[...Array(5)].map((_, index) => (
                          <svg
                            key={index}
                            className={`w-5 h-5 ${
                              index < review.rating 
                                ? 'text-yellow-400' 
                                : 'text-gray-200'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const bookId = ctx.params?.id as string;
  const bookFound = await prisma.book.findUnique({
    where: { id: bookId ?? "" },
    include: {
      genre: true,
      images: true,
    },
  });
  return {
    props: {
      book: JSON.parse(JSON.stringify(bookFound)),
    },
  };
}

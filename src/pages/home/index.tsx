import { api } from "~/utils/api";
import Navbar from "../../components/ui/Navbar";
import { useSession } from "next-auth/react";
import { PublicationCard } from "~/components/ui/book-card";
import { FeedFilter } from "~/components/feed-filter";
import { LoadingSpinner } from "~/components/ui/loading";
import { useRouter } from "next/router";
import { prisma } from "~/server/db";

export default function Home() {
  const router = useRouter();
  const session = useSession();
  const booksQuery = api.book.getBooksFeed.useQuery({
    userId: session.data?.user.id ?? "",
  });
  const books = booksQuery?.data;
  const onSearchSubmit = (input: unknown) => {
    return;
  };

  return (
    <div className="h-screen w-screen overflow-x-hidden">
      <nav className="pb-20">
        <Navbar onSearchSubmit={onSearchSubmit} />
      </nav>
      <main className="flex h-full w-full overflow-x-hidden p-10">
        <div className="w-[30%] p-5">
          <FeedFilter />
        </div>
        <div className="relative border-platinum border-[1px]  flex h-full w-[70%] flex-col gap-y-5 py-5">
          {!booksQuery.isLoading || !booksQuery.isRefetching ? (
            books?.map((book, index) => (
              <div
                key={index}
                className="cursor-pointer text-black"
                onClick={() => router.push(`/publication/${book?.id}`)}
              >
                <PublicationCard book={book} />
              </div>
            ))
          ) : (
            <div className="absolute grid h-full w-full place-content-center">
              <LoadingSpinner color={"border-pink"} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

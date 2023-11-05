import { api } from "~/utils/api";
import Navbar from "../../components/ui/Navbar";
import { useSession } from "next-auth/react";
import { BookWithImages, PublicationCard } from "~/components/ui/book-card";
import { LoadingSpinner } from "~/components/ui/loading";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Fuse from "fuse.js";

const options = {
  includeScore: true,
  includeMatches: true,
  findAllMathes: true,
  threshold: 0.3,
  keys: ["title", "author", "description", "genre.name"],
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedGenre = searchParams.get("genre");
  const searchValue = searchParams.get("search");
  const session = useSession();
  const booksQuery = api.book.getBooksFeed.useQuery({
    userId: session.data?.user.id ?? "",
    genre: selectedGenre,
  });
  const genreQuery = api.genre.getAll.useQuery();
  const genres = genreQuery.data;
  let books = booksQuery?.data;
  const fuse = new Fuse(books ?? [], options);
  if (searchValue) {
    const searchResults = fuse.search(searchValue);
    books = searchResults.map((result) => result.item);
  }

  const onSelectGenre = (input: string) => {
    const match = genres?.some((genre) => genre.name === input);
    if (match) {
      router.push(
        searchValue
          ? `?genre=${input}&search=${searchValue}`
          : `?genre=${input}`,
      );
    }
  };

  return (
    <div className="overflow-hidden">
      <nav className="pb-20">
        <Navbar />
      </nav>
      <main className="flex h-full w-full flex-col gap-y-10 overflow-x-hidden p-10">
        <div className="flex gap-5">
          {genres?.map((genre, index) => (
            <Link
              key={index}
              href={
                searchValue
                  ? `?genre=${genre.name}&search=${searchValue}`
                  : `?genre=${genre.name}`
              }
              className={`w-[100px] cursor-pointer rounded-big p-2 text-center text-black hover:bg-carisma-50 ${
                genre.name === selectedGenre
                  ? "border-2 border-carisma-400 bg-carisma-50"
                  : "bg-platinum"
              }`}
            >
              {genre.name}
            </Link>
          ))}
          <button
            onClick={() => router.push("/home")}
            className="p-2 hover:text-carisma-500"
          >
            Limpiar filtros
          </button>
          {/* <fieldset onChange={(e: any) => onSelectGenre(e.target.value)}>
            <input
              list="genre-list"
              placeholder="Género"
              className="my-auto h-7 rounded-small bg-platinum px-3 text-xl"
            />
            <datalist id="genre-list" defaultValue={selectedGenre ?? ""}>
              {genres?.map((genre, index) => (
                <option key={index} value={genre.name}></option>
              ))}
            </datalist>
          </fieldset> */}
        </div>
        <div className="relative flex h-full  w-full flex-col gap-y-5 border-[1px] border-platinum py-5">
          {!booksQuery.isLoading || !booksQuery.isRefetching ? (
            books?.map((book, index) => (
              <div
                key={index}
                className={`cursor-pointer text-black ${
                  books?.length && index === books?.length - 1
                    ? ""
                    : "border-b-[1px] border-platinum"
                }`}
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

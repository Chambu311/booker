import { api } from "~/utils/api";
import Navbar from "../../components/Navbar";
import { useSession } from "next-auth/react";
import { PublicationCard } from "~/components/book-card";
import { FeedFilter } from "~/components/feed-filter";
import { LoadingSpinner } from "~/components/loading";
import { useRouter } from "next/router";

export default function Home() {
  const query = api.user.getAll.useQuery();
  const router = useRouter();
  const session = useSession();
  const publicationsQuery = api.publication.getFeedPublications.useQuery({
    id: session.data?.user.id ?? "",
  });
  const publications = publicationsQuery.data;
  console.log("query", query.data);
  function onSearchSubmit(input: unknown) {
    return;
  }
  return (
    <div className="h-screen w-screen overflow-x-hidden">
      <nav className="pb-20">
        <Navbar onSearchSubmit={onSearchSubmit} />
      </nav>
      <main className="flex h-full w-full overflow-x-hidden">
        <div className="w-[20%] p-5">
          <FeedFilter />
        </div>
        <div className="relative grid h-full w-[80%] grid-cols-3 gap-x-20 p-10">
          {!publicationsQuery.isLoading || !publicationsQuery.isRefetching ? (
            publications?.map((pub) => (
              <div key={pub.id} className="text-black cursor-pointer" onClick={() => router.push(`/publication/${pub.id}`)}>
                <PublicationCard publication={pub} />
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

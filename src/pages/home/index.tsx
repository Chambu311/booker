import { api } from "~/utils/api";
import Navbar from "../../components/Navbar";
import { useSession } from "next-auth/react";
import { PublicationCard } from "~/components/book-card";

export default function Home() {
  const query = api.user.getAll.useQuery();
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
    <div className="h-screen w-screen">
      <nav className="pb-20">
        <Navbar onSearchSubmit={onSearchSubmit} />
      </nav>
      <main className="w-full h-full overflow-x-hidden">
        <div className="grid grid-cols-3  gap-x-[80px] p-10 h-full w-full">
          {publications?.map((pub) => (
            <div key={pub.id} className="text-black">
              <PublicationCard publication={pub} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

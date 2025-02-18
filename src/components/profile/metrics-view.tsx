import { useState } from "react";
import { api } from "~/utils/api";

const MetricsView = () => {
  const [tab, setTab] = useState(0);
  const userRanking = api.metrics.getUsersRankedBySwaps.useQuery();
  const genreRanking = api.metrics.getGenresRankedBySwaps.useQuery();
  const booksPerUser = api.metrics.getBooksUploadedPerUser.useQuery();
  const genreRankingData: any[] = genreRanking.data as any[];

  return (
    <div className="flex flex-col gap-y-5">
      <div className="flex gap-10">
        <p 
          onClick={() => setTab(0)} 
          className={`cursor-pointer ${tab === 0 ? 'text-carisma-500 font-bold' : ''}`}
        >
          Intercambios por usuario
        </p>
        <p 
          onClick={() => setTab(1)} 
          className={`cursor-pointer ${tab === 1 ? 'text-carisma-500 font-bold' : ''}`}
        >
          Géneros
        </p>
        <p 
          onClick={() => setTab(2)} 
          className={`cursor-pointer ${tab === 2 ? 'text-carisma-500 font-bold' : ''}`}
        >
          Libros por usuario
        </p>
      </div>
      <div className="flex flex-col rounded-normal border-[1px] border-platinum p-5 shadow-lg">
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full text-left text-sm font-light">
                <thead className="border-b font-medium dark:border-neutral-500">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      #
                    </th>
                    <th scope="col" className="px-6 py-4">
                      {tab === 1 ? "Género" : "Usuario"}
                    </th>
                    <th scope="col" className="px-6 py-4">
                      {tab === 0 ? "Cantidad de intercambios" : 
                       tab === 1 ? "Cantidad de intercambios" : 
                       "Cantidad de libros"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tab === 0 &&
                    userRanking.data?.map((item, index) => (
                      <tr key={index} className="border-b dark:border-neutral-500">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {item.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {Number(item.swapCount)}
                        </td>
                      </tr>
                    ))}
                  {tab === 1 &&
                    genreRankingData?.map((item, index) => (
                      <tr key={index} className="border-b dark:border-neutral-500">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {item.genre}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {Number(item.swapCount)}
                        </td>
                      </tr>
                    ))}
                  {tab === 2 &&
                    booksPerUser.data?.map((item, index) => (
                      <tr key={index} className="border-b dark:border-neutral-500">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {item.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {Number(item.bookCount)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsView;

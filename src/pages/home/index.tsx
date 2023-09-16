import { api } from "~/utils/api";
import Navbar from "../../components/Navbar";

export default function Home () {
    const query = api.user.getAll.useQuery()
    console.log('query', query.data);
    function onSearchSubmit (input: unknown) {
        return;
    }
    return (
        <div className="w-full h-[100vh]">
            <nav className="">
                <Navbar onSearchSubmit={onSearchSubmit} />
            </nav>
        </div>
    )
}
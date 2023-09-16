import { useRouter } from "next/router";

interface ICollection {
  name: string;
  id: string;
}

export default function CollectionCard(props: ICollection) {
  const router = useRouter();
  return (
    <div
      className="rounded-normal card relative flex h-[200px] w-[180px] cursor-pointer flex-col shadow-lg"
      onClick={() => void router.push(`/profile/catalog/${props.id}`)}
    >
      <div className="rounded-t-normal flex h-[40%] w-full justify-center bg-light-pink">
        <span className="my-auto text-[24px] text-black">{props.name}</span>
      </div>
      <style jsx>
        {`
          .card {
            transition: box-shadow ease 0.5s;
          }
          .card:hover {
            box-shadow:
              rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
              rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
          }
        `}
      </style>
    </div>
  );
}

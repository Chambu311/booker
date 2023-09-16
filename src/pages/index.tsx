import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";

export default function Home() {
  return <div className="">Booker</div>;
}

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  const session = await getServerAuthSession(ctx);
  if (!session) {
    return {
      redirect: { destination: "/auth/signin", permanent: false },
    };
  } else {
    return {
        redirect: { destination: '/home', permanent: false}
    }
  }
};

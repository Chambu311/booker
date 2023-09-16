import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import { signOut, useSession, signIn, getProviders } from "next-auth/react";
import { getServerSession } from "next-auth/next"
import { authOptions } from "~/server/auth";
const Signin: NextPage<{ csrfToken: never; providers: never }> = ({
  providers,
}) => {
  return (
    <main className="flex h-[100vh] overflow-y-hidden bg-white font-montserrat">
      <div className="relative h-full w-[70%] bg-login bg-cover bg-no-repeat"></div>
      <div className="flex h-full w-[30%] justify-center bg-white p-10">
        <div className="flex flex-col gap-10">
          <div className="text-center font-hayward text-[70px] text-pink">
            Booker
          </div>
          <div className="flex justify-center">
            {providers &&
              Object.values(providers).map((provider: any) => (
                <div key={provider?.name} style={{ marginBottom: 0 }}>
                  <button
                    className="flex items-center login-btn bg-pink p-5 text-white rounded-[10px] font-bold font-lg"
                    onClick={() => signIn(provider.id, { callbackUrl: "/home" })}
                  >
                    <div className="mdi mdi-github text-white"></div>
                    Sign in with {provider.name}{" "}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .login-btn {
            transition: opacity 0.7s ease;
          }
          .login-btn:hover {
            opacity: 0.6;
          }
        `}
      </style>
    </main>
  );
};

export default Signin;

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(context.req, context.res, authOptions);
    if (session) {
      return { redirect: { destination: "/home" } };
    }
    const providers = await getProviders();
    return {
      props: { providers: providers ?? [] },
    }
  }

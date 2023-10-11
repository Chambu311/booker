/* eslint-disable @typescript-eslint/require-await */
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GithubProvider from "next-auth/providers/github";
import CredentialsProviders from "next-auth/providers/credentials";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";

import { prisma } from "~/server/db";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  pages: {
    signIn: "auth/signin",
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProviders({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "juan123@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      authorize: async (credentials): Promise<any> => {
        if (!credentials?.email || !credentials?.password) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email and password are required.",
          });
        }
        const { email, password } = credentials;
        try {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found.",
            });
          }
          const userPassword = user.password;
          if (!userPassword) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "User password is missing.",
            });
          }
          const isValidPassword = await bcrypt.compare(password, userPassword);

          if (!isValidPassword) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid credentials.",
            });
          }
          return user;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while authorizing.",
          });
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

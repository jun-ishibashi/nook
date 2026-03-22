import "server-only";

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    jwt: async ({ token, user: oauthUser }) => {
      if (oauthUser?.email) {
        let dbUser = await prisma.user.findUnique({
          where: { email: oauthUser.email },
        });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              name: oauthUser.name ?? oauthUser.email ?? "",
              email: oauthUser.email,
              image: oauthUser.image ?? null,
            },
          });
        }
        token.id = dbUser.id;
        token.email = dbUser.email;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.id) {
        (session.user as { id: string }).id = token.id as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { name: true, image: true },
        });
        if (dbUser) {
          session.user.name = dbUser.name;
          session.user.image = dbUser.image;
        }
      }
      return session;
    },
  },
};

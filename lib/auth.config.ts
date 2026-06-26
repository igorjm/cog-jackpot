import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 2 * 24 * 60 * 60, // 48 hours
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: string }).role;
        token.status = (user as { status: string }).status;
        token.nickname = (user as { nickname: string }).nickname;
        token.avatar = (user as { avatar: string | null }).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { status: string }).status = token.status as string;
        (session.user as { nickname: string }).nickname =
          token.nickname as string;
        (session.user as { avatar: string | null }).avatar =
          token.avatar as string | null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

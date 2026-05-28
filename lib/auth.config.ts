import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [], // Credentials provider added in auth.ts (not edge-compatible)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
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

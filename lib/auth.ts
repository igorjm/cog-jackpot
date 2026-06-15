import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.error("[authorize] user not found:", credentials.email);
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.error("[authorize] invalid password for:", credentials.email);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            nickname: user.nickname,
            avatar: user.avatar,
            role: user.role,
            status: user.status,
          };
        } catch (e) {
          console.error("[authorize] DB/runtime error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: string }).role;
        token.status = (user as { status: string }).status;
        token.nickname = (user as { nickname: string }).nickname;
        token.avatar = (user as { avatar: string | null }).avatar;
      }
      // Always refresh from DB if status is pending (so approval is picked up)
      // Also refresh on explicit session update trigger
      if (
        token.id &&
        (token.status === "PENDING_PAYMENT" || trigger === "update")
      ) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { status: true, role: true, nickname: true, avatar: true },
        });
        if (dbUser) {
          token.status = dbUser.status;
          token.role = dbUser.role;
          token.nickname = dbUser.nickname;
          token.avatar = dbUser.avatar;
        }
      }
      return token;
    },
  },
});

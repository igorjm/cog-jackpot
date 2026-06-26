import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import { checkRateLimited } from "./rate-limit";

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

        const email = (credentials.email as string).toLowerCase().trim();

        if (await checkRateLimited(`login:email:${email}`, 5, 15 * 60 * 1000)) {
          console.error("[authorize] rate limited login attempt");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.error("[authorize] failed login attempt — user not found");
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.error("[authorize] failed login attempt — invalid password");
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: string }).role;
        token.status = (user as { status: string }).status;
        token.nickname = (user as { nickname: string }).nickname;
        token.avatar = (user as { avatar: string | null }).avatar;
      }

      if (token.id) {
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

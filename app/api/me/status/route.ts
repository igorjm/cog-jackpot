import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encode, decode } from "next-auth/jwt";
import { cookies } from "next/headers";

const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie?.value) {
    return NextResponse.json({ status: "UNAUTHENTICATED" }, { status: 401 });
  }

  // Decode the raw JWT to get the current token (without auth() which refreshes in-memory only)
  const token = await decode({
    token: sessionCookie.value,
    secret: process.env.AUTH_SECRET!,
    salt: COOKIE_NAME,
  });

  if (!token?.id) {
    return NextResponse.json({ status: "UNAUTHENTICATED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { status: true, role: true, nickname: true, avatar: true },
  });

  if (!user) {
    return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });
  }

  // If DB status differs from cookie token status, re-encode and set updated cookie
  if (user.status !== token.status) {
    token.status = user.status;
    token.role = user.role;
    token.nickname = user.nickname;
    token.avatar = user.avatar;

    const newTokenValue = await encode({
      token,
      secret: process.env.AUTH_SECRET!,
      salt: COOKIE_NAME,
    });

    const response = NextResponse.json({ status: user.status });
    response.cookies.set(COOKIE_NAME, newTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return response;
  }

  return NextResponse.json({ status: user.status });
}

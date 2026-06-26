import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  const publicRoutes = ["/login", "/register"];
  if (publicRoutes.includes(pathname)) {
    if (user) {
      const status = (user as { status: string }).status;
      if (status === "PENDING_PAYMENT") {
        return NextResponse.redirect(new URL("/pending", req.url));
      }
      if (status === "REJECTED") {
        return NextResponse.redirect(new URL("/rejected", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/pending") {
    if (!user) return NextResponse.redirect(new URL("/login", req.url));
    const status = (user as { status: string }).status;
    if (status === "APPROVED") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (status === "REJECTED") {
      return NextResponse.redirect(new URL("/rejected", req.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/rejected") {
    if (!user) return NextResponse.redirect(new URL("/login", req.url));
    const status = (user as { status: string }).status;
    if (status === "APPROVED") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (status === "PENDING_PAYMENT") {
      return NextResponse.redirect(new URL("/pending", req.url));
    }
    return NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const status = (user as { status: string }).status;
  if (status === "PENDING_PAYMENT") {
    return NextResponse.redirect(new URL("/pending", req.url));
  }
  if (status === "REJECTED") {
    return NextResponse.redirect(new URL("/rejected", req.url));
  }

  if (pathname.startsWith("/admin")) {
    const role = (user as { role: string }).role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|flags|pix-qrcode.png|derlis.png|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.m4a$).*)",
  ],
};

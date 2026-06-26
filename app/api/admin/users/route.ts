import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response;

  const users = await prisma.user.findMany({
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      name: true,
      email: true,
      nickname: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

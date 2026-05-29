import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json([], { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: [
      { status: "asc" }, // PENDING_PAYMENT first (alphabetically before APPROVED/REJECTED)
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

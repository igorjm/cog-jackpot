import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json([], { status: 403 });
  }

  const matches = await prisma.match.findMany({
    orderBy: { matchNumber: "asc" },
    select: {
      id: true,
      homeTeam: true,
      awayTeam: true,
      homeFlag: true,
      awayFlag: true,
      matchDate: true,
      homeScore: true,
      awayScore: true,
      matchNumber: true,
      phase: true,
    },
  });

  return NextResponse.json(matches);
}

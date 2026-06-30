import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response;

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
      winnerSide: true,
      matchNumber: true,
      phase: true,
      group: true,
    },
  });

  return NextResponse.json(matches);
}

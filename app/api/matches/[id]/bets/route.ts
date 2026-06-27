import { NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { isBeforeDeadline } from "@/lib/deadline";
import { enrichKnockoutTeams } from "@/lib/knockout-resolve";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApprovedSession();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  const matchRecord = await prisma.match.findUnique({
    where: { id },
    select: {
      id: true,
      matchNumber: true,
      matchDate: true,
      homeTeam: true,
      awayTeam: true,
      homeFlag: true,
      awayFlag: true,
      homeScore: true,
      awayScore: true,
      multiplier: true,
      phase: true,
      group: true,
    },
  });

  if (!matchRecord) {
    return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
  }

  if (isBeforeDeadline(matchRecord.matchDate)) {
    return NextResponse.json(
      { error: "Palpites só ficam visíveis após o encerramento das apostas" },
      { status: 403 }
    );
  }

  const allMatches = await prisma.match.findMany({ orderBy: { matchNumber: "asc" } });
  const match = enrichKnockoutTeams(allMatches).find((m) => m.id === id)!;

  const bets = await prisma.bet.findMany({
    where: {
      matchId: id,
      user: { status: "APPROVED", role: { not: "ADMIN" } },
    },
    select: {
      homeScore: true,
      awayScore: true,
      points: true,
      rawPoints: true,
      user: {
        select: {
          nickname: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: [{ points: "desc" }, { user: { nickname: "asc" } }],
  });

  return NextResponse.json({ match, bets });
}

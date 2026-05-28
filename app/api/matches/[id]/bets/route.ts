import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBeforeDeadline } from "@/lib/deadline";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const match = await prisma.match.findUnique({
    where: { id },
    select: {
      id: true,
      matchDate: true,
      homeTeam: true,
      awayTeam: true,
      homeFlag: true,
      awayFlag: true,
      homeScore: true,
      awayScore: true,
      multiplier: true,
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
  }

  // SECURITY: Only allow viewing bets after deadline has passed
  if (isBeforeDeadline(match.matchDate)) {
    return NextResponse.json(
      { error: "Palpites só ficam visíveis após o encerramento das apostas" },
      { status: 403 }
    );
  }

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

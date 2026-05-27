import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBeforeDeadline } from "@/lib/deadline";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const matches = await prisma.match.findMany({
    orderBy: { matchNumber: "asc" },
    include: {
      bets: {
        where: { userId: session.user.id },
        select: { homeScore: true, awayScore: true, points: true, rawPoints: true },
      },
    },
  });

  const result = matches.map((match) => {
    const userBet = match.bets[0] ?? null;
    const deadline = !isBeforeDeadline(match.matchDate);

    // Hide other users' bets before deadline (this only returns current user's bet)
    return {
      id: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeFlag: match.homeFlag,
      awayFlag: match.awayFlag,
      matchDate: match.matchDate.toISOString(),
      venue: match.venue,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      multiplier: match.multiplier,
      phase: match.phase,
      group: match.group,
      isLocked: deadline,
      userBet,
    };
  });

  return NextResponse.json(result);
}

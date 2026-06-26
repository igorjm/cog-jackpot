import { NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { isBeforeDeadline } from "@/lib/deadline";

export async function GET() {
  const guard = await requireApprovedSession();
  if (!guard.ok) return guard.response;

  const { session } = guard;

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
      liveHomeScore: match.liveHomeScore,
      liveAwayScore: match.liveAwayScore,
      matchStatus: match.matchStatus,
      multiplier: match.multiplier,
      phase: match.phase,
      group: match.group,
      isLocked: deadline,
      userBet,
    };
  });

  return NextResponse.json(result);
}

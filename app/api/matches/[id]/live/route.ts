import { NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/auth-guards";
import { getDisplayScore, isMatchLiveNow } from "@/lib/match-live";
import { refreshLiveScoresIfDue, shouldRefreshLiveScoresOnDemand } from "@/lib/live-sync";
import { parseMatchGoals } from "@/lib/match-goals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MATCH_SELECT = {
  id: true,
  homeScore: true,
  awayScore: true,
  liveHomeScore: true,
  liveAwayScore: true,
  halfTimeHome: true,
  halfTimeAway: true,
  liveGoals: true,
  matchStatus: true,
  matchDate: true,
  liveUpdatedAt: true,
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApprovedSession();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  let match = await prisma.match.findUnique({
    where: { id },
    select: MATCH_SELECT,
  });

  if (!match) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (isMatchLiveNow(match) && shouldRefreshLiveScoresOnDemand()) {
    await refreshLiveScoresIfDue();

    match = await prisma.match.findUnique({
      where: { id },
      select: MATCH_SELECT,
    });

    if (!match) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const display = getDisplayScore(match);
  const goals = parseMatchGoals(match.liveGoals);

  return NextResponse.json({
    matchId: match.id,
    homeScore: display.home,
    awayScore: display.away,
    isLive: display.isLive,
    isFinished: display.isFinished,
    matchStatus: match.matchStatus,
    halfTimeHome: match.halfTimeHome,
    halfTimeAway: match.halfTimeAway,
    goals,
    lastUpdated: match.liveUpdatedAt?.toISOString() ?? null,
    pollRecommended: isMatchLiveNow(match),
  });
}

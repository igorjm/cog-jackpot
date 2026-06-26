import type { Bet, Match, MatchStatus } from "@prisma/client";
import { prisma } from "./prisma";
import type { LiveMatchResult, MatchResult } from "./football-api";
import { resolveFlagCode } from "./team-codes";
import { calculatePoints, calculateFinalPoints } from "./scoring";

type MatchWithBets = Match & { bets: Bet[] };

async function findPendingDbMatch(
  result: Pick<MatchResult, "homeTla" | "awayTla" | "homeTeam" | "awayTeam" | "phase">
): Promise<MatchWithBets | null> {
  const homeFlag = resolveFlagCode({ tla: result.homeTla, name: result.homeTeam });
  const awayFlag = resolveFlagCode({ tla: result.awayTla, name: result.awayTeam });

  if (!homeFlag || !awayFlag) {
    console.warn(
      `[match-sync] Could not resolve teams: ${result.homeTeam} (${result.homeTla}) vs ${result.awayTeam} (${result.awayTla})`
    );
    return null;
  }

  const match = await prisma.match.findFirst({
    where: {
      homeFlag,
      awayFlag,
      phase: result.phase,
      homeScore: null,
    },
    include: { bets: true },
  });

  if (!match) {
    console.warn(
      `[match-sync] No pending DB match for: ${result.homeTeam} vs ${result.awayTeam} (${result.phase})`
    );
  }

  return match;
}

export async function findDbMatchForApiResult(
  result: MatchResult
): Promise<MatchWithBets | null> {
  return findPendingDbMatch(result);
}

export async function findDbMatchForLiveUpdate(
  result: LiveMatchResult
): Promise<Match | null> {
  const match = await findPendingDbMatch(result);
  return match;
}

export async function applyMatchResult(
  match: MatchWithBets,
  result: MatchResult
): Promise<void> {
  await prisma.match.update({
    where: { id: match.id },
    data: {
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      matchStatus: "FINISHED",
      liveHomeScore: null,
      liveAwayScore: null,
      liveUpdatedAt: null,
      isLocked: true,
    },
  });

  for (const bet of match.bets) {
    const pointsResult = calculatePoints(
      { homeScore: bet.homeScore, awayScore: bet.awayScore },
      { homeScore: result.homeScore, awayScore: result.awayScore }
    );
    const finalPoints = calculateFinalPoints(pointsResult.points, match.multiplier);

    await prisma.bet.update({
      where: { id: bet.id },
      data: { rawPoints: pointsResult.points, points: finalPoints },
    });
  }
}

export async function applyLiveMatchUpdate(
  match: Match,
  result: LiveMatchResult
): Promise<void> {
  await prisma.match.update({
    where: { id: match.id },
    data: {
      liveHomeScore: result.liveHomeScore,
      liveAwayScore: result.liveAwayScore,
      halfTimeHome: result.halfTimeHome,
      halfTimeAway: result.halfTimeAway,
      ...(result.goals.length > 0 ? { liveGoals: result.goals } : {}),
      matchStatus: result.status as MatchStatus,
      liveUpdatedAt: new Date(),
    },
  });
}

export async function syncFinishedMatchResults(
  results: MatchResult[]
): Promise<{ synced: number; skipped: number }> {
  let synced = 0;
  let skipped = 0;

  for (const result of results) {
    const match = await findDbMatchForApiResult(result);
    if (!match) {
      skipped++;
      continue;
    }

    await applyMatchResult(match, result);
    synced++;
  }

  return { synced, skipped };
}

/** Updates live scores only — never recalculates bet points. */
export async function syncLiveMatchScores(
  results: LiveMatchResult[]
): Promise<{ synced: number; skipped: number }> {
  let synced = 0;
  let skipped = 0;

  for (const result of results) {
    const match = await findDbMatchForLiveUpdate(result);
    if (!match) {
      skipped++;
      continue;
    }

    await applyLiveMatchUpdate(match, result);
    synced++;
  }

  return { synced, skipped };
}

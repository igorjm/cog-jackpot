import type { Bet, Match } from "@prisma/client";
import { prisma } from "./prisma";
import type { MatchResult } from "./football-api";
import { resolveFlagCode } from "./team-codes";
import { calculatePoints, calculateFinalPoints } from "./scoring";

type MatchWithBets = Match & { bets: Bet[] };

export async function findDbMatchForApiResult(
  result: MatchResult
): Promise<MatchWithBets | null> {
  const homeFlag = resolveFlagCode({ tla: result.homeTla, name: result.homeTeam });
  const awayFlag = resolveFlagCode({ tla: result.awayTla, name: result.awayTeam });

  if (!homeFlag || !awayFlag) {
    console.warn(
      `[sync-scores] Could not resolve teams: ${result.homeTeam} (${result.homeTla}) vs ${result.awayTeam} (${result.awayTla})`
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
      `[sync-scores] No pending DB match for: ${result.homeTeam} vs ${result.awayTeam} (${result.phase})`
    );
  }

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

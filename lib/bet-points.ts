import { prisma } from "./prisma";
import { calculatePoints, calculateFinalPoints } from "./scoring";

interface MatchWithScore {
  id: string;
  homeScore: number;
  awayScore: number;
  multiplier: number;
}

interface BetInput {
  id: string;
  homeScore: number;
  awayScore: number;
}

export async function recalculateBetPointsForMatch(
  match: MatchWithScore,
  bets: BetInput[]
): Promise<number> {
  let updated = 0;

  for (const bet of bets) {
    const result = calculatePoints(
      { homeScore: bet.homeScore, awayScore: bet.awayScore },
      { homeScore: match.homeScore, awayScore: match.awayScore }
    );

    const points = calculateFinalPoints(result.points, match.multiplier);

    await prisma.bet.update({
      where: { id: bet.id },
      data: {
        rawPoints: result.points,
        points,
      },
    });
    updated++;
  }

  return updated;
}

export async function recalculateBetPointsByMatchId(
  matchId: string
): Promise<number> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { bets: true },
  });

  if (!match || match.homeScore === null || match.awayScore === null) {
    return 0;
  }

  return recalculateBetPointsForMatch(
    {
      id: match.id,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      multiplier: match.multiplier,
    },
    match.bets
  );
}

export async function recalculateBetPointsByMatchNumbers(
  matchNumbers: number[]
): Promise<{ matchNumber: number; updated: number }[]> {
  const results: { matchNumber: number; updated: number }[] = [];

  for (const matchNumber of matchNumbers) {
    const match = await prisma.match.findUnique({
      where: { matchNumber },
      include: { bets: true },
    });

    if (!match || match.homeScore === null || match.awayScore === null) {
      results.push({ matchNumber, updated: 0 });
      continue;
    }

    const updated = await recalculateBetPointsForMatch(
      {
        id: match.id,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        multiplier: match.multiplier,
      },
      match.bets
    );
    results.push({ matchNumber, updated });
  }

  return results;
}

export interface BetPointsRecalculationResult {
  matchNumber: number;
  phase: string;
  multiplier: number;
  updated: number;
  changed: number;
  corrections: { rawPoints: number; from: number | null; to: number }[];
}

export async function recalculateAllFinishedBetPoints(options?: {
  multiplierOnly?: boolean;
}): Promise<BetPointsRecalculationResult[]> {
  const matches = await prisma.match.findMany({
    where: {
      homeScore: { not: null },
      awayScore: { not: null },
      phase: { not: "FRIENDLY" },
      ...(options?.multiplierOnly ? { multiplier: { not: 1 } } : {}),
    },
    include: { bets: true },
    orderBy: { matchNumber: "asc" },
  });

  const results: BetPointsRecalculationResult[] = [];

  for (const match of matches) {
    const corrections: BetPointsRecalculationResult["corrections"] = [];

    for (const bet of match.bets) {
      const { points: rawPoints } = calculatePoints(
        { homeScore: bet.homeScore, awayScore: bet.awayScore },
        { homeScore: match.homeScore!, awayScore: match.awayScore! }
      );
      const expectedPoints = calculateFinalPoints(rawPoints, match.multiplier);

      if (bet.points !== expectedPoints || bet.rawPoints !== rawPoints) {
        corrections.push({
          rawPoints,
          from: bet.points,
          to: expectedPoints,
        });
      }
    }

    const updated = await recalculateBetPointsForMatch(
      {
        id: match.id,
        homeScore: match.homeScore!,
        awayScore: match.awayScore!,
        multiplier: match.multiplier,
      },
      match.bets
    );

    results.push({
      matchNumber: match.matchNumber,
      phase: match.phase,
      multiplier: match.multiplier,
      updated,
      changed: corrections.length,
      corrections,
    });
  }

  return results;
}

import { prisma } from "./prisma";

export interface RankingEntry {
  userId: string;
  nickname: string;
  name: string;
  avatar: string | null;
  totalPoints: number;
  exactScores: number;
  correctWinners: number;
  rawTotalPoints: number;
  firstBetDate: Date | null;
  position: number;
  previousPosition?: number;
  positionChange?: number;
  lastPointsGained?: number | null;
}

export async function calculateRanking(): Promise<RankingEntry[]> {
  const users = await prisma.user.findMany({
    where: { status: "APPROVED", role: { not: "ADMIN" } },
    include: {
      bets: {
        where: {
          points: { not: null },
          match: {
            phase: { not: "FRIENDLY" },
            homeScore: { not: null },
          },
        },
        include: {
          match: { select: { phase: true, matchDate: true } },
        },
      },
      predictions: {
        where: { points: { not: null } },
      },
    },
  });

  const entries: RankingEntry[] = users.map((user) => {
    const betPoints = user.bets.reduce((sum, bet) => sum + (bet.points ?? 0), 0);
    const predictionPoints = user.predictions.reduce((sum, p) => sum + (p.points ?? 0), 0);
    const totalPoints = betPoints + predictionPoints;
    const exactScores = user.bets.filter((bet) => bet.rawPoints === 10).length;
    const correctWinners = user.bets.filter(
      (bet) => bet.rawPoints !== null && bet.rawPoints >= 5
    ).length;
    const rawTotalPoints = user.bets.reduce(
      (sum, bet) => sum + (bet.rawPoints ?? 0),
      0
    );
    const firstBetDate = user.bets.length > 0
      ? user.bets.reduce(
          (earliest, bet) =>
            bet.createdAt < earliest ? bet.createdAt : earliest,
          user.bets[0].createdAt
        )
      : null;

    const lastScoredBet = [...user.bets].sort(
      (a, b) => b.match.matchDate.getTime() - a.match.matchDate.getTime()
    )[0];
    const lastPointsGained = lastScoredBet?.points ?? null;

    return {
      userId: user.id,
      nickname: user.nickname,
      name: user.name,
      avatar: user.avatar,
      totalPoints,
      exactScores,
      correctWinners,
      rawTotalPoints,
      firstBetDate,
      position: 0,
      previousPosition: user.previousPosition ?? undefined,
      lastPointsGained,
    };
  });

  // Sort by tiebreaker rules
  entries.sort((a, b) => {
    // 1. Total points (desc)
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    // 2. Exact scores (desc)
    if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores;
    // 3. Correct winners (desc)
    if (b.correctWinners !== a.correctWinners) return b.correctWinners - a.correctWinners;
    // 4. Raw points without multiplier (desc)
    if (b.rawTotalPoints !== a.rawTotalPoints) return b.rawTotalPoints - a.rawTotalPoints;
    // 5. First bet date (asc - who bet first)
    if (a.firstBetDate && b.firstBetDate) {
      return a.firstBetDate.getTime() - b.firstBetDate.getTime();
    }
    return 0;
  });

  // Assign positions and calculate change from previous
  entries.forEach((entry, index) => {
    entry.position = index + 1;
    if (entry.previousPosition != null) {
      entry.positionChange = entry.previousPosition - entry.position;
    }
  });

  return entries;
}

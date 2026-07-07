import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { calculateRanking } from "@/lib/ranking";
import { enrichKnockoutTeams } from "@/lib/knockout-resolve";
import { KNOCKOUT_MATCH_NUMBER_MIN, type BracketMatchData } from "@/lib/bracket-tree";
import type { WinnerSide } from "@/lib/match-winner";

const CACHE_SECONDS = 120;

export const getCachedRanking = unstable_cache(
  () => calculateRanking(),
  ["ranking-v1"],
  { revalidate: CACHE_SECONDS }
);

export const getCachedApprovedPlayerCount = unstable_cache(
  () => prisma.user.count({ where: { status: "APPROVED", role: { not: "ADMIN" } } }),
  ["approved-player-count-v1"],
  { revalidate: CACHE_SECONDS }
);

const bracketMatchSelect = {
  id: true,
  matchNumber: true,
  homeTeam: true,
  awayTeam: true,
  homeFlag: true,
  awayFlag: true,
  homeScore: true,
  awayScore: true,
  winnerSide: true,
  phase: true,
  group: true,
} as const;

export const getCachedBracketMatches = unstable_cache(
  async (): Promise<BracketMatchData[]> => {
    const allMatches = await prisma.match.findMany({
      orderBy: { matchNumber: "asc" },
      select: bracketMatchSelect,
    });

    return enrichKnockoutTeams(allMatches)
      .filter((m) => m.matchNumber >= KNOCKOUT_MATCH_NUMBER_MIN)
      .map((m) => ({
        id: m.id,
        matchNumber: m.matchNumber,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeFlag: m.homeFlag,
        awayFlag: m.awayFlag,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        winnerSide:
          m.winnerSide === "home" || m.winnerSide === "away"
            ? (m.winnerSide as WinnerSide)
            : null,
      }));
  },
  ["bracket-matches-v1"],
  { revalidate: CACHE_SECONDS }
);

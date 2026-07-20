import { prisma } from "./prisma";
import { PREDICTION_POINTS } from "./constants";
import { enrichKnockoutTeams } from "./knockout-resolve";
import { resolveMatchWinnerSide, type WinnerSide } from "./match-winner";
import { FINAL_MATCH_NUMBER } from "./bracket-tree";

/**
 * Resolves the World Cup champion from the final (match 104), following the
 * same knockout enrichment used across the app. Returns the team name or null
 * if the final has not been played / cannot be resolved.
 */
export async function resolveChampionFromFinal(): Promise<string | null> {
  const allMatches = await prisma.match.findMany({ orderBy: { matchNumber: "asc" } });
  const enriched = enrichKnockoutTeams(allMatches);
  const final = enriched.find((m) => m.matchNumber === FINAL_MATCH_NUMBER);

  if (!final || final.homeScore === null || final.awayScore === null) return null;

  const side = resolveMatchWinnerSide({
    homeScore: final.homeScore,
    awayScore: final.awayScore,
    winnerSide: (final as { winnerSide?: string | null }).winnerSide as
      | WinnerSide
      | null
      | undefined,
  });

  if (side === "home") return final.homeTeam;
  if (side === "away") return final.awayTeam;
  return null;
}

export interface PredictionScoringResult {
  champion: string | null;
  topScorer: string | null;
  championCorrect: number;
  championScored: number;
  topScorerCorrect: number;
  topScorerScorer: number;
  dryRun: boolean;
}

/**
 * Scores the special predictions (champion + top scorer), awarding
 * PREDICTION_POINTS for a correct pick and 0 otherwise. Idempotent and safe to
 * re-run. Top scorer is only scored when `topScorer` is provided, since it has
 * no in-DB source of truth.
 */
export async function scorePredictions(opts: {
  champion?: string | null;
  topScorer?: string | null;
  dryRun?: boolean;
}): Promise<PredictionScoringResult> {
  const dryRun = opts.dryRun ?? false;
  const champion = opts.champion ?? (await resolveChampionFromFinal());
  const topScorer = opts.topScorer ?? null;

  let championCorrect = 0;
  let championScored = 0;
  let topScorerCorrect = 0;
  let topScorerScorer = 0;

  // --- Champion ---
  if (champion) {
    championCorrect = await prisma.prediction.count({
      where: { type: "CHAMPION", value: champion },
    });
    const totalChampion = await prisma.prediction.count({ where: { type: "CHAMPION" } });
    championScored = totalChampion;

    if (!dryRun) {
      await prisma.prediction.updateMany({
        where: { type: "CHAMPION", value: champion },
        data: { isCorrect: true, points: PREDICTION_POINTS },
      });
      await prisma.prediction.updateMany({
        where: { type: "CHAMPION", value: { not: champion } },
        data: { isCorrect: false, points: 0 },
      });
    }
  }

  // --- Top scorer ---
  if (topScorer) {
    topScorerCorrect = await prisma.prediction.count({
      where: { type: "TOP_SCORER", value: topScorer },
    });
    const totalScorer = await prisma.prediction.count({ where: { type: "TOP_SCORER" } });
    topScorerScorer = totalScorer;

    if (!dryRun) {
      await prisma.prediction.updateMany({
        where: { type: "TOP_SCORER", value: topScorer },
        data: { isCorrect: true, points: PREDICTION_POINTS },
      });
      await prisma.prediction.updateMany({
        where: { type: "TOP_SCORER", value: { not: topScorer } },
        data: { isCorrect: false, points: 0 },
      });
    }
  }

  return {
    champion,
    topScorer,
    championCorrect,
    championScored,
    topScorerCorrect,
    topScorerScorer,
    dryRun,
  };
}

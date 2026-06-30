import type { Phase } from "@prisma/client";
import { prisma } from "./prisma";
import type { MatchResult } from "./football-api";
import { resolveFlagCode } from "./team-codes";
import type { WinnerSide } from "./match-winner";
import { persistKnockoutTeamResolution } from "./knockout-resolve";

const KNOCKOUT_PHASES: Phase[] = [
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
];

async function findDbMatchByTeams(
  result: Pick<
    MatchResult,
    "homeTla" | "awayTla" | "homeTeam" | "awayTeam" | "phase"
  >
) {
  const homeFlag = resolveFlagCode({ tla: result.homeTla, name: result.homeTeam });
  const awayFlag = resolveFlagCode({ tla: result.awayTla, name: result.awayTeam });

  if (!homeFlag || !awayFlag) return null;

  return prisma.match.findFirst({
    where: {
      homeFlag,
      awayFlag,
      phase: result.phase,
    },
  });
}

/**
 * Updates winnerSide on finished knockout draws using API penalty/extra-time data.
 * Also runs when all API matches are already synced — Sync API still refreshes the bracket.
 */
export async function syncKnockoutWinnerSides(
  results: MatchResult[]
): Promise<number> {
  let updated = 0;

  for (const result of results) {
    if (!result.winnerSide) continue;
    if (!KNOCKOUT_PHASES.includes(result.phase)) continue;

    const match = await findDbMatchByTeams(result);
    if (!match || match.homeScore === null || match.awayScore === null) continue;

    // Penalty/extra-time winner matters when the stored score is level.
    if (match.homeScore !== match.awayScore) continue;
    if (match.winnerSide === result.winnerSide) continue;

    await prisma.match.update({
      where: { id: match.id },
      data: { winnerSide: result.winnerSide },
    });
    updated++;
  }

  if (updated > 0) {
    console.log(`[match-sync] Updated winnerSide on ${updated} knockout draw(s)`);
  }

  return updated;
}

export async function refreshKnockoutBracketFromApi(
  results: MatchResult[]
): Promise<{ winnerSidesUpdated: number; knockoutUpdated: number }> {
  const winnerSidesUpdated = await syncKnockoutWinnerSides(results);
  const knockoutUpdated = await persistKnockoutTeamResolution();
  return { winnerSidesUpdated, knockoutUpdated };
}

export function parseWinnerSide(value: FormDataEntryValue | null): WinnerSide | null {
  if (value === "home" || value === "away") return value;
  return null;
}

export function requiresKnockoutWinner(
  phase: Phase,
  homeScore: number,
  awayScore: number
): boolean {
  return KNOCKOUT_PHASES.includes(phase) && homeScore === awayScore;
}

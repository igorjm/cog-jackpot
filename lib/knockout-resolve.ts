import type { Phase } from "@prisma/client";
import {
  buildGroupStandings,
  type GroupTeamStanding,
  type FinishedMatch,
} from "./stats";
import { prisma } from "./prisma";
import {
  lookupThirdPlaceMapping,
  THIRD_PLACE_SLOT_WINNER,
} from "./third-place-annex-c";

export interface MatchForResolve {
  id: string;
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  homeScore: number | null;
  awayScore: number | null;
  phase: Phase;
  group: string | null;
}

export interface ResolvedTeam {
  team: string;
  flag: string;
}

const MATCHES_PER_GROUP = 6;

/** Original seed placeholders for knockout matches (used to re-resolve after group updates). */
const KNOCKOUT_PLACEHOLDERS: Record<
  number,
  Pick<MatchForResolve, "homeTeam" | "awayTeam" | "homeFlag" | "awayFlag">
> = {
  73: { homeTeam: "2º Grupo A", awayTeam: "2º Grupo B", homeFlag: "xx", awayFlag: "xx" },
  74: { homeTeam: "1º Grupo E", awayTeam: "3º ABCDF", homeFlag: "xx", awayFlag: "xx" },
  75: { homeTeam: "1º Grupo F", awayTeam: "2º Grupo C", homeFlag: "xx", awayFlag: "xx" },
  76: { homeTeam: "1º Grupo C", awayTeam: "2º Grupo F", homeFlag: "xx", awayFlag: "xx" },
  77: { homeTeam: "1º Grupo I", awayTeam: "3º CDFGH", homeFlag: "xx", awayFlag: "xx" },
  78: { homeTeam: "2º Grupo E", awayTeam: "2º Grupo I", homeFlag: "xx", awayFlag: "xx" },
  79: { homeTeam: "1º Grupo A", awayTeam: "3º CEFHI", homeFlag: "xx", awayFlag: "xx" },
  80: { homeTeam: "1º Grupo L", awayTeam: "3º EHIJK", homeFlag: "xx", awayFlag: "xx" },
  81: { homeTeam: "1º Grupo D", awayTeam: "3º BEFIJ", homeFlag: "xx", awayFlag: "xx" },
  82: { homeTeam: "1º Grupo G", awayTeam: "3º AEHIJ", homeFlag: "xx", awayFlag: "xx" },
  83: { homeTeam: "2º Grupo K", awayTeam: "2º Grupo L", homeFlag: "xx", awayFlag: "xx" },
  84: { homeTeam: "1º Grupo H", awayTeam: "2º Grupo J", homeFlag: "xx", awayFlag: "xx" },
  85: { homeTeam: "1º Grupo B", awayTeam: "3º EFGIJ", homeFlag: "xx", awayFlag: "xx" },
  86: { homeTeam: "1º Grupo J", awayTeam: "2º Grupo H", homeFlag: "xx", awayFlag: "xx" },
  87: { homeTeam: "1º Grupo K", awayTeam: "3º DEIJL", homeFlag: "xx", awayFlag: "xx" },
  88: { homeTeam: "2º Grupo D", awayTeam: "2º Grupo G", homeFlag: "xx", awayFlag: "xx" },
  89: { homeTeam: "Venc. Jogo 74", awayTeam: "Venc. Jogo 77", homeFlag: "xx", awayFlag: "xx" },
  90: { homeTeam: "Venc. Jogo 73", awayTeam: "Venc. Jogo 75", homeFlag: "xx", awayFlag: "xx" },
  91: { homeTeam: "Venc. Jogo 76", awayTeam: "Venc. Jogo 78", homeFlag: "xx", awayFlag: "xx" },
  92: { homeTeam: "Venc. Jogo 79", awayTeam: "Venc. Jogo 80", homeFlag: "xx", awayFlag: "xx" },
  93: { homeTeam: "Venc. Jogo 83", awayTeam: "Venc. Jogo 84", homeFlag: "xx", awayFlag: "xx" },
  94: { homeTeam: "Venc. Jogo 81", awayTeam: "Venc. Jogo 82", homeFlag: "xx", awayFlag: "xx" },
  95: { homeTeam: "Venc. Jogo 86", awayTeam: "Venc. Jogo 88", homeFlag: "xx", awayFlag: "xx" },
  96: { homeTeam: "Venc. Jogo 85", awayTeam: "Venc. Jogo 87", homeFlag: "xx", awayFlag: "xx" },
  97: { homeTeam: "Venc. Jogo 89", awayTeam: "Venc. Jogo 90", homeFlag: "xx", awayFlag: "xx" },
  98: { homeTeam: "Venc. Jogo 93", awayTeam: "Venc. Jogo 94", homeFlag: "xx", awayFlag: "xx" },
  99: { homeTeam: "Venc. Jogo 91", awayTeam: "Venc. Jogo 92", homeFlag: "xx", awayFlag: "xx" },
  100: { homeTeam: "Venc. Jogo 95", awayTeam: "Venc. Jogo 96", homeFlag: "xx", awayFlag: "xx" },
  101: { homeTeam: "Venc. Jogo 97", awayTeam: "Venc. Jogo 98", homeFlag: "xx", awayFlag: "xx" },
  102: { homeTeam: "Venc. Jogo 99", awayTeam: "Venc. Jogo 100", homeFlag: "xx", awayFlag: "xx" },
  103: { homeTeam: "Perd. Jogo 101", awayTeam: "Perd. Jogo 102", homeFlag: "xx", awayFlag: "xx" },
  104: { homeTeam: "Venc. Jogo 101", awayTeam: "Venc. Jogo 102", homeFlag: "xx", awayFlag: "xx" },
};

function resetUnplayedKnockoutPlaceholders<T extends MatchForResolve>(
  matches: T[]
): T[] {
  return matches.map((m) => {
    if (m.matchNumber < 73 || m.homeScore !== null) return m;
    const ph = KNOCKOUT_PLACEHOLDERS[m.matchNumber];
    if (!ph) return m;
    return { ...m, ...ph };
  });
}

/** R32 third-place slots in assignment order (FIFA 2026 bracket) */
const THIRD_PLACE_SLOTS = [
  "ABCDF",
  "CDFGH",
  "CEFHI",
  "EHIJK",
  "BEFIJ",
  "AEHIJ",
  "EFGIJ",
  "DEIJL",
] as const;

type EnrichedMatch = MatchForResolve;

function toFinishedMatch(m: MatchForResolve): FinishedMatch | null {
  if (m.homeScore === null || m.awayScore === null) return null;
  return {
    id: m.id,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeFlag: m.homeFlag,
    awayFlag: m.awayFlag,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    phase: m.phase,
    group: m.group,
  };
}

function sortThirdPlaceTeams(teams: (GroupTeamStanding & { group: string })[]) {
  return [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team);
  });
}

function isGroupComplete(group: string, matches: MatchForResolve[]): boolean {
  const groupMatches = matches.filter(
    (m) => m.phase === "GROUP" && m.group === group
  );
  if (groupMatches.length < MATCHES_PER_GROUP) return false;
  return groupMatches.every((m) => m.homeScore !== null && m.awayScore !== null);
}

function buildThirdPlaceAssignments(
  matches: MatchForResolve[]
): Map<string, ResolvedTeam> {
  const assignments = new Map<string, ResolvedTeam>();

  const finished = matches
    .map(toFinishedMatch)
    .filter((m): m is FinishedMatch => m !== null);
  const standings = buildGroupStandings(finished);

  const thirdPlaceTeams = standings
    .map((g) => {
      if (!isGroupComplete(g.group, matches)) return null;
      const third = g.teams[2];
      return third ? { ...third, group: g.group } : null;
    })
    .filter((t): t is GroupTeamStanding & { group: string } => t !== null);

  if (thirdPlaceTeams.length < 8) return assignments;

  const rankedThirds = sortThirdPlaceTeams(thirdPlaceTeams);
  const qualifyingThirds = rankedThirds.slice(0, 8);
  const qualifyingGroups = qualifyingThirds.map((t) => t.group);

  const winnerToThirdGroup = lookupThirdPlaceMapping(qualifyingGroups);
  if (!winnerToThirdGroup) return assignments;

  const thirdByGroup = new Map(
    thirdPlaceTeams.map((t) => [t.group, { team: t.team, flag: t.flag }])
  );

  for (const eligibleGroups of THIRD_PLACE_SLOTS) {
    const key = `3º ${eligibleGroups}`;
    const winnerGroup = THIRD_PLACE_SLOT_WINNER[eligibleGroups];
    if (!winnerGroup) continue;

    const thirdGroup = winnerToThirdGroup.get(winnerGroup);
    if (!thirdGroup) continue;

    const resolved = thirdByGroup.get(thirdGroup);
    if (resolved) {
      assignments.set(key, resolved);
    }
  }

  return assignments;
}

function getGroupTeam(
  group: string,
  position: 0 | 1 | 2,
  matches: MatchForResolve[]
): ResolvedTeam | null {
  if (!isGroupComplete(group, matches)) return null;

  const finished = matches
    .map(toFinishedMatch)
    .filter((m): m is FinishedMatch => m !== null);
  const standings = buildGroupStandings(finished);
  const groupStanding = standings.find((g) => g.group === group);
  const team = groupStanding?.teams[position];
  return team ? { team: team.team, flag: team.flag } : null;
}

function getSideTeam(match: EnrichedMatch, side: "home" | "away"): ResolvedTeam {
  return {
    team: side === "home" ? match.homeTeam : match.awayTeam,
    flag: side === "home" ? match.homeFlag : match.awayFlag,
  };
}

function getMatchWinner(
  match: EnrichedMatch | undefined
): ResolvedTeam | null {
  if (!match || match.homeScore === null || match.awayScore === null) return null;

  const home = getSideTeam(match, "home");
  const away = getSideTeam(match, "away");

  if (home.flag === "xx" || away.flag === "xx") return null;

  if (match.homeScore > match.awayScore) return home;
  if (match.awayScore > match.homeScore) return away;
  return null;
}

function getMatchLoser(
  match: EnrichedMatch | undefined
): ResolvedTeam | null {
  if (!match || match.homeScore === null || match.awayScore === null) return null;

  const home = getSideTeam(match, "home");
  const away = getSideTeam(match, "away");

  if (home.flag === "xx" || away.flag === "xx") return null;

  if (match.homeScore > match.awayScore) return away;
  if (match.awayScore > match.homeScore) return home;
  return null;
}

function resolvePlaceholder(
  teamName: string,
  matches: EnrichedMatch[],
  thirdPlaceAssignments: Map<string, ResolvedTeam>
): ResolvedTeam | null {
  const groupPosMatch = teamName.match(/^([12])º Grupo ([A-L])$/);
  if (groupPosMatch) {
    const position = (parseInt(groupPosMatch[1], 10) - 1) as 0 | 1;
    return getGroupTeam(groupPosMatch[2], position, matches);
  }

  const thirdMatch = teamName.match(/^3º ([A-L]+)$/);
  if (thirdMatch) {
    return thirdPlaceAssignments.get(teamName) ?? null;
  }

  const winnerMatch = teamName.match(/^Venc\. Jogo (\d+)$/);
  if (winnerMatch) {
    const source = matches.find(
      (m) => m.matchNumber === parseInt(winnerMatch[1], 10)
    );
    return getMatchWinner(source);
  }

  const loserMatch = teamName.match(/^Perd\. Jogo (\d+)$/);
  if (loserMatch) {
    const source = matches.find(
      (m) => m.matchNumber === parseInt(loserMatch[1], 10)
    );
    return getMatchLoser(source);
  }

  return null;
}

/**
 * Resolves knockout placeholder teams/flags from group standings and finished matches.
 * Returns a new array with confirmed teams showing real names and flags.
 */
export function enrichKnockoutTeams<T extends MatchForResolve>(matches: T[]): T[] {
  const withPlaceholders = resetUnplayedKnockoutPlaceholders(matches);
  const enriched: EnrichedMatch[] = withPlaceholders.map((m) => ({ ...m }));
  const thirdPlaceAssignments = buildThirdPlaceAssignments(matches);

  for (let pass = 0; pass < 12; pass++) {
    let changed = false;

    for (const match of enriched) {
      if (match.homeFlag === "xx") {
        const resolved = resolvePlaceholder(
          match.homeTeam,
          enriched,
          thirdPlaceAssignments
        );
        if (resolved) {
          match.homeTeam = resolved.team;
          match.homeFlag = resolved.flag;
          changed = true;
        }
      }

      if (match.awayFlag === "xx") {
        const resolved = resolvePlaceholder(
          match.awayTeam,
          enriched,
          thirdPlaceAssignments
        );
        if (resolved) {
          match.awayTeam = resolved.team;
          match.awayFlag = resolved.flag;
          changed = true;
        }
      }
    }

    if (!changed) break;
  }

  return enriched as T[];
}

/**
 * Writes newly confirmed knockout teams/flags to the database.
 * Called automatically after results sync so placeholders become real teams without manual updates.
 */
export async function persistKnockoutTeamResolution(): Promise<number> {
  const matches = await prisma.match.findMany({
    orderBy: { matchNumber: "asc" },
    select: {
      id: true,
      matchNumber: true,
      homeTeam: true,
      awayTeam: true,
      homeFlag: true,
      awayFlag: true,
      homeScore: true,
      awayScore: true,
      phase: true,
      group: true,
    },
  });

  const enriched = enrichKnockoutTeams(matches);
  let updated = 0;

  for (const original of matches) {
    const resolved = enriched.find((m) => m.id === original.id);
    if (!resolved) continue;

    // Only update team slots for unplayed matches (avoid rewriting history).
    if (original.homeScore !== null || original.awayScore !== null) continue;
    if (original.matchNumber < 73) continue;

    const homeChanged =
      resolved.homeTeam !== original.homeTeam ||
      resolved.homeFlag !== original.homeFlag;
    const awayChanged =
      resolved.awayTeam !== original.awayTeam ||
      resolved.awayFlag !== original.awayFlag;

    if (!homeChanged && !awayChanged) continue;

    await prisma.match.update({
      where: { id: original.id },
      data: {
        ...(homeChanged
          ? { homeTeam: resolved.homeTeam, homeFlag: resolved.homeFlag }
          : {}),
        ...(awayChanged
          ? { awayTeam: resolved.awayTeam, awayFlag: resolved.awayFlag }
          : {}),
      },
    });
    updated++;
  }

  if (updated > 0) {
    console.log(`[knockout-resolve] Updated ${updated} knockout match(es) with confirmed teams`);
  }

  return updated;
}

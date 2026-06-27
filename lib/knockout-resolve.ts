import type { Phase } from "@prisma/client";
import {
  buildGroupStandings,
  type GroupTeamStanding,
  type FinishedMatch,
} from "./stats";
import { prisma } from "./prisma";

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

  if (thirdPlaceTeams.length === 0) return assignments;

  // Best 8 third-placed teams among groups that have finished (FIFA rules).
  // Slots are filled as soon as enough groups are complete; remaining slots
  // update when more groups finish.
  const rankedThirds = sortThirdPlaceTeams(thirdPlaceTeams).slice(0, 8);
  const assigned = new Set<string>();

  for (const eligibleGroups of THIRD_PLACE_SLOTS) {
    const key = `3º ${eligibleGroups}`;
    const eligible = eligibleGroups.split("");
    const candidate = rankedThirds.find(
      (t) => eligible.includes(t.group) && !assigned.has(t.flag)
    );
    if (candidate) {
      assigned.add(candidate.flag);
      assignments.set(key, { team: candidate.team, flag: candidate.flag });
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
  const enriched: EnrichedMatch[] = matches.map((m) => ({ ...m }));
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

    const homeChanged =
      original.homeFlag === "xx" && resolved.homeFlag !== "xx";
    const awayChanged =
      original.awayFlag === "xx" && resolved.awayFlag !== "xx";

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

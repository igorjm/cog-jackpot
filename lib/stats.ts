import type { Phase } from "@prisma/client";
import {
  CONFEDERATION_ORDER,
  getConfederation,
  type Confederation,
} from "./confederations";
import { PHASE_LABELS } from "./constants";

export interface FinishedMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  homeScore: number;
  awayScore: number;
  phase: Phase;
  group?: string | null;
}

export interface GroupTeamStanding {
  team: string;
  flag: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface GroupStanding {
  group: string;
  teams: GroupTeamStanding[];
}

export interface TeamGoalsRecord {
  team: string;
  flag: string;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  played: number;
}

export interface OutcomeBias {
  draws: { betPct: number; actualPct: number };
  homeWins: { betPct: number; actualPct: number };
  awayWins: { betPct: number; actualPct: number };
}

export interface ScoreBiasEntry {
  score: string;
  betPct: number;
  actualPct: number;
  diff: number;
}

export interface BetRecord {
  userId: string;
  nickname: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  rawPoints: number | null;
  createdAt: Date;
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    phase: Phase;
    homeScore: number | null;
    awayScore: number | null;
  };
}

export interface BarItem {
  label: string;
  value: number;
  percentage: number;
  isOther?: boolean;
}

export interface ConfederationRecord {
  confederation: Confederation;
  label: string;
  wins: number;
  draws: number;
  losses: number;
  totalGames: number;
}

export interface TournamentSummary {
  finishedMatches: number;
  totalGoals: number;
  avgGoalsPerGame: number;
  drawPercentage: number;
  highestScoringMatch: { label: string; goals: number } | null;
}

export interface HomeAwayBreakdown {
  homeWins: number;
  draws: number;
  awayWins: number;
  total: number;
}

export interface TournamentStats {
  summary: TournamentSummary;
  confederations: ConfederationRecord[];
  scoreFrequency: BarItem[];
  goalsByPhase: BarItem[];
  homeAway: HomeAwayBreakdown;
  groupStandings: GroupStanding[];
  topScorers: TeamGoalsRecord[];
  bestDefense: TeamGoalsRecord[];
}

export interface LeaderboardEntry {
  label: string;
  value: number;
  sublabel?: string;
}

export interface MyStatsComparison {
  totalPoints: number;
  exactScores: number;
  accuracy: number;
  poolAvgPoints: number;
  poolAvgAccuracy: number;
  poolAvgExacts: number;
}

export interface BetVsReality {
  mostBetScore: string;
  mostBetCount: number;
  mostActualScore: string;
  mostActualCount: number;
  outcomeBias: OutcomeBias;
  scoreBias: ScoreBiasEntry[];
}

export interface CollectiveMiss {
  matchLabel: string;
  zeroPointRate: number;
  betCount: number;
}

const SCENARIO_LABELS: Record<number, string> = {
  10: "Placar exato (10 pts)",
  7: "Vencedor + 1 placar (7 pts)",
  5: "Vencedor ou empate (5 pts)",
  2: "1 placar correto (2 pts)",
  0: "Errou (0 pts)",
};

export interface PoolStats {
  poolAccuracy: number;
  myStats: MyStatsComparison | null;
  topExact: LeaderboardEntry[];
  topStreaks: LeaderboardEntry[];
  topDrawMasters: LeaderboardEntry[];
  topBetScores: LeaderboardEntry[];
  performanceByPhase: BarItem[];
  pointsDistribution: BarItem[];
  scenarioDistribution: BarItem[];
  betVsReality: BetVsReality | null;
  biggestCollectiveMiss: CollectiveMiss | null;
}

function formatScore(home: number, away: number): string {
  return `${home} × ${away}`;
}

function bucketTopN(
  counts: Map<string, number>,
  topN: number,
  otherLabel = "Outros"
): BarItem[] {
  const total = [...counts.values()].reduce((s, v) => s + v, 0);
  if (total === 0) return [];

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, topN);
  const rest = sorted.slice(topN);
  const restTotal = rest.reduce((s, [, v]) => s + v, 0);

  const items: BarItem[] = top.map(([label, value]) => ({
    label,
    value,
    percentage: Math.round((value / total) * 100),
  }));

  if (restTotal > 0) {
    items.push({
      label: otherLabel,
      value: restTotal,
      percentage: Math.round((restTotal / total) * 100),
      isOther: true,
    });
  }

  return items;
}

function recordTeamResult(
  records: Map<Confederation, { wins: number; draws: number; losses: number }>,
  flag: string,
  result: "win" | "draw" | "loss"
) {
  const confed = getConfederation(flag);
  if (!confed || confed === "OTHER") return;

  const prev = records.get(confed) ?? { wins: 0, draws: 0, losses: 0 };
  if (result === "win") prev.wins++;
  else if (result === "draw") prev.draws++;
  else prev.losses++;
  records.set(confed, prev);
}

function getMatchResult(
  homeScore: number,
  awayScore: number,
  side: "home" | "away"
): "win" | "draw" | "loss" {
  if (homeScore === awayScore) return "draw";
  if (side === "home") return homeScore > awayScore ? "win" : "loss";
  return awayScore > homeScore ? "win" : "loss";
}

function getOrCreateStanding(
  map: Map<string, GroupTeamStanding>,
  team: string,
  flag: string
): GroupTeamStanding {
  if (!map.has(flag)) {
    map.set(flag, {
      team,
      flag,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    });
  }
  return map.get(flag)!;
}

function applyStandingResult(
  standing: GroupTeamStanding,
  goalsFor: number,
  goalsAgainst: number,
  result: "win" | "draw" | "loss"
) {
  standing.played++;
  standing.goalsFor += goalsFor;
  standing.goalsAgainst += goalsAgainst;
  standing.goalDiff = standing.goalsFor - standing.goalsAgainst;
  if (result === "win") {
    standing.wins++;
    standing.points += 3;
  } else if (result === "draw") {
    standing.draws++;
    standing.points += 1;
  } else {
    standing.losses++;
  }
}

function sortStandings(teams: GroupTeamStanding[]): GroupTeamStanding[] {
  return teams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team);
  });
}

function calculateGroupStandings(matches: FinishedMatch[]): GroupStanding[] {
  const groupMaps = new Map<string, Map<string, GroupTeamStanding>>();

  for (const m of matches) {
    if (m.phase !== "GROUP" || !m.group) continue;
    if (m.homeFlag === "xx" || m.awayFlag === "xx") continue;

    if (!groupMaps.has(m.group)) groupMaps.set(m.group, new Map());
    const teamMap = groupMaps.get(m.group)!;

    const home = getOrCreateStanding(teamMap, m.homeTeam, m.homeFlag);
    const away = getOrCreateStanding(teamMap, m.awayTeam, m.awayFlag);

    applyStandingResult(
      home,
      m.homeScore,
      m.awayScore,
      getMatchResult(m.homeScore, m.awayScore, "home")
    );
    applyStandingResult(
      away,
      m.awayScore,
      m.homeScore,
      getMatchResult(m.homeScore, m.awayScore, "away")
    );
  }

  return [...groupMaps.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, teamMap]) => ({
      group,
      teams: sortStandings([...teamMap.values()]),
    }));
}

function calculateTeamGoals(matches: FinishedMatch[]): TeamGoalsRecord[] {
  const teams = new Map<string, TeamGoalsRecord>();

  for (const m of matches) {
    if (m.homeFlag === "xx" || m.awayFlag === "xx") continue;

    for (const side of [
      { team: m.homeTeam, flag: m.homeFlag, gf: m.homeScore, ga: m.awayScore },
      { team: m.awayTeam, flag: m.awayFlag, gf: m.awayScore, ga: m.homeScore },
    ]) {
      if (!teams.has(side.flag)) {
        teams.set(side.flag, {
          team: side.team,
          flag: side.flag,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDiff: 0,
          played: 0,
        });
      }
      const t = teams.get(side.flag)!;
      t.played++;
      t.goalsFor += side.gf;
      t.goalsAgainst += side.ga;
      t.goalDiff = t.goalsFor - t.goalsAgainst;
    }
  }

  return [...teams.values()];
}

function pct(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

export function calculateTournamentStats(
  matches: FinishedMatch[]
): TournamentStats {
  const confedMap = new Map<
    Confederation,
    { wins: number; draws: number; losses: number }
  >();
  const scoreCounts = new Map<string, number>();
  const phaseGoals = new Map<Phase, number>();
  let totalGoals = 0;
  let draws = 0;
  let homeWins = 0;
  let awayWins = 0;
  let highestGoals = 0;
  let highestMatch: { label: string; goals: number } | null = null;

  for (const m of matches) {
    const goals = m.homeScore + m.awayScore;
    totalGoals += goals;
    scoreCounts.set(
      formatScore(m.homeScore, m.awayScore),
      (scoreCounts.get(formatScore(m.homeScore, m.awayScore)) ?? 0) + 1
    );
    phaseGoals.set(m.phase, (phaseGoals.get(m.phase) ?? 0) + goals);

    if (goals > highestGoals) {
      highestGoals = goals;
      highestMatch = {
        label: `${m.homeTeam} ${m.homeScore}×${m.awayScore} ${m.awayTeam}`,
        goals,
      };
    }

    if (m.homeScore === m.awayScore) {
      draws++;
      recordTeamResult(confedMap, m.homeFlag, "draw");
      recordTeamResult(confedMap, m.awayFlag, "draw");
    } else if (m.homeScore > m.awayScore) {
      homeWins++;
      recordTeamResult(confedMap, m.homeFlag, "win");
      recordTeamResult(confedMap, m.awayFlag, "loss");
    } else {
      awayWins++;
      recordTeamResult(confedMap, m.homeFlag, "loss");
      recordTeamResult(confedMap, m.awayFlag, "win");
    }
  }

  const finished = matches.length;
  const confederations: ConfederationRecord[] = CONFEDERATION_ORDER.filter(
    (c) => confedMap.has(c)
  ).map((c) => {
    const { wins, draws: d, losses } = confedMap.get(c)!;
    return {
      confederation: c,
      label: c,
      wins,
      draws: d,
      losses,
      totalGames: wins + d + losses,
    };
  });

  const maxPhaseGoals = Math.max(...phaseGoals.values(), 1);
  const goalsByPhase: BarItem[] = [...phaseGoals.entries()]
    .sort((a, b) => {
      const order: Phase[] = [
        "GROUP",
        "ROUND_OF_32",
        "ROUND_OF_16",
        "QUARTER_FINAL",
        "SEMI_FINAL",
        "THIRD_PLACE",
        "FINAL",
      ];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    })
    .map(([phase, value]) => ({
      label: PHASE_LABELS[phase],
      value,
      percentage: Math.round((value / maxPhaseGoals) * 100),
    }));

  return {
    summary: {
      finishedMatches: finished,
      totalGoals,
      avgGoalsPerGame:
        finished > 0 ? Math.round((totalGoals / finished) * 10) / 10 : 0,
      drawPercentage:
        finished > 0 ? Math.round((draws / finished) * 100) : 0,
      highestScoringMatch: highestMatch,
    },
    confederations,
    scoreFrequency: bucketTopN(scoreCounts, 7),
    goalsByPhase,
    homeAway: {
      homeWins,
      draws,
      awayWins,
      total: finished,
    },
    groupStandings: calculateGroupStandings(matches),
    topScorers: calculateTeamGoals(matches)
      .filter((t) => t.played > 0)
      .sort((a, b) => b.goalsFor - a.goalsFor || b.goalDiff - a.goalDiff)
      .slice(0, 8),
    bestDefense: calculateTeamGoals(matches)
      .filter((t) => t.played >= 2)
      .sort((a, b) => a.goalsAgainst - b.goalsAgainst || b.goalDiff - a.goalDiff)
      .slice(0, 8),
  };
}

export function computeStreaks(
  bets: { userId: string; nickname: string; points: number; createdAt: Date }[]
): LeaderboardEntry[] {
  const userBets = new Map<
    string,
    { nickname: string; bets: { points: number; createdAt: Date }[] }
  >();

  for (const bet of bets) {
    if (!userBets.has(bet.userId)) {
      userBets.set(bet.userId, { nickname: bet.nickname, bets: [] });
    }
    userBets.get(bet.userId)!.bets.push({
      points: bet.points,
      createdAt: bet.createdAt,
    });
  }

  const streaks: LeaderboardEntry[] = [];
  for (const [, data] of userBets) {
    const sorted = data.bets.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    let maxStreak = 0;
    let current = 0;
    for (const b of sorted) {
      if (b.points > 0) {
        current++;
        maxStreak = Math.max(maxStreak, current);
      } else {
        current = 0;
      }
    }
    streaks.push({ label: data.nickname, value: maxStreak });
  }

  return streaks.sort((a, b) => b.value - a.value).slice(0, 5);
}

export function calculatePoolStats(
  bets: BetRecord[],
  currentUserId?: string
): PoolStats {
  const exactByUser = new Map<string, { nickname: string; count: number }>();
  const scoreCounts = new Map<string, number>();
  const drawByUser = new Map<string, { nickname: string; count: number }>();
  const phasePoints = new Map<Phase, { total: number; count: number }>();
  const userTotals = new Map<
    string,
    { nickname: string; points: number; bets: number; hits: number; exacts: number }
  >();

  let poolHits = 0;
  const rawPointsCounts = new Map<number, number>();

  for (const bet of bets) {
    const uid = bet.userId;
    const nick = bet.nickname;
    const raw = bet.rawPoints ?? 0;
    const pts = bet.points ?? 0;

    if (raw >= 5) poolHits++;

    rawPointsCounts.set(raw, (rawPointsCounts.get(raw) ?? 0) + 1);

    if (raw === 10) {
      const prev = exactByUser.get(uid) ?? { nickname: nick, count: 0 };
      exactByUser.set(uid, { nickname: nick, count: prev.count + 1 });
    }

    const scoreKey = formatScore(bet.homeScore, bet.awayScore);
    scoreCounts.set(scoreKey, (scoreCounts.get(scoreKey) ?? 0) + 1);

    if (bet.homeScore === bet.awayScore && raw >= 5) {
      const prev = drawByUser.get(uid) ?? { nickname: nick, count: 0 };
      drawByUser.set(uid, { nickname: nick, count: prev.count + 1 });
    }

    const phase = bet.match.phase;
    const pp = phasePoints.get(phase) ?? { total: 0, count: 0 };
    pp.total += pts;
    pp.count++;
    phasePoints.set(phase, pp);

    const ut = userTotals.get(uid) ?? {
      nickname: nick,
      points: 0,
      bets: 0,
      hits: 0,
      exacts: 0,
    };
    ut.points += pts;
    ut.bets++;
    if (raw >= 5) ut.hits++;
    if (raw === 10) ut.exacts++;
    userTotals.set(uid, ut);
  }

  const poolAccuracy =
    bets.length > 0 ? Math.round((poolHits / bets.length) * 100) : 0;

  const topExact: LeaderboardEntry[] = [...exactByUser.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((e) => ({ label: e.nickname, value: e.count }));

  const topStreaks = computeStreaks(
    bets.map((b) => ({
      userId: b.userId,
      nickname: b.nickname,
      points: b.points ?? 0,
      createdAt: b.createdAt,
    }))
  );

  const topDrawMasters: LeaderboardEntry[] = [...drawByUser.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((e) => ({ label: e.nickname, value: e.count }));

  const topBetScores: LeaderboardEntry[] = [...scoreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  const maxAvgPoints = Math.max(
    ...[...phasePoints.values()].map((p) =>
      p.count > 0 ? p.total / p.count : 0
    ),
    1
  );
  const performanceByPhase: BarItem[] = [...phasePoints.entries()]
    .sort((a, b) => {
      const order: Phase[] = [
        "GROUP",
        "ROUND_OF_32",
        "ROUND_OF_16",
        "QUARTER_FINAL",
        "SEMI_FINAL",
        "THIRD_PLACE",
        "FINAL",
      ];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    })
    .map(([phase, { total, count }]) => {
      const avg = count > 0 ? Math.round((total / count) * 10) / 10 : 0;
      return {
        label: PHASE_LABELS[phase],
        value: avg,
        percentage: Math.round((avg / maxAvgPoints) * 100),
      };
    });

  const totalBets = bets.length;
  const pointsOrder = [10, 7, 5, 2, 0];
  const pointsDistribution: BarItem[] = pointsOrder
    .filter((p) => rawPointsCounts.has(p))
    .map((p) => ({
      label: `${p} pts`,
      value: rawPointsCounts.get(p)!,
      percentage: pct(rawPointsCounts.get(p)!, totalBets),
    }));

  const scenarioDistribution: BarItem[] = pointsOrder
    .filter((p) => rawPointsCounts.has(p))
    .map((p) => ({
      label: SCENARIO_LABELS[p] ?? `${p} pts`,
      value: rawPointsCounts.get(p)!,
      percentage: pct(rawPointsCounts.get(p)!, totalBets),
    }));

  // Bet vs reality for finished matches
  const finishedBets = bets.filter(
    (b) => b.match.homeScore !== null && b.match.awayScore !== null
  );
  let betVsReality: BetVsReality | null = null;
  if (finishedBets.length > 0) {
    const betScoreCounts = new Map<string, number>();
    let betDraws = 0;
    let betHomeWins = 0;
    let betAwayWins = 0;

    for (const b of finishedBets) {
      const betKey = formatScore(b.homeScore, b.awayScore);
      betScoreCounts.set(betKey, (betScoreCounts.get(betKey) ?? 0) + 1);

      if (b.homeScore === b.awayScore) betDraws++;
      else if (b.homeScore > b.awayScore) betHomeWins++;
      else betAwayWins++;
    }

    const n = finishedBets.length;

    // Actual outcomes: one entry per finished match
    const matchOutcomes = new Map<string, string>();
    for (const b of finishedBets) {
      matchOutcomes.set(
        b.match.id,
        formatScore(b.match.homeScore!, b.match.awayScore!)
      );
    }
    const matchCount = matchOutcomes.size;
    const actualByScore = new Map<string, number>();
    let actualDraws = 0;
    let actualHomeWins = 0;
    let actualAwayWins = 0;

    for (const [matchId, scoreKey] of matchOutcomes) {
      actualByScore.set(scoreKey, (actualByScore.get(scoreKey) ?? 0) + 1);
      const b = finishedBets.find((x) => x.match.id === matchId)!;
      const hs = b.match.homeScore!;
      const as = b.match.awayScore!;
      if (hs === as) actualDraws++;
      else if (hs > as) actualHomeWins++;
      else actualAwayWins++;
    }

    const scoreBias: ScoreBiasEntry[] = [...new Set([
      ...betScoreCounts.keys(),
      ...actualByScore.keys(),
    ])]
      .map((score) => {
        const betPct = pct(betScoreCounts.get(score) ?? 0, n);
        const actualPct = pct(actualByScore.get(score) ?? 0, matchCount);
        return { score, betPct, actualPct, diff: betPct - actualPct };
      })
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .slice(0, 5);

    const topBet = [...betScoreCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const topActual = [...actualByScore.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (topBet && topActual) {
      betVsReality = {
        mostBetScore: topBet[0],
        mostBetCount: topBet[1],
        mostActualScore: topActual[0],
        mostActualCount: topActual[1],
        outcomeBias: {
          draws: {
            betPct: pct(betDraws, n),
            actualPct: pct(actualDraws, matchCount),
          },
          homeWins: {
            betPct: pct(betHomeWins, n),
            actualPct: pct(actualHomeWins, matchCount),
          },
          awayWins: {
            betPct: pct(betAwayWins, n),
            actualPct: pct(actualAwayWins, matchCount),
          },
        },
        scoreBias,
      };
    }
  }

  // Biggest collective miss
  const matchBetGroups = new Map<
    string,
    { label: string; zero: number; total: number }
  >();
  for (const b of finishedBets) {
    const id = b.match.id;
    const label = `${b.match.homeTeam} × ${b.match.awayTeam}`;
    const g = matchBetGroups.get(id) ?? { label, zero: 0, total: 0 };
    g.total++;
    if ((b.points ?? 0) === 0) g.zero++;
    matchBetGroups.set(id, g);
  }
  let biggestCollectiveMiss: CollectiveMiss | null = null;
  if (matchBetGroups.size > 0) {
    const worst = [...matchBetGroups.values()]
      .filter((g) => g.total >= 2)
      .sort((a, b) => b.zero / b.total - a.zero / a.total)[0];
    if (worst) {
      biggestCollectiveMiss = {
        matchLabel: worst.label,
        zeroPointRate: Math.round((worst.zero / worst.total) * 100),
        betCount: worst.total,
      };
    }
  }

  let myStats: MyStatsComparison | null = null;
  if (currentUserId) {
    const myBets = bets.filter((b) => b.userId === currentUserId);
    const userCount = userTotals.size || 1;
    const poolTotalPoints = [...userTotals.values()].reduce(
      (s, u) => s + u.points,
      0
    );
    const poolTotalHits = [...userTotals.values()].reduce(
      (s, u) => s + u.hits,
      0
    );
    const poolTotalBets = [...userTotals.values()].reduce(
      (s, u) => s + u.bets,
      0
    );
    const poolTotalExacts = [...userTotals.values()].reduce(
      (s, u) => s + u.exacts,
      0
    );

    myStats = {
      totalPoints: myBets.reduce((s, b) => s + (b.points ?? 0), 0),
      exactScores: myBets.filter((b) => b.rawPoints === 10).length,
      accuracy:
        myBets.length > 0
          ? Math.round(
              (myBets.filter((b) => (b.rawPoints ?? 0) >= 5).length /
                myBets.length) *
                100
            )
          : 0,
      poolAvgPoints: Math.round(poolTotalPoints / userCount),
      poolAvgAccuracy:
        poolTotalBets > 0
          ? Math.round((poolTotalHits / poolTotalBets) * 100)
          : 0,
      poolAvgExacts: Math.round((poolTotalExacts / userCount) * 10) / 10,
    };
  }

  return {
    poolAccuracy,
    myStats,
    topExact,
    topStreaks,
    topDrawMasters,
    topBetScores,
    performanceByPhase,
    pointsDistribution,
    scenarioDistribution,
    betVsReality,
    biggestCollectiveMiss,
  };
}

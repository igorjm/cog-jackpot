import { MatchStatus, Phase } from "@prisma/client";
import type { MatchGoal } from "./match-goals";
import { mapApiWinner, type WinnerSide } from "./match-winner";

// football-data.org v4 API client for World Cup 2026 score updates
// Free tier: 10 requests/minute — live sync uses 1 req/min (status=LIVE filter)
// IN_PLAY/PAUSED: current score in score.fullTime; no global match-minute field (see goals[])

const API_BASE = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_DATA_API_KEY || "";
const WC_2026_COMPETITION_ID = 2000;

interface ApiGoal {
  minute: number;
  injuryTime: number | null;
  type: string;
  team: { id: number; name: string };
  scorer: { id: number; name: string } | null;
  assist: { id: number; name: string } | null;
}

interface ApiMatch {
  id: number;
  matchday: number;
  status: MatchStatus;
  stage: string;
  group: string | null;
  utcDate: string;
  homeTeam: { id: number; name: string; tla: string };
  awayTeam: { id: number; name: string; tla: string };
  goals?: ApiGoal[];
  score: {
    winner?: string | null;
    duration?: string | null;
    fullTime: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  };
}

interface ApiResponse {
  matches: ApiMatch[];
}

const STAGE_MAP: Record<string, Phase> = {
  GROUP_STAGE: "GROUP",
  LAST_32: "ROUND_OF_32",
  LAST_16: "ROUND_OF_16",
  QUARTER_FINALS: "QUARTER_FINAL",
  SEMI_FINALS: "SEMI_FINAL",
  THIRD_PLACE: "THIRD_PLACE",
  FINAL: "FINAL",
};

export interface MatchResult {
  homeTeam: string;
  awayTeam: string;
  homeTla: string;
  awayTla: string;
  homeScore: number;
  awayScore: number;
  phase: Phase;
  matchDate: string;
  status: string;
  winnerSide?: WinnerSide;
}

export interface LiveMatchResult {
  homeTeam: string;
  awayTeam: string;
  homeTla: string;
  awayTla: string;
  liveHomeScore: number;
  liveAwayScore: number;
  halfTimeHome: number | null;
  halfTimeAway: number | null;
  goals: MatchGoal[];
  phase: Phase;
  matchDate: string;
  status: MatchStatus;
}

function mapApiGoals(m: ApiMatch): MatchGoal[] {
  if (!m.goals?.length) return [];

  return m.goals
    .filter((goal) => goal.scorer?.name)
    .map((goal) => ({
      minute: goal.minute,
      injuryTime: goal.injuryTime,
      teamSide:
        goal.team.id === m.homeTeam.id || goal.team.name === m.homeTeam.name
          ? ("home" as const)
          : ("away" as const),
      scorer: goal.scorer!.name,
      assist: goal.assist?.name ?? null,
      type: goal.type,
    }))
    .sort((a, b) => a.minute - b.minute || (a.injuryTime ?? 0) - (b.injuryTime ?? 0));
}

function mapApiMatchToResult(m: ApiMatch): MatchResult | null {
  if (m.score.fullTime.home === null || m.score.fullTime.away === null) {
    return null;
  }

  return {
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    homeTla: m.homeTeam.tla,
    awayTla: m.awayTeam.tla,
    homeScore: m.score.fullTime.home,
    awayScore: m.score.fullTime.away,
    phase: STAGE_MAP[m.stage] || "GROUP",
    matchDate: m.utcDate,
    status: m.status,
    winnerSide: mapApiWinner(m.score.winner),
  };
}

function mapApiMatchToLiveResult(m: ApiMatch): LiveMatchResult | null {
  if (m.score.fullTime.home === null || m.score.fullTime.away === null) {
    return null;
  }

  return {
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    homeTla: m.homeTeam.tla,
    awayTla: m.awayTeam.tla,
    liveHomeScore: m.score.fullTime.home,
    liveAwayScore: m.score.fullTime.away,
    halfTimeHome: m.score.halfTime?.home ?? null,
    halfTimeAway: m.score.halfTime?.away ?? null,
    goals: mapApiGoals(m),
    phase: STAGE_MAP[m.stage] || "GROUP",
    matchDate: m.utcDate,
    status: m.status,
  };
}

async function fetchCompetitionMatches(status: string): Promise<ApiMatch[]> {
  if (!API_KEY) {
    throw new Error("FOOTBALL_DATA_API_KEY not configured");
  }

  const response = await fetch(
    `${API_BASE}/competitions/${WC_2026_COMPETITION_ID}/matches?status=${status}`,
    {
      headers: { "X-Auth-Token": API_KEY },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`football-data.org API error: ${response.status} ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();
  return data.matches;
}

export async function fetchFinishedMatches(): Promise<MatchResult[]> {
  const matches = await fetchCompetitionMatches("FINISHED");
  return matches.map(mapApiMatchToResult).filter((m): m is MatchResult => m !== null);
}

/** LIVE pseudo-status = IN_PLAY + PAUSED per football-data.org v4 docs */
export async function fetchLiveMatches(): Promise<LiveMatchResult[]> {
  const matches = await fetchCompetitionMatches("LIVE");
  return matches.map(mapApiMatchToLiveResult).filter((m): m is LiveMatchResult => m !== null);
}

export async function fetchMatchesByDate(dateFrom: string, dateTo: string): Promise<MatchResult[]> {
  if (!API_KEY) {
    throw new Error("FOOTBALL_DATA_API_KEY not configured");
  }

  const response = await fetch(
    `${API_BASE}/competitions/${WC_2026_COMPETITION_ID}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
    {
      headers: { "X-Auth-Token": API_KEY },
    }
  );

  if (!response.ok) {
    throw new Error(`football-data.org API error: ${response.status} ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();

  return data.matches
    .filter((m) => m.status === "FINISHED")
    .map(mapApiMatchToResult)
    .filter((m): m is MatchResult => m !== null);
}

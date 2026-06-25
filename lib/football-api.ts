import { Phase } from "@prisma/client";

// football-data.org API client for live World Cup 2026 score updates
// Free tier: 10 requests/minute

const API_BASE = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_DATA_API_KEY || "";
const WC_2026_COMPETITION_ID = 2000; // FIFA World Cup

interface ApiMatch {
  id: number;
  matchday: number;
  status: "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED" | "SUSPENDED" | "POSTPONED" | "CANCELLED" | "AWARDED";
  stage: string;
  group: string | null;
  utcDate: string;
  homeTeam: { name: string; tla: string };
  awayTeam: { name: string; tla: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

interface ApiResponse {
  matches: ApiMatch[];
}

// Map football-data.org stages to our Phase enum
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
}

export async function fetchFinishedMatches(): Promise<MatchResult[]> {
  if (!API_KEY) {
    throw new Error("FOOTBALL_DATA_API_KEY not configured");
  }

  const response = await fetch(
    `${API_BASE}/competitions/${WC_2026_COMPETITION_ID}/matches?status=FINISHED`,
    {
      headers: {
        "X-Auth-Token": API_KEY,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`football-data.org API error: ${response.status} ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();

  return data.matches
    .filter((m) => m.score.fullTime.home !== null && m.score.fullTime.away !== null)
    .map((m) => ({
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      homeTla: m.homeTeam.tla,
      awayTla: m.awayTeam.tla,
      homeScore: m.score.fullTime.home!,
      awayScore: m.score.fullTime.away!,
      phase: STAGE_MAP[m.stage] || "GROUP",
      matchDate: m.utcDate,
      status: m.status,
    }));
}

export async function fetchMatchesByDate(dateFrom: string, dateTo: string): Promise<MatchResult[]> {
  if (!API_KEY) {
    throw new Error("FOOTBALL_DATA_API_KEY not configured");
  }

  const response = await fetch(
    `${API_BASE}/competitions/${WC_2026_COMPETITION_ID}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
    {
      headers: {
        "X-Auth-Token": API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`football-data.org API error: ${response.status} ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();

  return data.matches
    .filter((m) => m.status === "FINISHED" && m.score.fullTime.home !== null)
    .map((m) => ({
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      homeTla: m.homeTeam.tla,
      awayTla: m.awayTeam.tla,
      homeScore: m.score.fullTime.home!,
      awayScore: m.score.fullTime.away!,
      phase: STAGE_MAP[m.stage] || "GROUP",
      matchDate: m.utcDate,
      status: m.status,
    }));
}

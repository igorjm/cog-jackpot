import type { MatchStatus } from "@prisma/client";

export interface MatchScoreFields {
  homeScore: number | null;
  awayScore: number | null;
  liveHomeScore: number | null;
  liveAwayScore: number | null;
  matchStatus: MatchStatus;
  matchDate: Date;
}

export function isMatchStatusLive(status: MatchStatus): boolean {
  return status === "IN_PLAY" || status === "PAUSED";
}

export function isMatchFinished(match: Pick<MatchScoreFields, "homeScore" | "awayScore">): boolean {
  return match.homeScore !== null && match.awayScore !== null;
}

/** Whether the match is currently live (API status or time-window fallback). */
export function isMatchLiveNow(match: MatchScoreFields): boolean {
  if (isMatchFinished(match)) return false;
  if (isMatchStatusLive(match.matchStatus)) return true;

  const now = Date.now();
  const start = match.matchDate.getTime();
  const liveWindowMs = 150 * 60 * 1000;
  return now >= start && now <= start + liveWindowMs;
}

/** Score shown in UI: final result when finished, live score when in play. */
export function getDisplayScore(match: MatchScoreFields): {
  home: number | null;
  away: number | null;
  isLive: boolean;
  isFinished: boolean;
} {
  const finished = isMatchFinished(match);
  if (finished) {
    return {
      home: match.homeScore,
      away: match.awayScore,
      isLive: false,
      isFinished: true,
    };
  }

  if (
    isMatchStatusLive(match.matchStatus) &&
    match.liveHomeScore !== null &&
    match.liveAwayScore !== null
  ) {
    return {
      home: match.liveHomeScore,
      away: match.liveAwayScore,
      isLive: true,
      isFinished: false,
    };
  }

  return { home: null, away: null, isLive: isMatchLiveNow(match), isFinished: false };
}

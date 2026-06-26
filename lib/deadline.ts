import { DEADLINE_HOURS_BEFORE } from "./constants";
import { isMatchLiveNow, type MatchScoreFields } from "./match-live";

export function isBeforeDeadline(matchDate: Date): boolean {
  const now = new Date();
  const deadline = new Date(matchDate.getTime() - DEADLINE_HOURS_BEFORE * 60 * 60 * 1000);
  return now < deadline;
}

export function getDeadline(matchDate: Date): Date {
  return new Date(matchDate.getTime() - DEADLINE_HOURS_BEFORE * 60 * 60 * 1000);
}

export function getTimeUntilDeadline(matchDate: Date): number {
  const deadline = getDeadline(matchDate);
  return deadline.getTime() - Date.now();
}

/** @deprecated Prefer isMatchLiveNow from lib/match-live with full match fields */
export function isMatchLive(
  matchDate: Date,
  homeScore: number | null | undefined,
  awayScore: number | null | undefined,
  matchStatus?: MatchScoreFields["matchStatus"]
): boolean {
  return isMatchLiveNow({
    matchDate,
    homeScore: homeScore ?? null,
    awayScore: awayScore ?? null,
    liveHomeScore: null,
    liveAwayScore: null,
    matchStatus: matchStatus ?? "SCHEDULED",
  });
}

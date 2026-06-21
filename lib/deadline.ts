import { DEADLINE_HOURS_BEFORE } from "./constants";

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

const LIVE_MATCH_DURATION_MS = 150 * 60 * 1000; // ~2.5h

export function isMatchLive(
  matchDate: Date,
  homeScore: number | null | undefined,
  awayScore: number | null | undefined
): boolean {
  if (homeScore != null && awayScore != null) return false;
  const now = Date.now();
  const start = matchDate.getTime();
  return now >= start && now <= start + LIVE_MATCH_DURATION_MS;
}

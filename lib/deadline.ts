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

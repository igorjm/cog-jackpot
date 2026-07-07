import { fetchLiveMatches } from "@/lib/football-api";
import { syncLiveMatchScores } from "@/lib/match-sync";
import { hasMatchesInLiveWindow } from "./live-window";

export interface SyncLiveScoresResult {
  synced: number;
  skipped: number;
  live: number;
  message: string;
}

export async function runSyncLiveScoresJob(): Promise<SyncLiveScoresResult> {
  if (!(await hasMatchesInLiveWindow())) {
    return {
      synced: 0,
      skipped: 0,
      live: 0,
      message: "No matches in live window — skipped API call",
    };
  }

  const results = await fetchLiveMatches();
  if (results.length === 0) {
    return {
      synced: 0,
      skipped: 0,
      live: 0,
      message: "No live matches from API",
    };
  }

  const { synced, skipped } = await syncLiveMatchScores(results);

  return {
    synced,
    skipped,
    live: results.length,
    message: `${synced} live score(s) updated${skipped > 0 ? `, ${skipped} skipped` : ""}`,
  };
}

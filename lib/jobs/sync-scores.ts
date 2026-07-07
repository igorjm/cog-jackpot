import { fetchFinishedMatches } from "@/lib/football-api";
import { syncFinishedMatchResults } from "@/lib/match-sync";
import { refreshKnockoutBracketFromApi } from "@/lib/knockout-bracket-sync";

export interface SyncScoresResult {
  synced: number;
  skipped: number;
  knockoutUpdated: number;
  winnerSidesUpdated: number;
  message: string;
}

export async function runSyncScoresJob(): Promise<SyncScoresResult> {
  const results = await fetchFinishedMatches();

  if (results.length === 0) {
    const { knockoutUpdated, winnerSidesUpdated } =
      await refreshKnockoutBracketFromApi([]);

    return {
      synced: 0,
      skipped: 0,
      knockoutUpdated,
      winnerSidesUpdated,
      message:
        knockoutUpdated > 0 || winnerSidesUpdated > 0
          ? `${winnerSidesUpdated > 0 ? `${winnerSidesUpdated} penalty winner(s), ` : ""}${knockoutUpdated} knockout slot(s) updated`
          : "No new results",
    };
  }

  const { synced, skipped, knockoutUpdated } =
    await syncFinishedMatchResults(results);

  return {
    synced,
    skipped,
    knockoutUpdated,
    winnerSidesUpdated: 0,
    message: `${synced} result(s) synced${skipped > 0 ? `, ${skipped} skipped` : ""}${knockoutUpdated > 0 ? `, ${knockoutUpdated} knockout slot(s) updated` : ""}`,
  };
}

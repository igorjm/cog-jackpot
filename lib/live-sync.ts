import { fetchLiveMatches } from "./football-api";
import { syncLiveMatchScores } from "./match-sync";

const DEFAULT_MIN_INTERVAL_MS = 45_000;

let lastSyncAt = 0;
let syncInFlight: Promise<void> | null = null;

/** Fetches live scores from football-data.org and updates the DB, with in-process deduping. */
export async function refreshLiveScoresIfDue(
  minIntervalMs = DEFAULT_MIN_INTERVAL_MS
): Promise<void> {
  if (!process.env.FOOTBALL_DATA_API_KEY) return;

  const now = Date.now();
  if (now - lastSyncAt < minIntervalMs) return;

  if (syncInFlight) {
    await syncInFlight;
    return;
  }

  syncInFlight = (async () => {
    try {
      const results = await fetchLiveMatches();
      await syncLiveMatchScores(results);
      lastSyncAt = Date.now();
    } catch (error) {
      console.error("[live-sync]", error);
    } finally {
      syncInFlight = null;
    }
  })();

  await syncInFlight;
}

export function resetLiveSyncStateForTests(): void {
  lastSyncAt = 0;
  syncInFlight = null;
}

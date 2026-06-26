import { NextResponse } from "next/server";
import { fetchLiveMatches } from "@/lib/football-api";
import { syncLiveMatchScores } from "@/lib/match-sync";
import {
  internalErrorResponse,
  unauthorizedCronResponse,
  verifyCronSecret,
} from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return unauthorizedCronResponse();
  }

  try {
    const results = await fetchLiveMatches();
    if (results.length === 0) {
      return NextResponse.json({ synced: 0, message: "No live matches" });
    }

    const { synced, skipped } = await syncLiveMatchScores(results);

    return NextResponse.json({
      success: true,
      synced,
      skipped,
      live: results.length,
      message: `${synced} live score(s) updated${skipped > 0 ? `, ${skipped} skipped` : ""}`,
    });
  } catch (e) {
    console.error("[cron/sync-live-scores]", e);
    return internalErrorResponse();
  }
}

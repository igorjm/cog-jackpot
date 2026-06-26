import { NextResponse } from "next/server";
import { fetchFinishedMatches } from "@/lib/football-api";
import { syncFinishedMatchResults } from "@/lib/match-sync";
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
    const results = await fetchFinishedMatches();
    if (results.length === 0) {
      return NextResponse.json({ synced: 0, message: "No new results" });
    }

    const { synced, skipped } = await syncFinishedMatchResults(results);

    return NextResponse.json({
      success: true,
      synced,
      skipped,
      message: `${synced} result(s) synced${skipped > 0 ? `, ${skipped} skipped` : ""}`,
    });
  } catch (e) {
    console.error("[cron/sync-scores]", e);
    return internalErrorResponse();
  }
}

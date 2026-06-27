import { NextResponse } from "next/server";
import { fetchFinishedMatches } from "@/lib/football-api";
import { syncFinishedMatchResults } from "@/lib/match-sync";
import { persistKnockoutTeamResolution } from "@/lib/knockout-resolve";
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
      const knockoutUpdated = await persistKnockoutTeamResolution();
      return NextResponse.json({
        synced: 0,
        knockoutUpdated,
        message:
          knockoutUpdated > 0
            ? `${knockoutUpdated} knockout slot(s) updated`
            : "No new results",
      });
    }

    const { synced, skipped, knockoutUpdated } = await syncFinishedMatchResults(results);

    return NextResponse.json({
      success: true,
      synced,
      skipped,
      knockoutUpdated,
      message: `${synced} result(s) synced${skipped > 0 ? `, ${skipped} skipped` : ""}${knockoutUpdated > 0 ? `, ${knockoutUpdated} knockout slot(s) updated` : ""}`,
    });
  } catch (e) {
    console.error("[cron/sync-scores]", e);
    return internalErrorResponse();
  }
}

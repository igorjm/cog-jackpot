import { NextResponse } from "next/server";
import { fetchFinishedMatches } from "@/lib/football-api";
import { syncFinishedMatchResults } from "@/lib/match-sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

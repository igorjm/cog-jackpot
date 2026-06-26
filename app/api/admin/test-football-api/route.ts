import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-guards";
import { fetchFinishedMatches } from "@/lib/football-api";

export async function GET() {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response;

  try {
    const matches = await fetchFinishedMatches();
    return NextResponse.json({
      ok: true,
      count: matches.length,
      matches: matches.slice(0, 5).map((m) => ({
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        score: `${m.homeScore} x ${m.awayScore}`,
        phase: m.phase,
        date: m.matchDate,
      })),
    });
  } catch (e) {
    console.error("[admin/test-football-api]", e);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

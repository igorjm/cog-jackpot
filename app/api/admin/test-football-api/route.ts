import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchFinishedMatches } from "@/lib/football-api";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

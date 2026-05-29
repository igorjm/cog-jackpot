import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchFinishedMatches } from "@/lib/football-api";
import { calculatePoints, calculateFinalPoints } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron or has the correct secret
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

    let synced = 0;

    for (const result of results) {
      // Find matching match by date proximity (within 2 hours)
      const matchDate = new Date(result.matchDate);
      const dateFrom = new Date(matchDate.getTime() - 2 * 60 * 60 * 1000);
      const dateTo = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000);

      const match = await prisma.match.findFirst({
        where: {
          matchDate: { gte: dateFrom, lte: dateTo },
          homeScore: null,
          phase: result.phase,
        },
        include: { bets: true },
      });

      if (!match) continue;

      // Update match result
      await prisma.match.update({
        where: { id: match.id },
        data: {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          isLocked: true,
        },
      });

      // Calculate points for all bets
      for (const bet of match.bets) {
        const pointsResult = calculatePoints(
          { homeScore: bet.homeScore, awayScore: bet.awayScore },
          { homeScore: result.homeScore, awayScore: result.awayScore }
        );
        const finalPoints = calculateFinalPoints(pointsResult.points, match.multiplier);

        await prisma.bet.update({
          where: { id: bet.id },
          data: { rawPoints: pointsResult.points, points: finalPoints },
        });
      }

      synced++;
    }

    return NextResponse.json({
      success: true,
      synced,
      message: `${synced} result(s) synced`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToAll } from "@/lib/push";
import { DEADLINE_HOURS_BEFORE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find matches whose betting deadline is within the next 15 minutes
  // Deadline = matchDate - DEADLINE_HOURS_BEFORE (1h)
  // So we want matches starting in 60–75 minutes from now
  const windowStart = new Date(now.getTime() + DEADLINE_HOURS_BEFORE * 60 * 60 * 1000);
  const windowEnd = new Date(windowStart.getTime() + 15 * 60 * 1000);

  const upcomingMatches = await prisma.match.findMany({
    where: {
      matchDate: { gte: windowStart, lt: windowEnd },
      homeScore: null, // not finished
      isLocked: false, // still open for bets
    },
    orderBy: { matchDate: "asc" },
  });

  if (upcomingMatches.length === 0) {
    return NextResponse.json({ sent: 0, message: "No upcoming deadlines" });
  }

  // Build notification for each match
  for (const match of upcomingMatches) {
    await sendPushToAll({
      title: "⏰ Palpite fechando em breve!",
      body: `${match.homeTeam} vs ${match.awayTeam} — faltam menos de 1h para palpitar!`,
      icon: "/icons/icon-192.png",
      url: `/matches/${match.id}`,
    });
  }

  return NextResponse.json({
    sent: upcomingMatches.length,
    matches: upcomingMatches.map((m) => `${m.homeTeam} vs ${m.awayTeam}`),
  });
}

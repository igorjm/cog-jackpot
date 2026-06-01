import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToAll } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all matches happening today (BRT = UTC-3)
  const now = new Date();
  const startOfDay = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  // Convert BRT boundaries back to UTC for DB query
  const startUTC = new Date(startOfDay.getTime() + 3 * 60 * 60 * 1000);
  const endUTC = new Date(endOfDay.getTime() + 3 * 60 * 60 * 1000);

  const todayMatches = await prisma.match.findMany({
    where: {
      matchDate: { gte: startUTC, lte: endUTC },
      homeScore: null, // not yet played
    },
    orderBy: { matchDate: "asc" },
  });

  if (todayMatches.length === 0) {
    return NextResponse.json({ sent: 0, message: "No matches today" });
  }

  // Format match times in BRT
  const matchList = todayMatches
    .map((m) => {
      const time = m.matchDate.toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${m.homeTeam} vs ${m.awayTeam} às ${time}`;
    })
    .join("\n");

  const body =
    todayMatches.length === 1
      ? `${todayMatches[0].homeTeam} vs ${todayMatches[0].awayTeam} — palpite fecha 1h antes do jogo!`
      : `${todayMatches.length} jogos hoje — palpites fecham 1h antes de cada jogo!\n${matchList}`;

  await sendPushToAll({
    title: "⚽ Jogos de hoje — não esqueça de palpitar!",
    body,
    icon: "/icons/icon-192.png",
    url: "/matches",
  });

  return NextResponse.json({
    sent: todayMatches.length,
    matches: todayMatches.map((m) => `${m.homeTeam} vs ${m.awayTeam}`),
  });
}

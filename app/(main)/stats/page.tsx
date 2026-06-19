import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { calculateTournamentStats, calculatePoolStats } from "@/lib/stats";
import { StatsTabs } from "@/components/stats/stats-tabs";

export default async function StatsPage() {
  const session = await auth();

  const [finishedMatches, bets] = await Promise.all([
    prisma.match.findMany({
      where: {
        homeScore: { not: null },
        awayScore: { not: null },
        phase: { not: "FRIENDLY" },
      },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        homeFlag: true,
        awayFlag: true,
        homeScore: true,
        awayScore: true,
        phase: true,
        group: true,
      },
    }),
    prisma.bet.findMany({
      where: {
        points: { not: null },
        match: { phase: { not: "FRIENDLY" } },
        user: { status: "APPROVED", role: { not: "ADMIN" } },
      },
      include: {
        match: {
          select: {
            id: true,
            homeTeam: true,
            awayTeam: true,
            phase: true,
            homeScore: true,
            awayScore: true,
          },
        },
        user: { select: { nickname: true } },
      },
    }),
  ]);

  const tournament = calculateTournamentStats(
    finishedMatches.map((m) => ({
      id: m.id,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeFlag: m.homeFlag,
      awayFlag: m.awayFlag,
      homeScore: m.homeScore!,
      awayScore: m.awayScore!,
      phase: m.phase,
      group: m.group,
    }))
  );

  const pool = calculatePoolStats(
    bets.map((b) => ({
      userId: b.userId,
      nickname: b.user.nickname ?? "Anônimo",
      homeScore: b.homeScore,
      awayScore: b.awayScore,
      points: b.points,
      rawPoints: b.rawPoints,
      createdAt: b.createdAt,
      match: b.match,
    })),
    session?.user?.id
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
            Estatísticas da Copa
          </h1>
          {tournament.summary.finishedMatches > 0 && (
            <p className="text-xs text-[#5A7A9A] mt-0.5">
              {tournament.summary.finishedMatches} jogos encerrados
            </p>
          )}
        </div>
        <Link
          href="/ranking"
          className="text-xs text-[#38BDF8] hover:underline shrink-0"
        >
          ← Ranking
        </Link>
      </div>

      <StatsTabs tournament={tournament} pool={pool} />
    </div>
  );
}

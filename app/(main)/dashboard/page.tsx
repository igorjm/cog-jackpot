import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRanking } from "@/lib/ranking";
import { MatchCard } from "@/components/match-card";
import { RecentResults } from "@/components/recent-results";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const nickname = (session!.user as { nickname: string }).nickname;

  // Get upcoming matches
  const upcomingMatches = await prisma.match.findMany({
    where: {
      homeScore: null,
      matchDate: { gt: new Date() },
    },
    orderBy: { matchDate: "asc" },
    take: 4,
  });

  // Get recent finished matches
  const recentMatches = await prisma.match.findMany({
    where: {
      homeScore: { not: null },
    },
    orderBy: { matchDate: "desc" },
    take: 5,
  });

  // Get user bets for these matches
  const matchIds = [...upcomingMatches, ...recentMatches].map((m) => m.id);
  const userBets = await prisma.bet.findMany({
    where: { userId, matchId: { in: matchIds } },
  });
  const betsMap = new Map(userBets.map((b) => [b.matchId, b]));

  // Get user stats from the authoritative ranking (same logic as /ranking page)
  const ranking = await calculateRanking();
  const myEntry = ranking.find((e) => e.userId === userId);
  const totalPoints = myEntry?.totalPoints ?? 0;
  const exactScores = myEntry?.exactScores ?? 0;
  const position = ranking.findIndex((e) => e.userId === userId) + 1;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold">
          Fala, {nickname}! 👊
        </h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-3 text-center">
          <p className="text-2xl font-mono font-bold text-[#FFD60A]">
            #{position || "—"}
          </p>
          <p className="text-[10px] text-[#94B8D8] mt-0.5">Posição</p>
        </div>
        <div className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-3 text-center">
          <p className="text-2xl font-mono font-bold text-[#22C55E]">
            {totalPoints}
          </p>
          <p className="text-[10px] text-[#94B8D8] mt-0.5">Pontos</p>
        </div>
        <div className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-3 text-center">
          <p className="text-2xl font-mono font-bold text-white">
            {exactScores}
          </p>
          <p className="text-[10px] text-[#94B8D8] mt-0.5">Exatos</p>
        </div>
      </div>

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase text-[#94B8D8] tracking-wide">
              Próximos Jogos
            </h2>
            <Link href="/matches" className="text-xs font-medium px-3 py-1 rounded-full border border-[#38BDF8]/30 text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-all active:scale-95">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcomingMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                userBet={betsMap.get(match.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Results */}
      {recentMatches.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase text-[#94B8D8] tracking-wide">
            Últimos Resultados
          </h2>
          <RecentResults
            matches={recentMatches.map((m) => ({
              ...m,
              matchDate: m.matchDate.toISOString(),
              isLocked: true,
            }))}
            betsMap={Object.fromEntries(
              recentMatches
                .filter((m) => betsMap.has(m.id))
                .map((m) => [m.id, betsMap.get(m.id)!])
            )}
          />
        </section>
      )}

      {/* Empty state */}
      {upcomingMatches.length === 0 && recentMatches.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <p className="text-4xl">⚽</p>
          <p className="text-[#94B8D8]">
            Nenhum jogo cadastrado ainda. Aguarde o admin popular os jogos da Copa!
          </p>
        </div>
      )}
    </div>
  );
}

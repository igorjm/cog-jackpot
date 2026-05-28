import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/match-card";
import { DerlisHeroCard } from "@/components/derlis-hero-card";
import { SectionTitle } from "@/components/page-title";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const nickname = (session!.user as { nickname: string }).nickname;

  const upcomingMatches = await prisma.match.findMany({
    where: {
      homeScore: null,
      matchDate: { gt: new Date() },
    },
    orderBy: { matchDate: "asc" },
    take: 4,
  });

  const recentMatches = await prisma.match.findMany({
    where: {
      homeScore: { not: null },
    },
    orderBy: { matchDate: "desc" },
    take: 5,
  });

  const matchIds = [...upcomingMatches, ...recentMatches].map((m) => m.id);
  const userBets = await prisma.bet.findMany({
    where: { userId, matchId: { in: matchIds } },
  });
  const betsMap = new Map(userBets.map((b) => [b.matchId, b]));

  const totalPoints = userBets.reduce((sum, b) => sum + (b.points ?? 0), 0);
  const exactScores = userBets.filter((b) => b.rawPoints === 10).length;

  const allUsers = await prisma.user.findMany({
    where: { status: "APPROVED", role: { not: "ADMIN" } },
    include: { bets: { where: { points: { not: null } } } },
  });
  const sortedUsers = allUsers
    .map((u) => ({
      id: u.id,
      points: u.bets.reduce((sum, b) => sum + (b.points ?? 0), 0),
    }))
    .sort((a, b) => b.points - a.points);
  const position = sortedUsers.findIndex((u) => u.id === userId) + 1;

  return (
    <div className="space-y-5">
      <DerlisHeroCard
        nickname={nickname}
        position={position}
        totalPoints={totalPoints}
        exactScores={exactScores}
      />

      {upcomingMatches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <SectionTitle>
              <span style={{ fontSize: "24px" }}>Próximos Jogos</span>
            </SectionTitle>
       
            <Link
              href="/matches"
              className="text-xs font-semibold text-[#FACC15] hover:text-[#FDE047]"
            >
              Ver todos →
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

      {recentMatches.length > 0 && (
        <section className="space-y-3">
          <SectionTitle>Últimos Resultados</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {recentMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                userBet={betsMap.get(match.id)}
                showBetLink={false}
              />
            ))}
          </div>
        </section>
      )}

      {upcomingMatches.length === 0 && recentMatches.length === 0 && (
        <div className="card-premium space-y-3 py-12 text-center">
          <p className="text-4xl">⚽</p>
          <p className="text-sm text-[#A8C3E8]">
            Nenhum jogo cadastrado ainda. Aguarde o admin popular os jogos da
            Copa!
          </p>
        </div>
      )}
    </div>
  );
}

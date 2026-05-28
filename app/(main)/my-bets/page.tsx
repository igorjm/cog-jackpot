import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { PageTitle } from "@/components/page-title";
import { PromoDerlisBanner } from "@/components/promo-derlis-banner";
import { PHASE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default async function MyBetsPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const bets = await prisma.bet.findMany({
    where: { userId },
    include: { match: true },
    orderBy: { match: { matchDate: "desc" } },
  });

  const totalPoints = bets.reduce((sum, b) => sum + (b.points ?? 0), 0);
  const exactScores = bets.filter((b) => b.rawPoints === 10).length;
  const totalBets = bets.length;

  return (
    <div className="space-y-5">
      <PageTitle icon="🔮">Meus Palpites</PageTitle>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <StatCard
          icon="⚽"
          value={totalPoints}
          label="Total Pts"
          variant="green"
        />
        <StatCard
          icon="🎯"
          value={exactScores}
          label="Exatos"
          variant="gold"
        />
        <StatCard
          icon="📋"
          value={totalBets}
          label="Palpites"
          variant="white"
        />
      </div>

      <div className="space-y-2">
        {bets.map((bet) => {
          const isFinished = bet.match.homeScore !== null;
          return (
            <div
              key={bet.id}
              className={cn(
                "card-premium rounded-xl p-3",
                bet.rawPoints === 10 && "card-premium-gold",
                bet.rawPoints &&
                  bet.rawPoints >= 5 &&
                  bet.rawPoints !== 10 &&
                  "border-[#FACC15]/35"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {bet.match.homeTeam} {bet.homeScore} × {bet.awayScore}{" "}
                    {bet.match.awayTeam}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-[#A8C3E8]">
                      {PHASE_LABELS[bet.match.phase]}
                    </span>
                    {isFinished && (
                      <span className="text-[10px] text-[#5A7A9A]">
                        • Real: {bet.match.homeScore} × {bet.match.awayScore}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  {isFinished ? (
                    <Badge
                      variant={
                        bet.points && bet.points > 0 ? "points" : "error"
                      }
                    >
                      +{bet.points ?? 0}
                    </Badge>
                  ) : (
                    <Badge variant="info">Pendente</Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {bets.length === 0 && (
        <div className="card-premium py-10 text-center text-sm text-[#A8C3E8]">
          Você ainda não fez nenhum palpite.
        </div>
      )}

      <PromoDerlisBanner />
    </div>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { PHASE_LABELS } from "@/lib/constants";

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
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
        📋 Meus Palpites
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-3 text-center">
          <p className="text-xl font-mono font-bold text-[#22C55E]">{totalPoints}</p>
          <p className="text-[10px] text-[#94B8D8]">Total Pts</p>
        </div>
        <div className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-3 text-center">
          <p className="text-xl font-mono font-bold text-[#FFD60A]">{exactScores}</p>
          <p className="text-[10px] text-[#94B8D8]">Exatos</p>
        </div>
        <div className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-3 text-center">
          <p className="text-xl font-mono font-bold">{totalBets}</p>
          <p className="text-[10px] text-[#94B8D8]">Palpites</p>
        </div>
      </div>

      {/* Bets list */}
      <div className="space-y-2">
        {bets.map((bet) => {
          const isFinished = bet.match.homeScore !== null;
          return (
            <div
              key={bet.id}
              className={`bg-[#162D54] rounded-xl border p-3 ${
                bet.rawPoints === 10
                  ? "border-[#FFD700]/30"
                  : bet.rawPoints && bet.rawPoints >= 5
                  ? "border-[#22C55E]/30"
                  : "border-[#2A4A7A]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="truncate">
                      {bet.match.homeTeam} {bet.homeScore} × {bet.awayScore} {bet.match.awayTeam}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[#94B8D8]">
                      {PHASE_LABELS[bet.match.phase]}
                    </span>
                    {isFinished && (
                      <span className="text-[10px] text-[#94B8D8]">
                        • Real: {bet.match.homeScore} × {bet.match.awayScore}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {isFinished ? (
                    <Badge
                      variant={bet.points && bet.points > 0 ? "points" : "error"}
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
        <div className="text-center py-8 text-[#94B8D8]">
          Você ainda não fez nenhum palpite.
        </div>
      )}
    </div>
  );
}

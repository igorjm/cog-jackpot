import { auth } from "@/lib/auth";
import { calculateRanking } from "@/lib/ranking";
import { prisma } from "@/lib/prisma";
import { RankingPodium } from "@/components/ranking-podium";
import { RankingTable } from "@/components/ranking-table";

const ENTRY_FEE = 50;
const SPLIT = { first: 0.6, second: 0.25, third: 0.15 };

export default async function RankingPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [ranking, playerCount] = await Promise.all([
    calculateRanking(),
    prisma.user.count({ where: { status: "APPROVED", role: { not: "ADMIN" } } }),
  ]);

  const totalPrize = playerCount * ENTRY_FEE;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
        🏆 Ranking
      </h1>

      {/* Podium */}
      {ranking.length >= 3 && <RankingPodium top3={ranking.slice(0, 3)} />}

      {/* Prize pool */}
      {totalPrize > 0 && (
        <div className="flex items-center justify-center gap-4 sm:gap-6 py-3 px-4 bg-[#122448] rounded-xl border border-[#1E3A6E]">
          <div className="text-center">
            <p className="text-[10px] uppercase text-[#5A7A9A] tracking-wide">Prêmio Total</p>
            <p className="text-sm font-mono font-bold text-[#FFD60A]">
              R$ {totalPrize.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="w-px h-8 bg-[#1E3A6E]" />
          <div className="text-center">
            <p className="text-[10px] uppercase text-[#5A7A9A]">🥇</p>
            <p className="text-sm font-mono font-bold text-white">
              R$ {Math.round(totalPrize * SPLIT.first).toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase text-[#5A7A9A]">🥈</p>
            <p className="text-sm font-mono font-bold text-white">
              R$ {Math.round(totalPrize * SPLIT.second).toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase text-[#5A7A9A]">🥉</p>
            <p className="text-sm font-mono font-bold text-white">
              R$ {Math.round(totalPrize * SPLIT.third).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      )}

      {/* Full table */}
      <RankingTable entries={ranking} currentUserId={userId} />

      {ranking.length === 0 && (
        <div className="text-center py-8 text-[#94B8D8]">
          Nenhum resultado registrado ainda. O ranking será atualizado conforme os jogos forem finalizados.
        </div>
      )}
    </div>
  );
}

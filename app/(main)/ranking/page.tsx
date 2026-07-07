import { auth } from "@/lib/auth";
import { calculatePrizePool } from "@/lib/prizes";
import { formatCurrency } from "@/lib/utils";
import { RankingPodium } from "@/components/ranking-podium";
import { RankingTable } from "@/components/ranking-table";
import { getCachedApprovedPlayerCount, getCachedRanking } from "@/lib/cached-data";
import Link from "next/link";

export default async function RankingPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [ranking, playerCount] = await Promise.all([
    getCachedRanking(),
    getCachedApprovedPlayerCount(),
  ]);

  const prizePool = calculatePrizePool(playerCount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
          🏆 Ranking
        </h1>
        <Link
          href="/stats"
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#38BDF8]/30 text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-all"
        >
          📊 Estatísticas
        </Link>
      </div>

      {/* Podium */}
      {ranking.length >= 3 && <RankingPodium top3={ranking.slice(0, 3)} />}

      {/* Prize pool */}
      {prizePool.total > 0 && (
        <div className="flex items-center justify-center gap-4 sm:gap-6 py-3 px-4 bg-[#162D54] rounded-xl border border-[#2A4A7A]">
          <div className="text-center">
            <p className="text-[10px] uppercase text-[#5A7A9A] tracking-wide">Prêmio Total</p>
            <p className="text-sm font-mono font-bold text-[#FFD60A]">
              {formatCurrency(prizePool.total)}
            </p>
          </div>
          <div className="w-px h-8 bg-[#2A4A7A]" />
          <div className="text-center">
            <p className="text-[10px] uppercase text-[#5A7A9A]">🥇</p>
            <p className="text-sm font-mono font-bold text-white">
              {formatCurrency(prizePool.first)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase text-[#5A7A9A]">🥈</p>
            <p className="text-sm font-mono font-bold text-white">
              {formatCurrency(prizePool.second)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase text-[#5A7A9A]">🥉</p>
            <p className="text-sm font-mono font-bold text-white">
              {formatCurrency(prizePool.third)}
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

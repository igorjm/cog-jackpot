import { auth } from "@/lib/auth";
import { calculateRanking } from "@/lib/ranking";
import { RankingPodium } from "@/components/ranking-podium";
import { RankingTable } from "@/components/ranking-table";

export default async function RankingPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const ranking = await calculateRanking();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
        🏆 Ranking
      </h1>

      {/* Podium */}
      {ranking.length >= 3 && <RankingPodium top3={ranking.slice(0, 3)} />}

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

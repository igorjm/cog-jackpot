import { auth } from "@/lib/auth";
import { calculateRanking } from "@/lib/ranking";
import { RankingPodium } from "@/components/ranking-podium";
import { RankingTable } from "@/components/ranking-table";
import { PageTitle } from "@/components/page-title";
import { PromoDerlisBanner } from "@/components/promo-derlis-banner";

export default async function RankingPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const ranking = await calculateRanking();

  return (
    <div className="space-y-6">
      <PageTitle icon="🏆">Ranking</PageTitle>

      {ranking.length >= 3 && <RankingPodium top3={ranking.slice(0, 3)} />}

      <RankingTable entries={ranking} currentUserId={userId} />

      {ranking.length === 0 && (
        <div className="card-premium py-10 text-center text-sm text-[#A8C3E8]">
          Nenhum resultado registrado ainda. O ranking será atualizado conforme
          os jogos forem finalizados.
        </div>
      )}

      <PromoDerlisBanner />
    </div>
  );
}

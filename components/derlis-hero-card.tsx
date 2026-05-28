import Image from "next/image";
import { StatCard } from "@/components/stat-card";

interface DerlisHeroCardProps {
  nickname: string;
  position: number;
  totalPoints: number;
  exactScores: number;
}

export function DerlisHeroCard({
  nickname,
  position,
  totalPoints,
  exactScores,
}: DerlisHeroCardProps) {
  return (
    <div className="relative min-h-[270px] w-full overflow-hidden rounded-2xl border border-[#FACC15]/25 bg-[#020810] shadow-lg shadow-black/40 sm:min-h-[290px]">
      <Image
        src="/banner-hero-derlis.png"
        alt="Derlis — Bolão Copa 2026"
        fill
        className="h-full w-full object-cover"
        style={{ objectPosition: "10px -24px" }}
        sizes="100vw"
        priority
      />

      <div
        className="absolute inset-0 bg-gradient-to-r from-[#020810]/95 via-[#040d1f]/55 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#020810]/92 via-transparent to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[270px] flex-col justify-between p-4 sm:min-h-[290px] sm:p-5">
        <div>
          <h2 className="text-lg font-extrabold tracking-wide text-white drop-shadow-md sm:text-xl">
            Fala, {nickname}! 👊
          </h2>
          <p className="mt-1 max-w-[280px] text-sm font-medium leading-snug text-white/90 drop-shadow-sm">
            Derlis já está prevendo seus palpites.
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatCard
            icon="🏆"
            value={position ? `#${position}` : "—"}
            label="Posição"
            variant="gold"
            overlay
          />
          <StatCard
            icon="⚽"
            value={totalPoints}
            label="Pontos"
            variant="green"
            overlay
          />
          <StatCard
            icon="🎯"
            value={exactScores}
            label="Exatos"
            variant="gold"
            overlay
          />
        </div>
      </div>
    </div>
  );
}

import { getInitials } from "@/lib/utils";
import { RankingEntry } from "@/lib/ranking";
import { cn } from "@/lib/utils";

interface RankingPodiumProps {
  top3: RankingEntry[];
}

export function RankingPodium({ top3 }: RankingPodiumProps) {
  if (top3.length < 3) return null;

  const medals = ["🥇", "🥈", "🥉"];
  const colors = [
    "from-[#FACC15]/25 to-[#D4AF37]/5 border-[#FACC15]/40",
    "from-[#A8C3E8]/20 to-[#A8C3E8]/5 border-[#A8C3E8]/30",
    "from-[#F97316]/20 to-[#F97316]/5 border-[#F97316]/30",
  ];
  const glows = [
    "shadow-[#FACC15]/25",
    "shadow-[#A8C3E8]/15",
    "shadow-[#F97316]/20",
  ];
  const heights = ["h-32", "h-24", "h-20"];

  const displayOrder = [top3[1], top3[0], top3[2]];
  const displayMedals = [medals[1], medals[0], medals[2]];
  const displayColors = [colors[1], colors[0], colors[2]];
  const displayGlows = [glows[1], glows[0], glows[2]];
  const displayHeights = [heights[1], heights[0], heights[2]];

  return (
    <div className="card-premium rounded-2xl py-6">
      <div className="flex items-end justify-center gap-2 px-2">
        {displayOrder.map((entry, i) => (
          <div key={entry.userId} className="flex flex-col items-center">
            <span className="mb-1 text-2xl">{displayMedals[i]}</span>
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border bg-gradient-to-br text-sm font-bold shadow-lg",
                displayColors[i],
                displayGlows[i]
              )}
            >
              {getInitials(entry.name)}
            </div>
            <p className="mt-1 max-w-[80px] truncate text-center text-xs font-semibold text-white">
              {entry.nickname}
            </p>
            <p className="font-mono text-xs font-bold text-[#22C55E]">
              {entry.totalPoints} pts
            </p>
            <div
              className={cn(
                "mt-2 flex w-20 items-center justify-center rounded-t-xl border border-b-0 bg-gradient-to-t",
                displayHeights[i],
                displayColors[i]
              )}
            >
              <span className="page-title text-lg text-[#FACC15]">
                {entry.position}º
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

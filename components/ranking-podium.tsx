import { RankingEntry } from "@/lib/ranking";
import { getInitials, formatPoints } from "@/lib/utils";
import { LastPointsGain } from "./last-points-gain";
import Image from "next/image";

interface RankingPodiumProps {
  top3: RankingEntry[];
}

export function RankingPodium({ top3 }: RankingPodiumProps) {
  if (top3.length < 3) return null;

  const medals = ["🥇", "🥈", "🥉"];
  const colors = [
    "from-[#FFD60A]/20 to-[#FFD60A]/5 border-[#FFD60A]/30",
    "from-[#94B8D8]/20 to-[#94B8D8]/5 border-[#94B8D8]/30",
    "from-[#F97316]/20 to-[#F97316]/5 border-[#F97316]/30",
  ];
  const glows = [
    "shadow-[#FFD60A]/20",
    "shadow-[#94B8D8]/20",
    "shadow-[#F97316]/20",
  ];
  const heights = ["h-32", "h-24", "h-20"];

  // Display order: 2nd, 1st, 3rd
  const displayOrder = [top3[1], top3[0], top3[2]];
  const displayColors = [colors[1], colors[0], colors[2]];
  const displayGlows = [glows[1], glows[0], glows[2]];
  const displayHeights = [heights[1], heights[0], heights[2]];

  return (
    <div className="flex items-end justify-center gap-2 py-6">
      {displayOrder.map((entry, i) => (
        <div key={entry.userId} className="flex flex-col items-center">
          <span className="text-2xl mb-1">{[medals[1], medals[0], medals[2]][i]}</span>
          <div
            className={`w-16 h-20 rounded-lg bg-gradient-to-br ${displayColors[i]} border overflow-hidden shadow-lg ${displayGlows[i]}`}
          >
            {entry.avatar ? (
              <Image
                src={entry.avatar}
                alt=""
                width={64}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#FFD60A]">
                {getInitials(entry.name)}
              </div>
            )}
          </div>
          <p className="text-xs font-medium mt-1 text-center max-w-[80px] truncate">
            {entry.nickname}
          </p>
          <p className="text-xs font-mono text-[#FFD60A]">
            {formatPoints(entry.totalPoints)}
            <LastPointsGain points={entry.lastPointsGained} className="ml-0.5" />
          </p>
          <div
            className={`mt-2 w-20 ${displayHeights[i]} rounded-t-lg bg-gradient-to-t ${displayColors[i]} border border-b-0 flex items-center justify-center`}
          >
            <span className="text-lg font-bold font-[family-name:var(--font-oswald)]">
              {entry.position}º
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

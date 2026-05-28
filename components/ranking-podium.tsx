import { RankingEntry } from "@/lib/ranking";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
        </div>
      ))}
    </div>
  );
}

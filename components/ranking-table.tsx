import { getInitials, formatPoints } from "@/lib/utils";
import { RankingEntry } from "@/lib/ranking";
import { PositionChange } from "./position-change";
import { LastPointsGain } from "./last-points-gain";
import Image from "next/image";

interface RankingTableProps {
  entries: RankingEntry[];
  currentUserId?: string;
}

export function RankingTable({ entries, currentUserId }: RankingTableProps) {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-[40px_1fr_80px_40px_40px] gap-2 px-3 py-2 text-xs text-[#94B8D8] font-medium">
        <span>#</span>
        <span>Jogador</span>
        <span className="text-right">Pts</span>
        <span className="text-center">🎯</span>
        <span className="text-center">Δ</span>
      </div>

      {entries.map((entry) => (
        <div
          key={entry.userId}
          className={`grid grid-cols-[40px_1fr_80px_40px_40px] gap-2 px-3 py-2.5 rounded-lg items-center ${
            entry.userId === currentUserId
              ? "bg-[#22C55E]/10 border border-[#22C55E]/20"
              : "bg-[#162D54]"
          }`}
        >
          <span className="text-sm font-mono font-bold text-white">
            {entry.position}
          </span>
          <div className="flex items-center gap-2 min-w-0">
            {entry.avatar ? (
              <Image
                src={entry.avatar}
                alt=""
                width={32}
                height={40}
                className="w-8 h-10 rounded-md object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#1E3862] flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(entry.name)}
              </div>
            )}
            <span className="text-sm truncate">{entry.nickname}</span>
          </div>
          <span className="text-sm font-mono font-bold text-right text-[#FFD60A] tabular-nums inline-flex items-baseline justify-end gap-0.5 flex-wrap">
            {formatPoints(entry.totalPoints)}
            <LastPointsGain points={entry.lastPointsGained} />
          </span>
          <span className="text-xs text-center tabular-nums">
            {entry.exactScores}
          </span>
          <div className="text-center">
            <PositionChange change={entry.positionChange ?? 0} />
          </div>
        </div>
      ))}
    </div>
  );
}

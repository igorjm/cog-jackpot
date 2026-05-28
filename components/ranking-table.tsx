import { getInitials } from "@/lib/utils";
import { RankingEntry } from "@/lib/ranking";
import { PositionChange } from "./position-change";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface RankingTableProps {
  entries: RankingEntry[];
  currentUserId?: string;
}

export function RankingTable({ entries, currentUserId }: RankingTableProps) {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[40px_1fr_60px_40px_40px] gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#A8C3E8]">
        <span>#</span>
        <span>Jogador</span>
        <span className="text-right text-[#22C55E]">Pts</span>
        <span className="text-center">🎯</span>
        <span className="text-center">Δ</span>
      </div>

      {entries.map((entry) => (
        <div
          key={entry.userId}
          className={`grid grid-cols-[40px_1fr_60px_40px_40px] gap-2 px-3 py-2.5 rounded-lg items-center ${
            entry.userId === currentUserId
              ? "bg-[#22C55E]/10 border border-[#22C55E]/20"
              : "bg-[#122448]"
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
              <div className="w-8 h-8 rounded-full bg-[#1A3058] flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(entry.name)}
              </div>
            )}
            <span className="text-sm truncate">{entry.nickname}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

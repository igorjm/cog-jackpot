import { getInitials } from "@/lib/utils";
import { RankingEntry } from "@/lib/ranking";
import { PositionChange } from "./position-change";
import { cn } from "@/lib/utils";

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

      {entries.map((entry) => {
        const isCurrent = entry.userId === currentUserId;
        return (
          <div
            key={entry.userId}
            className={cn(
              "grid grid-cols-[40px_1fr_60px_40px_40px] items-center gap-2 rounded-xl px-3 py-2.5",
              isCurrent
                ? "border border-[#FACC15]/35 bg-[#FACC15]/10 glow-gold"
                : "card-premium"
            )}
          >
            <span className="font-mono text-sm font-bold text-[#FACC15]">
              {entry.position}
            </span>
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0e2548] text-xs font-bold text-[#FACC15]">
                {getInitials(entry.name)}
              </div>
              <span className="truncate text-sm font-medium text-white">
                {entry.nickname}
              </span>
            </div>
            <span className="text-right font-mono text-sm font-bold tabular-nums text-[#22C55E]">
              {entry.totalPoints}
            </span>
            <span className="text-center text-xs tabular-nums text-[#A8C3E8]">
              {entry.exactScores}
            </span>
            <div className="text-center">
              <PositionChange change={entry.positionChange ?? 0} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

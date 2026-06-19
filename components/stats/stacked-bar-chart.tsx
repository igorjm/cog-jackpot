import type { ConfederationRecord } from "@/lib/stats";

interface StackedBarChartProps {
  items: ConfederationRecord[];
}

export function StackedBarChart({ items }: StackedBarChartProps) {
  if (items.length === 0) return null;

  const maxGames = Math.max(...items.map((i) => i.totalGames), 1);

  return (
    <div className="space-y-3" role="img" aria-label="Resultados por confederação">
      {items.map((item) => {
        const { wins, draws, losses, totalGames, label } = item;
        const barWidth = (totalGames / maxGames) * 100;
        const winPct = totalGames > 0 ? (wins / totalGames) * 100 : 0;
        const drawPct = totalGames > 0 ? (draws / totalGames) * 100 : 0;
        const lossPct = totalGames > 0 ? (losses / totalGames) * 100 : 0;

        return (
          <div key={item.confederation} className="min-h-[44px]">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-sm font-semibold text-white w-20 shrink-0">
                {label}
              </span>
              <span className="text-[10px] font-mono text-[#94B8D8] tabular-nums shrink-0">
                {wins}V {draws}E {losses}D · {totalGames}J
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 rounded-full overflow-hidden flex bg-[#0F2347] flex-1"
                style={{ maxWidth: `${barWidth}%`, minWidth: totalGames > 0 ? "20%" : 0 }}
              >
                {wins > 0 && (
                  <div
                    className="bg-[#22C55E] h-full"
                    style={{ width: `${winPct}%` }}
                  />
                )}
                {draws > 0 && (
                  <div
                    className="bg-[#FFD60A] h-full"
                    style={{ width: `${drawPct}%` }}
                  />
                )}
                {losses > 0 && (
                  <div
                    className="bg-[#EF4444] h-full"
                    style={{ width: `${lossPct}%` }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StackedBarLegend() {
  return (
    <div className="flex items-center justify-center gap-4 text-[10px] text-[#94B8D8]">
      <span className="flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]" /> V
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded-sm bg-[#FFD60A]" /> E
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" /> D
      </span>
    </div>
  );
}

interface HomeAwayBarProps {
  homeWins: number;
  draws: number;
  awayWins: number;
  total: number;
}

export function HomeAwayBar({ homeWins, draws, awayWins, total }: HomeAwayBarProps) {
  if (total === 0) return null;

  const homePct = (homeWins / total) * 100;
  const drawPct = (draws / total) * 100;
  const awayPct = (awayWins / total) * 100;

  return (
    <div role="img" aria-label="Mandante vs visitante">
      <div className="h-4 rounded-full overflow-hidden flex bg-[#0F2347]">
        {homeWins > 0 && (
          <div className="bg-[#22C55E] h-full" style={{ width: `${homePct}%` }} />
        )}
        {draws > 0 && (
          <div className="bg-[#FFD60A] h-full" style={{ width: `${drawPct}%` }} />
        )}
        {awayWins > 0 && (
          <div className="bg-[#38BDF8] h-full" style={{ width: `${awayPct}%` }} />
        )}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-[#94B8D8]">
        <span>
          🏠 Mandante{" "}
          <span className="font-mono text-white">{homeWins}</span> ({Math.round(homePct)}%)
        </span>
        <span>
          Empate{" "}
          <span className="font-mono text-white">{draws}</span> ({Math.round(drawPct)}%)
        </span>
        <span>
          ✈️ Visitante{" "}
          <span className="font-mono text-white">{awayWins}</span> ({Math.round(awayPct)}%)
        </span>
      </div>
    </div>
  );
}

import type { LeaderboardEntry } from "@/lib/stats";

interface LeaderboardBarsProps {
  items: LeaderboardEntry[];
  valueSuffix?: string;
  medals?: boolean;
}

export function LeaderboardBars({
  items,
  valueSuffix = "",
  medals = true,
}: LeaderboardBarsProps) {
  if (items.length === 0) return null;

  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const medalIcons = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-2.5" role="img" aria-label="Ranking">
      {items.map((item, i) => (
        <div key={`${item.label}-${i}`} className="min-h-[44px]">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-6 text-center shrink-0">
                {medals && i < 3 ? medalIcons[i] : `${i + 1}.`}
              </span>
              <span className="text-sm text-white truncate" title={item.label}>
                {item.label}
              </span>
            </div>
            <span className="text-xs font-mono text-[#94B8D8] shrink-0 tabular-nums">
              {item.value}
              {valueSuffix}
            </span>
          </div>
          <div className="ml-8 h-1.5 bg-[#0F2347] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#38BDF8]"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface MyStatsCardProps {
  stats: {
    totalPoints: number;
    exactScores: number;
    accuracy: number;
    poolAvgPoints: number;
    poolAvgAccuracy: number;
    poolAvgExacts: number;
  };
}

export function MyStatsCard({ stats }: MyStatsCardProps) {
  const items = [
    {
      label: "Pontos",
      mine: stats.totalPoints,
      avg: stats.poolAvgPoints,
      color: "text-[#22C55E]",
    },
    {
      label: "Cravadas",
      mine: stats.exactScores,
      avg: stats.poolAvgExacts,
      color: "text-[#FFD60A]",
    },
    {
      label: "Aproveit.",
      mine: `${stats.accuracy}%`,
      avg: `${stats.poolAvgAccuracy}%`,
      color: "text-[#38BDF8]",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <p className={`text-lg font-mono font-bold tabular-nums ${item.color}`}>
            {item.mine}
          </p>
          <p className="text-[10px] text-[#94B8D8]">{item.label}</p>
          <p className="text-[9px] text-[#5A7A9A] mt-0.5">
            méd. {item.avg}
          </p>
        </div>
      ))}
    </div>
  );
}

interface PoolAccuracyBarProps {
  accuracy: number;
}

export function PoolAccuracyBar({ accuracy }: PoolAccuracyBarProps) {
  return (
    <div className="text-center">
      <p className="text-3xl font-mono font-bold text-[#22C55E] tabular-nums">
        {accuracy}%
      </p>
      <p className="text-xs text-[#94B8D8] mt-1">
        dos palpites acertaram o vencedor
      </p>
      <div className="mt-3 h-2 bg-[#0F2347] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#22C55E]"
          style={{ width: `${accuracy}%` }}
        />
      </div>
    </div>
  );
}

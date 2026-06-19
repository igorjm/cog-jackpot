import type { BarItem } from "@/lib/stats";

interface HorizontalBarChartProps {
  items: BarItem[];
  showRank?: boolean;
  valueSuffix?: string;
  /** When true, show raw value without suffix (e.g. goal counts) */
  rawValue?: boolean;
}

function formatValue(value: number, suffix: string, rawValue: boolean): string {
  if (rawValue) return String(value);
  if (value % 1 !== 0) return suffix ? `${value} ${suffix.trim()}` : String(value);
  return `${value}${suffix}`;
}

export function HorizontalBarChart({
  items,
  showRank = true,
  valueSuffix = "x",
  rawValue = false,
}: HorizontalBarChartProps) {
  if (items.length === 0) return null;

  const maxPct = Math.max(...items.map((i) => i.percentage), 1);

  return (
    <div className="space-y-2.5" role="img" aria-label="Gráfico de barras horizontais">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-2 min-h-[44px]">
          {showRank && (
            <span className="w-5 text-center text-xs text-[#5A7A9A] shrink-0">
              {item.isOther ? "·" : i + 1}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span
                className="text-sm text-white truncate"
                title={item.label}
              >
                {item.label}
              </span>
              <span className="text-xs font-mono text-[#94B8D8] shrink-0 tabular-nums">
                {formatValue(item.value, valueSuffix, rawValue)} ({item.percentage}%)
              </span>
            </div>
            <div className="h-2 bg-[#0F2347] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  item.isOther ? "bg-[#5A7A9A]" : "bg-[#38BDF8]"
                }`}
                style={{ width: `${(item.percentage / maxPct) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

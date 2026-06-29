import { formatPoints } from "@/lib/utils";

interface LastPointsGainProps {
  points: number | null | undefined;
  className?: string;
}

export function LastPointsGain({ points, className = "" }: LastPointsGainProps) {
  if (points == null) return null;

  const formatted = formatPoints(points);

  return (
    <span
      className={`text-[10px] font-mono tabular-nums ${
        points > 0
          ? "text-[#22C55E]"
          : points === 0
          ? "text-[#5A7A9A]"
          : "text-[#EF4444]"
      } ${className}`}
    >
      (+{formatted})
    </span>
  );
}

import Image from "next/image";
import type { TeamGoalsRecord } from "@/lib/stats";
import { getFlagSrc } from "@/lib/utils";

interface TeamGoalsChartProps {
  teams: TeamGoalsRecord[];
  mode: "attack" | "defense";
}

export function TeamGoalsChart({ teams, mode }: TeamGoalsChartProps) {
  if (teams.length === 0) return null;

  const maxValue = Math.max(
    ...teams.map((t) => (mode === "attack" ? t.goalsFor : t.goalsAgainst)),
    1
  );

  return (
    <div className="space-y-2.5" role="img" aria-label={mode === "attack" ? "Artilharia" : "Defesas"}>
      {teams.map((team, i) => {
        const value = mode === "attack" ? team.goalsFor : team.goalsAgainst;
        const secondary = mode === "attack" ? team.goalsAgainst : team.goalsFor;
        const secondaryLabel = mode === "attack" ? "sofridos" : "marcados";

        return (
          <div key={team.flag} className="flex items-center gap-2 min-h-[44px]">
            <span className="w-5 text-center text-xs text-[#5A7A9A] shrink-0">
              {i + 1}
            </span>
            <Image
              src={getFlagSrc(team.flag, 40)}
              alt=""
              width={20}
              height={15}
              className="rounded-sm shrink-0 object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm text-white truncate" title={team.team}>
                  {team.team}
                </span>
                <span className="text-xs font-mono text-[#94B8D8] shrink-0 tabular-nums">
                  {value} ({secondary} {secondaryLabel})
                </span>
              </div>
              <div className="h-2 bg-[#0F2347] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    mode === "attack" ? "bg-[#22C55E]" : "bg-[#38BDF8]"
                  }`}
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

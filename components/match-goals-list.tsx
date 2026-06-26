import type { MatchGoal } from "@/lib/match-goals";
import { formatGoalMinute, formatGoalType, groupGoalsByTeam } from "@/lib/match-goals";

interface MatchGoalsListProps {
  homeTeam: string;
  awayTeam: string;
  goals: MatchGoal[];
}

function GoalLine({ goal }: { goal: MatchGoal }) {
  const typeLabel = formatGoalType(goal.type);

  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="text-[11px] font-mono text-[#94B8D8] shrink-0 w-9 text-right pt-0.5">
        {formatGoalMinute(goal)}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-white truncate">{goal.scorer}</p>
        {goal.assist && (
          <p className="text-[10px] text-[#5A7A9A] truncate">{goal.assist}</p>
        )}
        {typeLabel && (
          <p className="text-[10px] text-[#5A7A9A]">({typeLabel})</p>
        )}
      </div>
    </div>
  );
}

export function MatchGoalsList({ homeTeam, awayTeam, goals }: MatchGoalsListProps) {
  if (goals.length === 0) return null;

  const { home, away } = groupGoalsByTeam(goals);

  return (
    <div className="rounded-xl border border-[#2A4A7A] bg-[#0F2347]/60 overflow-hidden">
      <div className="px-3 py-2 border-b border-[#2A4A7A] flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94B8D8]">
          Gols
        </span>
        <span className="text-[10px] text-[#5A7A9A]">({goals.length})</span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-[#2A4A7A]">
        <div className="p-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94B8D8] truncate">
            {homeTeam}
          </p>
          {home.length > 0 ? (
            home.map((goal, index) => <GoalLine key={`home-${index}`} goal={goal} />)
          ) : (
            <p className="text-[11px] text-[#5A7A9A]">—</p>
          )}
        </div>

        <div className="p-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94B8D8] truncate">
            {awayTeam}
          </p>
          {away.length > 0 ? (
            away.map((goal, index) => <GoalLine key={`away-${index}`} goal={goal} />)
          ) : (
            <p className="text-[11px] text-[#5A7A9A]">—</p>
          )}
        </div>
      </div>
    </div>
  );
}

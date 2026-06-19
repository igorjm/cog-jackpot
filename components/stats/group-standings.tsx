"use client";

import { useState } from "react";
import Image from "next/image";
import type { GroupStanding } from "@/lib/stats";
import { getFlagSrc } from "@/lib/utils";

interface GroupStandingsProps {
  groups: GroupStanding[];
}

export function GroupStandings({ groups }: GroupStandingsProps) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.group ?? "A");

  if (groups.length === 0) return null;

  const current = groups.find((g) => g.group === activeGroup) ?? groups[0];

  return (
    <div className="space-y-3">
      <div
        className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
        role="tablist"
        aria-label="Selecionar grupo"
      >
        {groups.map((g) => (
          <button
            key={g.group}
            type="button"
            role="tab"
            aria-selected={activeGroup === g.group}
            onClick={() => setActiveGroup(g.group)}
            className={`shrink-0 min-w-[44px] min-h-[44px] px-3 py-2 text-sm font-bold rounded-lg transition-all ${
              activeGroup === g.group
                ? "bg-[#FFD60A] text-[#0F2347]"
                : "bg-[#0F2347] text-[#94B8D8] border border-[#2A4A7A]"
            }`}
          >
            {g.group}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[280px] text-xs">
          <thead>
            <tr className="text-[#5A7A9A] border-b border-[#2A4A7A]/50">
              <th className="text-left py-2 pl-1 font-medium">#</th>
              <th className="text-left py-2 font-medium">Seleção</th>
              <th className="text-center py-2 font-medium w-8">J</th>
              <th className="text-center py-2 font-medium w-8">V</th>
              <th className="text-center py-2 font-medium w-8">E</th>
              <th className="text-center py-2 font-medium w-8">D</th>
              <th className="text-center py-2 font-medium w-10">SG</th>
              <th className="text-center py-2 pr-1 font-medium w-8">Pts</th>
            </tr>
          </thead>
          <tbody>
            {current.teams.map((team, i) => (
              <tr
                key={team.flag}
                className="border-b border-[#2A4A7A]/30 last:border-0"
              >
                <td className="py-2.5 pl-1 text-[#5A7A9A] tabular-nums">
                  {i + 1}
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Image
                      src={getFlagSrc(team.flag, 40)}
                      alt=""
                      width={20}
                      height={15}
                      className="rounded-sm shrink-0 object-cover"
                    />
                    <span className="text-white truncate max-w-[100px] sm:max-w-[140px]" title={team.team}>
                      {team.team}
                    </span>
                  </div>
                </td>
                <td className="text-center py-2.5 text-[#94B8D8] tabular-nums">
                  {team.played}
                </td>
                <td className="text-center py-2.5 text-[#94B8D8] tabular-nums">
                  {team.wins}
                </td>
                <td className="text-center py-2.5 text-[#94B8D8] tabular-nums">
                  {team.draws}
                </td>
                <td className="text-center py-2.5 text-[#94B8D8] tabular-nums">
                  {team.losses}
                </td>
                <td
                  className={`text-center py-2.5 tabular-nums font-medium ${
                    team.goalDiff > 0
                      ? "text-[#22C55E]"
                      : team.goalDiff < 0
                      ? "text-[#EF4444]"
                      : "text-[#94B8D8]"
                  }`}
                >
                  {team.goalDiff > 0 ? "+" : ""}
                  {team.goalDiff}
                </td>
                <td className="text-center py-2.5 pr-1 font-bold text-[#FFD60A] tabular-nums">
                  {team.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

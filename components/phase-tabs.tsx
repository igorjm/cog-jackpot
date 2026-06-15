"use client";

import { cn } from "@/lib/utils";
import { Phase } from "@prisma/client";
import { PHASE_LABELS } from "@/lib/constants";

interface PhaseTabsProps {
  activePhase: Phase;
  onPhaseChange: (phase: Phase) => void;
  activeGroup?: string;
  onGroupChange?: (group: string) => void;
  groups?: string[];
}

const phases: Phase[] = [
  "GROUP",
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
];

export function PhaseTabs({
  activePhase,
  onPhaseChange,
  activeGroup,
  onGroupChange,
  groups,
}: PhaseTabsProps) {
  return (
    <div className="space-y-2">
      <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-hide">
        {phases.map((phase) => (
          <button
            key={phase}
            onClick={() => onPhaseChange(phase)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
              activePhase === phase
                ? "bg-[#22C55E] text-white"
                : "bg-[#162D54] text-[#94B8D8] hover:text-white"
            )}
          >
            {PHASE_LABELS[phase]}
          </button>
        ))}
      </div>

      {activePhase === "GROUP" && groups && groups.length > 0 && onGroupChange && (
        <div className="flex overflow-x-auto gap-1 pb-2">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => onGroupChange(group)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeGroup === group
                  ? "bg-[#FFD60A] text-black"
                  : "bg-[#162D54] text-[#94B8D8] hover:text-white"
              )}
            >
              Grupo {group}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

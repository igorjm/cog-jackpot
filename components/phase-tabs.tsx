"use client";

import { cn } from "@/lib/utils";
import { Phase } from "@prisma/client";
import { PHASE_LABELS } from "@/lib/constants";
import { GroupTabs } from "@/components/group-tabs";

interface PhaseTabsProps {
  activePhase: Phase;
  onPhaseChange: (phase: Phase) => void;
  activeGroup?: string;
  onGroupChange?: (group: string) => void;
  groups?: string[];
}

const phases: Phase[] = [
  "GROUP",
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
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {phases.map((phase) => (
          <button
            key={phase}
            type="button"
            onClick={() => onPhaseChange(phase)}
            className={cn(
              "shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all",
              activePhase === phase
                ? "tab-phase-active"
                : "tab-phase-inactive hover:border-white/20 hover:text-white"
            )}
          >
            {PHASE_LABELS[phase]}
          </button>
        ))}
      </div>

      {activePhase === "GROUP" &&
        groups &&
        groups.length > 0 &&
        onGroupChange &&
        activeGroup && (
          <GroupTabs
            groups={groups}
            activeGroup={activeGroup}
            onGroupChange={onGroupChange}
          />
        )}
    </div>
  );
}

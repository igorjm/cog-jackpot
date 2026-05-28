"use client";

import { cn } from "@/lib/utils";

interface GroupTabsProps {
  groups: string[];
  activeGroup: string;
  onGroupChange: (group: string) => void;
}

export function GroupTabs({ groups, activeGroup, onGroupChange }: GroupTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {groups.map((group) => (
        <button
          key={group}
          type="button"
          onClick={() => onGroupChange(group)}
          className={cn(
            "shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
            activeGroup === group
              ? "tab-group-active"
              : "tab-phase-inactive hover:text-white"
          )}
        >
          Grupo {group}
        </button>
      ))}
    </div>
  );
}

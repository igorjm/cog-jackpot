export type GoalType = "REGULAR" | "PENALTY" | "OWN_GOAL" | string;

export interface MatchGoal {
  minute: number;
  injuryTime: number | null;
  teamSide: "home" | "away";
  scorer: string;
  assist: string | null;
  type: GoalType;
}

export function formatGoalMinute(goal: MatchGoal): string {
  if (goal.injuryTime) return `${goal.minute}+${goal.injuryTime}'`;
  return `${goal.minute}'`;
}

export function formatGoalType(type: GoalType): string | null {
  if (type === "PENALTY") return "pênalti";
  if (type === "OWN_GOAL") return "gol contra";
  return null;
}

export function parseMatchGoals(value: unknown): MatchGoal[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (goal): goal is MatchGoal =>
        typeof goal === "object" &&
        goal !== null &&
        typeof (goal as MatchGoal).minute === "number" &&
        ((goal as MatchGoal).teamSide === "home" || (goal as MatchGoal).teamSide === "away") &&
        typeof (goal as MatchGoal).scorer === "string"
    )
    .sort((a, b) => a.minute - b.minute || (a.injuryTime ?? 0) - (b.injuryTime ?? 0));
}

export function groupGoalsByTeam(goals: MatchGoal[]): {
  home: MatchGoal[];
  away: MatchGoal[];
} {
  return {
    home: goals.filter((g) => g.teamSide === "home"),
    away: goals.filter((g) => g.teamSide === "away"),
  };
}

import {
  formatGoalMinute,
  formatGoalType,
  groupGoalsByTeam,
  parseMatchGoals,
} from "../lib/match-goals";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

(() => {
  assert(formatGoalMinute({ minute: 45, injuryTime: 2, teamSide: "home", scorer: "A", assist: null, type: "REGULAR" }) === "45+2'", "formats injury time");
  assert(formatGoalType("PENALTY") === "pênalti", "penalty label");
  assert(formatGoalType("OWN_GOAL") === "gol contra", "own goal label");

  const goals = parseMatchGoals([
    { minute: 70, injuryTime: null, teamSide: "away", scorer: "Mbappé", assist: null, type: "REGULAR" },
    { minute: 12, injuryTime: null, teamSide: "home", scorer: "Haaland", assist: "Ødegaard", type: "REGULAR" },
    "invalid",
  ]);
  assert(goals.length === 2, "parses valid goals only");
  assert(goals[0].scorer === "Haaland", "sorts goals by minute");

  const grouped = groupGoalsByTeam(goals);
  assert(grouped.home.length === 1 && grouped.away.length === 1, "groups by team side");
})();

console.log("\nAll match-goals tests passed!");

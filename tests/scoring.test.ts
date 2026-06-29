import { calculatePoints, calculateFinalPoints } from "../lib/scoring";

// Test helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

// Scenario 1: Exact score
(() => {
  const result = calculatePoints(
    { homeScore: 3, awayScore: 1 },
    { homeScore: 3, awayScore: 1 }
  );
  assert(result.points === 10, "Exact score 3×1 = 10 pts");
  assert(result.scenario === 1, "Scenario 1");
})();

// Scenario 1: Exact score 0×0
(() => {
  const result = calculatePoints(
    { homeScore: 0, awayScore: 0 },
    { homeScore: 0, awayScore: 0 }
  );
  assert(result.points === 10, "Exact score 0×0 = 10 pts");
  assert(result.scenario === 1, "Scenario 1 (0×0)");
})();

// Scenario 2: Winner + 1 correct score (away score correct)
(() => {
  const result = calculatePoints(
    { homeScore: 2, awayScore: 1 },
    { homeScore: 3, awayScore: 1 }
  );
  assert(result.points === 7, "Winner + away score correct = 7 pts");
  assert(result.scenario === 2, "Scenario 2");
})();

// Scenario 2: Winner + 1 correct score (home score correct)
(() => {
  const result = calculatePoints(
    { homeScore: 3, awayScore: 0 },
    { homeScore: 3, awayScore: 1 }
  );
  assert(result.points === 7, "Winner + home score correct = 7 pts");
  assert(result.scenario === 2, "Scenario 2 (home)");
})();

// Scenario 3: Only correct winner
(() => {
  const result = calculatePoints(
    { homeScore: 1, awayScore: 0 },
    { homeScore: 3, awayScore: 1 }
  );
  assert(result.points === 5, "Correct winner only = 5 pts");
  assert(result.scenario === 3, "Scenario 3");
})();

// Scenario 3: Away team wins, correct winner
(() => {
  const result = calculatePoints(
    { homeScore: 0, awayScore: 2 },
    { homeScore: 1, awayScore: 3 }
  );
  assert(result.points === 5, "Correct away winner = 5 pts");
  assert(result.scenario === 3, "Scenario 3 (away)");
})();

// Scenario 4: Correct draw (not exact)
(() => {
  const result = calculatePoints(
    { homeScore: 1, awayScore: 1 },
    { homeScore: 2, awayScore: 2 }
  );
  assert(result.points === 5, "Correct draw = 5 pts");
  assert(result.scenario === 4, "Scenario 4");
})();

// Scenario 4: Draw 3×3 vs 0×0
(() => {
  const result = calculatePoints(
    { homeScore: 3, awayScore: 3 },
    { homeScore: 0, awayScore: 0 }
  );
  assert(result.points === 5, "Correct draw (3×3 vs 0×0) = 5 pts");
  assert(result.scenario === 4, "Scenario 4 (different scores)");
})();

// Scenario 5: One score correct but wrong winner
(() => {
  const result = calculatePoints(
    { homeScore: 0, awayScore: 1 },
    { homeScore: 3, awayScore: 1 }
  );
  assert(result.points === 2, "One score correct (wrong winner) = 2 pts");
  assert(result.scenario === 5, "Scenario 5");
})();

// Scenario 5: Home score correct but wrong winner
(() => {
  const result = calculatePoints(
    { homeScore: 2, awayScore: 3 },
    { homeScore: 2, awayScore: 0 }
  );
  assert(result.points === 2, "Home score correct (wrong winner) = 2 pts");
  assert(result.scenario === 5, "Scenario 5 (home)");
})();

// Scenario 6: Everything wrong
(() => {
  const result = calculatePoints(
    { homeScore: 1, awayScore: 3 },
    { homeScore: 3, awayScore: 1 }
  );
  assert(result.points === 0, "Everything wrong = 0 pts");
  assert(result.scenario === 6, "Scenario 6");
})();

// Scenario 6: Wrong with no scores matching
(() => {
  const result = calculatePoints(
    { homeScore: 4, awayScore: 2 },
    { homeScore: 0, awayScore: 1 }
  );
  assert(result.points === 0, "Wrong everything (4×2 vs 0×1) = 0 pts");
  assert(result.scenario === 6, "Scenario 6 (no match)");
})();

// Edge case: Draw predicted, home wins (with one score matching)
(() => {
  const result = calculatePoints(
    { homeScore: 1, awayScore: 1 },
    { homeScore: 1, awayScore: 0 }
  );
  assert(result.points === 2, "Draw predicted, home wins, home score matches = 2 pts");
  assert(result.scenario === 5, "Scenario 5 edge case");
})();

// Multiplier test
(() => {
  const final = calculateFinalPoints(10, 3);
  assert(final === 30, "10 pts × 3 multiplier = 30 final pts");
})();

(() => {
  const final = calculateFinalPoints(7, 1.5);
  assert(final === 10.5, "7 pts × 1.5 multiplier = 10.5 final pts (exact)");
})();

(() => {
  const final = calculateFinalPoints(7, 1.25);
  assert(final === 8.75, "7 pts × 1.25 multiplier = 8.75 final pts (exact)");
})();

(() => {
  const final = calculateFinalPoints(10, 1.25);
  assert(final === 12.5, "10 pts × 1.25 multiplier = 12.5 final pts (exact)");
})();

(() => {
  const final = calculateFinalPoints(5, 2.5);
  assert(final === 12.5, "5 pts × 2.5 multiplier = 12.5 final pts (exact)");
})();

(() => {
  const final = calculateFinalPoints(0, 3);
  assert(final === 0, "0 pts × 3 multiplier = 0 final pts");
})();

console.log("\n🎉 All scoring tests passed!");

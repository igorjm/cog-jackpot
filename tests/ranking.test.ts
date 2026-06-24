import { resolveLastPointsGained } from "../lib/ranking";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

const latestMatch = "match-latest";
const olderMatch = "match-older";
const latestMatchB = "match-latest-b";

// No finished matches yet
(() => {
  const result = resolveLastPointsGained(
    [{ matchId: olderMatch, points: 7 }],
    []
  );
  assert(result === null, "No finished matches returns null");
})();

// User bet on latest match (+7)
(() => {
  const result = resolveLastPointsGained(
    [{ matchId: latestMatch, points: 7 }],
    [latestMatch]
  );
  assert(result === 7, "Latest round bet with +7 returns 7");
})();

// User bet on older match only; latest round skipped
(() => {
  const result = resolveLastPointsGained(
    [{ matchId: olderMatch, points: 7 }],
    [latestMatch]
  );
  assert(result === 0, "Skipped latest round returns 0 instead of stale +7");
})();

// User bet on latest match but scored 0
(() => {
  const result = resolveLastPointsGained(
    [{ matchId: latestMatch, points: 0 }],
    [latestMatch]
  );
  assert(result === 0, "Latest round bet with 0 points returns 0");
})();

// Two latest-round matches; user bet on one (+5)
(() => {
  const result = resolveLastPointsGained(
    [
      { matchId: olderMatch, points: 10 },
      { matchId: latestMatch, points: 5 },
    ],
    [latestMatch, latestMatchB]
  );
  assert(result === 5, "Same-day latest round sums only bets on latest matches");
})();

// Two latest-round matches; user bet on both (+3, +7)
(() => {
  const result = resolveLastPointsGained(
    [
      { matchId: latestMatch, points: 3 },
      { matchId: latestMatchB, points: 7 },
    ],
    [latestMatch, latestMatchB]
  );
  assert(result === 10, "Two latest-round bets sum to 10");
})();

console.log("\nAll ranking tests passed!");

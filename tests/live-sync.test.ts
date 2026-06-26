import { refreshLiveScoresIfDue, resetLiveSyncStateForTests } from "../lib/live-sync";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

(async () => {
  resetLiveSyncStateForTests();
  delete process.env.FOOTBALL_DATA_API_KEY;

  const start = Date.now();
  await refreshLiveScoresIfDue(1000);
  await refreshLiveScoresIfDue(1000);
  const elapsed = Date.now() - start;

  assert(elapsed < 500, "skips API when FOOTBALL_DATA_API_KEY is missing");

  console.log("\nAll live-sync tests passed!");
})();

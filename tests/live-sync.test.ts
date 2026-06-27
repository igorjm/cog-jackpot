import { refreshLiveScoresIfDue, resetLiveSyncStateForTests, shouldRefreshLiveScoresOnDemand } from "../lib/live-sync";

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

  const prevNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  const start = Date.now();
  await refreshLiveScoresIfDue(1000);
  await refreshLiveScoresIfDue(1000);
  const elapsed = Date.now() - start;

  assert(elapsed < 500, "skips API when FOOTBALL_DATA_API_KEY is missing");
  assert(shouldRefreshLiveScoresOnDemand() === false, "on-demand sync disabled in production");

  process.env.NODE_ENV = "development";
  assert(shouldRefreshLiveScoresOnDemand() === true, "on-demand sync enabled in development");
  process.env.NODE_ENV = prevNodeEnv;

  console.log("\nAll live-sync tests passed!");
})();

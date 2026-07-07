import "dotenv/config";
import { runSyncLiveScoresJob } from "../lib/jobs/sync-live-scores";

async function main() {
  const result = await runSyncLiveScoresJob();
  console.log(JSON.stringify({ success: true, ...result }, null, 2));
}

main().catch((err) => {
  console.error("[sync-live-scores]", err);
  process.exit(1);
});

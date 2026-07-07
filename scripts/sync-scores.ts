import "dotenv/config";
import { runSyncScoresJob } from "../lib/jobs/sync-scores";

async function main() {
  const result = await runSyncScoresJob();
  console.log(JSON.stringify({ success: true, ...result }, null, 2));
}

main().catch((err) => {
  console.error("[sync-scores]", err);
  process.exit(1);
});

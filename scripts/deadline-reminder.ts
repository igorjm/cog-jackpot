import "dotenv/config";
import { runDeadlineReminderJob } from "../lib/jobs/deadline-reminder";

async function main() {
  const result = await runDeadlineReminderJob();
  console.log(JSON.stringify({ success: true, ...result }, null, 2));
}

main().catch((err) => {
  console.error("[deadline-reminder]", err);
  process.exit(1);
});

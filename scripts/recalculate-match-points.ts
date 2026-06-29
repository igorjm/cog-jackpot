if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
import "dotenv/config";
import { recalculateAllFinishedBetPoints } from "../lib/bet-points";

const multiplierOnly = process.argv.includes("--multiplier-only");

async function main() {
  console.log(
    multiplierOnly
      ? "Recalculating bet points for finished matches with multiplier ≠ 1...\n"
      : "Recalculating bet points for all finished non-friendly matches...\n"
  );

  const results = await recalculateAllFinishedBetPoints({ multiplierOnly });

  let totalUpdated = 0;
  let totalChanged = 0;

  for (const result of results) {
    totalUpdated += result.updated;
    totalChanged += result.changed;

    if (result.changed === 0) {
      console.log(
        `  J${result.matchNumber} (${result.phase}, ×${result.multiplier}): ${result.updated} bet(s), no changes`
      );
      continue;
    }

    console.log(
      `  J${result.matchNumber} (${result.phase}, ×${result.multiplier}): ${result.changed}/${result.updated} bet(s) corrected`
    );

    const byCorrection = new Map<string, number>();
    for (const correction of result.corrections) {
      const key = `${correction.rawPoints} pts: ${correction.from} → ${correction.to}`;
      byCorrection.set(key, (byCorrection.get(key) ?? 0) + 1);
    }

    for (const [summary, count] of byCorrection) {
      console.log(`    • ${count}× ${summary}`);
    }
  }

  console.log(
    `\nDone. ${totalChanged} correction(s) across ${totalUpdated} bet(s) in ${results.length} match(es).`
  );
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

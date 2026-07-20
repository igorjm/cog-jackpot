import "dotenv/config";
import { prisma } from "../lib/prisma";
import { scorePredictions } from "../lib/prediction-points";

/**
 * Scores the special predictions (champion + top scorer).
 *
 * Usage:
 *   npx tsx scripts/score-predictions.ts --top-scorer="Kylian Mbappé" [--champion="Espanha"] [--dry-run]
 *
 * Champion is auto-resolved from the final (match 104) unless overridden.
 * Top scorer must be provided explicitly (no in-DB source of truth).
 */

function getArg(name: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.slice(`--${name}=`.length) : undefined;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const topScorer = getArg("top-scorer");
  const championOverride = getArg("champion");

  if (!topScorer) {
    console.warn(
      "⚠️  No --top-scorer provided — only the champion prediction will be scored.\n"
    );
  }

  const result = await scorePredictions({
    champion: championOverride,
    topScorer,
    dryRun,
  });

  console.log(dryRun ? "DRY RUN — no data modified\n" : "Applying prediction scores...\n");
  console.log(`Champion:            ${result.champion ?? "UNRESOLVED"}`);
  console.log(`  Correct picks:     ${result.championCorrect}`);
  console.log(`  Predictions marked:${result.dryRun ? " (none — dry run)" : ` ${result.championScored}`}`);
  console.log(`Top scorer:          ${result.topScorer ?? "NOT PROVIDED"}`);
  console.log(`  Correct picks:     ${result.topScorerCorrect}`);
  console.log(`  Predictions marked:${result.dryRun ? " (none — dry run)" : ` ${result.topScorerScorer}`}`);

  const bonus = 10;
  console.log(
    `\nTotal bonus awarded: ${dryRun ? "(dry run) " : ""}${(result.championCorrect + result.topScorerCorrect) * bonus} pts ` +
      `across ${result.championCorrect + result.topScorerCorrect} correct prediction(s).`
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Failed to score predictions:", err);
  process.exit(1);
});

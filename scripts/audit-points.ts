import "dotenv/config";
import { prisma } from "../lib/prisma";
import { calculatePoints, calculateFinalPoints } from "../lib/scoring";
import { enrichKnockoutTeams } from "../lib/knockout-resolve";
import { resolveMatchWinnerSide, type WinnerSide } from "../lib/match-winner";
import { PREDICTION_POINTS } from "../lib/constants";
import { FINAL_MATCH_NUMBER } from "../lib/bracket-tree";

/**
 * Read-only audit of player points.
 * - Verifies every match bet's points/rawPoints against a fresh recomputation.
 * - Resolves the World Cup champion from the final (match 104).
 * - Reports champion + top-scorer prediction status (currently unscored).
 *
 * Optional flags to model the corrected ranking (still read-only):
 *   --top-scorer="Exact Player Name"
 *   --champion="Team Name Override"
 */

function getFlag(name: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.slice(`--${name}=`.length) : undefined;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

async function main() {
  const topScorerActual = getFlag("top-scorer");
  const championOverride = getFlag("champion");

  console.log("=".repeat(72));
  console.log("  BOLÃO COPA 2026 — FULL POINTS AUDIT (read-only)");
  console.log("=".repeat(72));

  // ---------------------------------------------------------------------------
  // 1. MATCH BET POINTS AUDIT
  // ---------------------------------------------------------------------------
  const finishedMatches = await prisma.match.findMany({
    where: {
      homeScore: { not: null },
      awayScore: { not: null },
      phase: { not: "FRIENDLY" },
    },
    include: { bets: { include: { user: { select: { nickname: true, status: true, role: true } } } } },
    orderBy: { matchNumber: "asc" },
  });

  const allMatchesCount = await prisma.match.count();
  const finishedNonFriendly = finishedMatches.length;

  let totalBetsChecked = 0;
  let mismatchedBets = 0;
  const mismatches: string[] = [];
  const perUserRecomputed = new Map<string, number>();

  for (const match of finishedMatches) {
    for (const bet of match.bets) {
      totalBetsChecked++;
      const { points: rawExpected } = calculatePoints(
        { homeScore: bet.homeScore, awayScore: bet.awayScore },
        { homeScore: match.homeScore!, awayScore: match.awayScore! }
      );
      const pointsExpected = calculateFinalPoints(rawExpected, match.multiplier);

      // accumulate recomputed totals for approved non-admin players
      if (bet.user.status === "APPROVED" && bet.user.role !== "ADMIN") {
        perUserRecomputed.set(
          bet.userId,
          (perUserRecomputed.get(bet.userId) ?? 0) + pointsExpected
        );
      }

      if (bet.rawPoints !== rawExpected || bet.points !== pointsExpected) {
        mismatchedBets++;
        if (mismatches.length < 50) {
          mismatches.push(
            `  J${match.matchNumber} (${match.phase} ×${match.multiplier}) ${bet.user.nickname}: ` +
              `bet ${bet.homeScore}x${bet.awayScore} vs result ${match.homeScore}x${match.awayScore} | ` +
              `stored raw=${bet.rawPoints} pts=${bet.points} → expected raw=${rawExpected} pts=${pointsExpected}`
          );
        }
      }
    }
  }

  console.log("\n[1] MATCH BET POINTS");
  console.log("-".repeat(72));
  console.log(`  Matches total:            ${allMatchesCount}`);
  console.log(`  Finished (non-friendly):  ${finishedNonFriendly}`);
  console.log(`  Bets checked:             ${totalBetsChecked}`);
  console.log(`  Incorrect bet points:     ${mismatchedBets}`);
  if (mismatchedBets > 0) {
    console.log("\n  Discrepancies (max 50 shown):");
    for (const line of mismatches) console.log(line);
    console.log("\n  → Run `npm run db:recalculate-points` to fix stored match points.");
  } else {
    console.log("  ✅ All stored match bet points match a fresh recomputation.");
  }

  // Friendly sanity check
  const friendlyBetsWithPoints = await prisma.bet.count({
    where: { match: { phase: "FRIENDLY" }, points: { not: null, gt: 0 } },
  });
  console.log(`  Friendly bets with >0 pts: ${friendlyBetsWithPoints} (expected 0)`);

  // ---------------------------------------------------------------------------
  // 2. CHAMPION RESOLUTION (from the final)
  // ---------------------------------------------------------------------------
  const allMatches = await prisma.match.findMany({ orderBy: { matchNumber: "asc" } });
  const enriched = enrichKnockoutTeams(allMatches);
  const final = enriched.find((m) => m.matchNumber === FINAL_MATCH_NUMBER);

  let resolvedChampion: string | null = null;
  if (final && final.homeScore !== null && final.awayScore !== null) {
    const side = resolveMatchWinnerSide({
      homeScore: final.homeScore,
      awayScore: final.awayScore,
      winnerSide: (final as { winnerSide?: string | null }).winnerSide as WinnerSide | null | undefined,
    });
    if (side === "home") resolvedChampion = final.homeTeam;
    else if (side === "away") resolvedChampion = final.awayTeam;
  }

  const champion = championOverride ?? resolvedChampion;

  console.log("\n[2] WORLD CUP CHAMPION");
  console.log("-".repeat(72));
  if (final) {
    console.log(
      `  Final (J${FINAL_MATCH_NUMBER}): ${final.homeTeam} ${final.homeScore ?? "?"} x ${final.awayScore ?? "?"} ${final.awayTeam}` +
        ((final as { winnerSide?: string | null }).winnerSide
          ? ` (winnerSide=${(final as { winnerSide?: string | null }).winnerSide})`
          : "")
    );
  } else {
    console.log(`  ⚠️  Final (match ${FINAL_MATCH_NUMBER}) not found.`);
  }
  console.log(`  Resolved champion:        ${resolvedChampion ?? "UNRESOLVED"}`);
  if (championOverride) console.log(`  Champion override (arg):  ${championOverride}`);
  console.log(`  Using champion:           ${champion ?? "UNKNOWN"}`);

  // ---------------------------------------------------------------------------
  // 3. SPECIAL PREDICTIONS (champion + top scorer)
  // ---------------------------------------------------------------------------
  const predictions = await prisma.prediction.findMany({
    include: { user: { select: { nickname: true, status: true, role: true } } },
  });

  const activePreds = predictions.filter(
    (p) => p.user.status === "APPROVED" && p.user.role !== "ADMIN"
  );
  const championPreds = activePreds.filter((p) => p.type === "CHAMPION");
  const topScorerPreds = activePreds.filter((p) => p.type === "TOP_SCORER");

  const anyScored = predictions.some((p) => p.points !== null);
  const correctChampionPicks = champion
    ? championPreds.filter((p) => p.value === champion)
    : [];

  console.log("\n[3] SPECIAL PREDICTIONS");
  console.log("-".repeat(72));
  console.log(`  Champion predictions:     ${championPreds.length}`);
  console.log(`  Top-scorer predictions:   ${topScorerPreds.length}`);
  console.log(
    `  Prediction.points set?    ${anyScored ? "YES" : "NO — all null (never scored)"}`
  );

  if (champion) {
    console.log(`\n  Correct champion (${champion}): ${correctChampionPicks.length} player(s)`);
    for (const p of correctChampionPicks) console.log(`    ✅ ${p.user.nickname}`);
  }

  // Champion pick distribution
  const champDist = new Map<string, number>();
  for (const p of championPreds) champDist.set(p.value, (champDist.get(p.value) ?? 0) + 1);
  console.log("\n  Champion pick distribution:");
  for (const [team, count] of [...champDist.entries()].sort((a, b) => b[1] - a[1])) {
    const mark = team === champion ? " ← CHAMPION" : "";
    console.log(`    ${String(count).padStart(3)}  ${team}${mark}`);
  }

  // Top scorer distribution
  const scorerDist = new Map<string, number>();
  for (const p of topScorerPreds) scorerDist.set(p.value, (scorerDist.get(p.value) ?? 0) + 1);
  console.log("\n  Top-scorer pick distribution:");
  for (const [player, count] of [...scorerDist.entries()].sort((a, b) => b[1] - a[1])) {
    const mark = topScorerActual && player === topScorerActual ? " ← TOP SCORER" : "";
    console.log(`    ${String(count).padStart(3)}  ${player}${mark}`);
  }

  let correctScorerPicks: typeof topScorerPreds = [];
  if (topScorerActual) {
    correctScorerPicks = topScorerPreds.filter((p) => p.value === topScorerActual);
    console.log(`\n  Correct top scorer (${topScorerActual}): ${correctScorerPicks.length} player(s)`);
    for (const p of correctScorerPicks) console.log(`    ✅ ${p.user.nickname}`);
  } else {
    console.log(
      "\n  ⚠️  No --top-scorer provided; cannot determine correct artilheiro picks."
    );
  }

  // ---------------------------------------------------------------------------
  // 4. RANKING — current (stored) vs corrected (with prediction bonuses)
  // ---------------------------------------------------------------------------
  const users = await prisma.user.findMany({
    where: { status: "APPROVED", role: { not: "ADMIN" } },
    include: {
      bets: {
        where: { points: { not: null }, match: { phase: { not: "FRIENDLY" }, homeScore: { not: null } } },
      },
      predictions: true,
    },
  });

  const correctChampionIds = new Set(correctChampionPicks.map((p) => p.userId));
  const correctScorerIds = new Set(correctScorerPicks.map((p) => p.userId));

  type Row = {
    nickname: string;
    storedBet: number;
    storedPred: number;
    storedTotal: number;
    champBonus: number;
    scorerBonus: number;
    correctedTotal: number;
  };

  const rows: Row[] = users.map((u) => {
    const storedBet = u.bets.reduce((s, b) => s + (b.points ?? 0), 0);
    const storedPred = u.predictions.reduce((s, p) => s + (p.points ?? 0), 0);
    const champBonus = correctChampionIds.has(u.id) ? PREDICTION_POINTS : 0;
    const scorerBonus = correctScorerIds.has(u.id) ? PREDICTION_POINTS : 0;
    return {
      nickname: u.nickname,
      storedBet,
      storedPred,
      storedTotal: storedBet + storedPred,
      champBonus,
      scorerBonus,
      correctedTotal: storedBet + champBonus + scorerBonus,
    };
  });

  const currentSorted = [...rows].sort((a, b) => b.storedTotal - a.storedTotal);
  const correctedSorted = [...rows].sort((a, b) => b.correctedTotal - a.correctedTotal);

  console.log("\n[4] RANKING IMPACT");
  console.log("-".repeat(72));
  console.log("  Current stored ranking (top 10):");
  console.log("    #  Player                 Bet   Pred  Total");
  currentSorted.slice(0, 10).forEach((r, i) => {
    console.log(
      `   ${String(i + 1).padStart(2)}  ${r.nickname.padEnd(20).slice(0, 20)} ${fmt(r.storedBet).padStart(6)} ${fmt(r.storedPred).padStart(5)} ${fmt(r.storedTotal).padStart(6)}`
    );
  });

  console.log("\n  Corrected ranking with prediction bonuses (top 10):");
  console.log("    #  Player                 Bet  +Champ +Scorer  Total   Δpos");
  const currentPosById = new Map(currentSorted.map((r, i) => [r.nickname, i + 1]));
  correctedSorted.slice(0, 10).forEach((r, i) => {
    const prevPos = currentPosById.get(r.nickname) ?? 0;
    const delta = prevPos - (i + 1);
    const deltaStr = delta === 0 ? "—" : delta > 0 ? `+${delta}` : String(delta);
    console.log(
      `   ${String(i + 1).padStart(2)}  ${r.nickname.padEnd(20).slice(0, 20)} ${fmt(r.storedBet).padStart(5)} ${fmt(r.champBonus).padStart(6)} ${fmt(r.scorerBonus).padStart(7)} ${fmt(r.correctedTotal).padStart(6)}  ${deltaStr}`
    );
  });

  const playersGainingChampion = rows.filter((r) => r.champBonus > 0).length;
  const playersGainingScorer = rows.filter((r) => r.scorerBonus > 0).length;

  console.log("\n  Summary:");
  console.log(`    Players who'd gain +champion:   ${playersGainingChampion}`);
  console.log(`    Players who'd gain +top scorer: ${topScorerActual ? playersGainingScorer : "N/A (no --top-scorer)"}`);

  console.log("\n" + "=".repeat(72));
  console.log("  AUDIT COMPLETE (no data was modified)");
  console.log("=".repeat(72));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
import "dotenv/config";
import { fetchFinishedMatches } from "../lib/football-api";

async function main() {
  console.log("🔑 API Key:", process.env.FOOTBALL_DATA_API_KEY ? "✅ configured" : "❌ missing");
  console.log("📡 Fetching World Cup 2026 finished matches...\n");

  const results = await fetchFinishedMatches();

  if (results.length === 0) {
    console.log("No finished matches yet (tournament hasn't started or no results available).");
    console.log("✅ API connection works! The key is valid.");
  } else {
    console.log(`Found ${results.length} finished match(es):\n`);
    for (const r of results) {
      console.log(`  ${r.homeTeam} ${r.homeScore} x ${r.awayScore} ${r.awayTeam} (${r.phase})`);
    }
  }
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  if (e.cause) console.error("   Cause:", e.cause.message || e.cause);
  process.exit(1);
});

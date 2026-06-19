import {
  calculateTournamentStats,
  calculatePoolStats,
  computeStreaks,
  type FinishedMatch,
  type BetRecord,
} from "../lib/stats";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

// Confederation W/D/L tallying
(() => {
  const matches: FinishedMatch[] = [
    {
      id: "1",
      homeTeam: "Brasil",
      awayTeam: "Alemanha",
      homeFlag: "br",
      awayFlag: "de",
      homeScore: 2,
      awayScore: 1,
      phase: "GROUP",
    },
    {
      id: "2",
      homeTeam: "México",
      awayTeam: "Japão",
      homeFlag: "mx",
      awayFlag: "jp",
      homeScore: 1,
      awayScore: 1,
      phase: "GROUP",
    },
  ];

  const stats = calculateTournamentStats(matches);
  const conmebol = stats.confederations.find((c) => c.confederation === "CONMEBOL");
  const uefa = stats.confederations.find((c) => c.confederation === "UEFA");

  assert(conmebol?.wins === 1 && conmebol.losses === 0, "CONMEBOL win counted");
  assert(uefa?.losses === 1 && uefa.wins === 0, "UEFA loss counted");
  assert(stats.summary.finishedMatches === 2, "2 finished matches");
  assert(stats.summary.totalGoals === 5, "5 total goals");
  assert(stats.summary.drawPercentage === 50, "50% draws");
})();

// Score frequency + Outros bucketing
(() => {
  const matches: FinishedMatch[] = [
    ...Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      homeTeam: "A",
      awayTeam: "B",
      homeFlag: "br",
      awayFlag: "de",
      homeScore: 1,
      awayScore: 1,
      phase: "GROUP" as const,
    })),
    ...Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 5),
      homeTeam: "A",
      awayTeam: "B",
      homeFlag: "br",
      awayFlag: "de",
      homeScore: i,
      awayScore: 0,
      phase: "GROUP" as const,
    })),
  ];

  const stats = calculateTournamentStats(matches);
  assert(stats.scoreFrequency[0].label === "1 × 1", "Most frequent score is 1×1");
  assert(stats.scoreFrequency[0].value === 5, "1×1 appears 5 times");
  const outros = stats.scoreFrequency.find((s) => s.isOther);
  assert(outros !== undefined && outros.value === 2, "Outros bucket has remaining scores");
})();

// Pool accuracy
(() => {
  const bets: BetRecord[] = [
    {
      userId: "u1",
      nickname: "João",
      homeScore: 1,
      awayScore: 0,
      points: 5,
      rawPoints: 5,
      createdAt: new Date("2026-06-12"),
      match: {
        id: "m1",
        homeTeam: "Brasil",
        awayTeam: "França",
        phase: "GROUP",
        homeScore: 1,
        awayScore: 0,
      },
    },
    {
      userId: "u2",
      nickname: "Maria",
      homeScore: 0,
      awayScore: 0,
      points: 0,
      rawPoints: 0,
      createdAt: new Date("2026-06-12"),
      match: {
        id: "m1",
        homeTeam: "Brasil",
        awayTeam: "França",
        phase: "GROUP",
        homeScore: 1,
        awayScore: 0,
      },
    },
  ];

  const stats = calculatePoolStats(bets, "u1");
  assert(stats.poolAccuracy === 50, "Pool accuracy 50%");
  assert(stats.myStats?.totalPoints === 5, "My total points");
  assert(stats.myStats?.accuracy === 100, "My accuracy 100%");
})();

// Streak computation
(() => {
  const streaks = computeStreaks([
    { userId: "u1", nickname: "João", points: 5, createdAt: new Date("2026-06-10") },
    { userId: "u1", nickname: "João", points: 7, createdAt: new Date("2026-06-11") },
    { userId: "u1", nickname: "João", points: 0, createdAt: new Date("2026-06-12") },
    { userId: "u1", nickname: "João", points: 2, createdAt: new Date("2026-06-13") },
  ]);
  assert(streaks[0].value === 2, "Max streak is 2");
})();

// Edge cases: 0 finished matches
(() => {
  const stats = calculateTournamentStats([]);
  assert(stats.summary.finishedMatches === 0, "Zero finished matches");
  assert(stats.scoreFrequency.length === 0, "No score frequency");
  assert(stats.confederations.length === 0, "No confederation data");
})();

// All draws
(() => {
  const matches: FinishedMatch[] = [
    {
      id: "1",
      homeTeam: "A",
      awayTeam: "B",
      homeFlag: "br",
      awayFlag: "de",
      homeScore: 0,
      awayScore: 0,
      phase: "GROUP",
    },
    {
      id: "2",
      homeTeam: "C",
      awayTeam: "D",
      homeFlag: "mx",
      awayFlag: "jp",
      homeScore: 1,
      awayScore: 1,
      phase: "GROUP",
    },
  ];
  const stats = calculateTournamentStats(matches);
  assert(stats.summary.drawPercentage === 100, "100% draws");
  assert(stats.homeAway.draws === 2, "2 draws in home/away breakdown");
})();

// Group standings
(() => {
  const matches: FinishedMatch[] = [
    {
      id: "1",
      homeTeam: "Brasil",
      awayTeam: "Marrocos",
      homeFlag: "br",
      awayFlag: "ma",
      homeScore: 2,
      awayScore: 0,
      phase: "GROUP",
      group: "C",
    },
    {
      id: "2",
      homeTeam: "Brasil",
      awayTeam: "Haiti",
      homeFlag: "br",
      awayFlag: "ht",
      homeScore: 3,
      awayScore: 1,
      phase: "GROUP",
      group: "C",
    },
    {
      id: "3",
      homeTeam: "Marrocos",
      awayTeam: "Haiti",
      homeFlag: "ma",
      awayFlag: "ht",
      homeScore: 1,
      awayScore: 1,
      phase: "GROUP",
      group: "C",
    },
  ];

  const stats = calculateTournamentStats(matches);
  const groupC = stats.groupStandings.find((g) => g.group === "C");
  assert(groupC !== undefined, "Group C standings exist");
  assert(groupC!.teams[0].team === "Brasil" && groupC!.teams[0].points === 6, "Brazil leads group C");
  assert(stats.topScorers[0].team === "Brasil" && stats.topScorers[0].goalsFor === 5, "Brazil top scorer");
})();

// Points distribution
(() => {
  const bets: BetRecord[] = [
    {
      userId: "u1",
      nickname: "João",
      homeScore: 2,
      awayScore: 1,
      points: 10,
      rawPoints: 10,
      createdAt: new Date("2026-06-12"),
      match: { id: "m1", homeTeam: "A", awayTeam: "B", phase: "GROUP", homeScore: 2, awayScore: 1 },
    },
    {
      userId: "u2",
      nickname: "Maria",
      homeScore: 0,
      awayScore: 0,
      points: 0,
      rawPoints: 0,
      createdAt: new Date("2026-06-12"),
      match: { id: "m1", homeTeam: "A", awayTeam: "B", phase: "GROUP", homeScore: 2, awayScore: 1 },
    },
  ];

  const stats = calculatePoolStats(bets);
  assert(stats.pointsDistribution.length === 2, "Two point buckets");
  assert(stats.scenarioDistribution.some((s) => s.label.includes("exato")), "Scenario labels present");
  assert(stats.betVsReality?.outcomeBias !== undefined, "Outcome bias calculated");
})();

console.log("\n🎉 All stats tests passed!");

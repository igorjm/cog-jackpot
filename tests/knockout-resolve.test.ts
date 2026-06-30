import { enrichKnockoutTeams, type MatchForResolve } from "../lib/knockout-resolve";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

function finishedGroupMatch(
  partial: Partial<MatchForResolve> & Pick<MatchForResolve, "matchNumber" | "group" | "homeTeam" | "awayTeam" | "homeFlag" | "awayFlag" | "homeScore" | "awayScore">
): MatchForResolve {
  return {
    id: `m-${partial.matchNumber}`,
    phase: "GROUP",
    homeScore: partial.homeScore,
    awayScore: partial.awayScore,
    ...partial,
  } as MatchForResolve;
}

// Group A complete — Mexico 1st, South Africa 2nd (simplified results)
const groupAMatches: MatchForResolve[] = [
  finishedGroupMatch({ matchNumber: 1, group: "A", homeTeam: "México", awayTeam: "África do Sul", homeFlag: "mx", awayFlag: "za", homeScore: 2, awayScore: 0 }),
  finishedGroupMatch({ matchNumber: 2, group: "A", homeTeam: "Coreia do Sul", awayTeam: "República Tcheca", homeFlag: "kr", awayFlag: "cz", homeScore: 1, awayScore: 1 }),
  finishedGroupMatch({ matchNumber: 25, group: "A", homeTeam: "República Tcheca", awayTeam: "África do Sul", homeFlag: "cz", awayFlag: "za", homeScore: 0, awayScore: 1 }),
  finishedGroupMatch({ matchNumber: 28, group: "A", homeTeam: "México", awayTeam: "Coreia do Sul", homeFlag: "mx", awayFlag: "kr", homeScore: 3, awayScore: 0 }),
  finishedGroupMatch({ matchNumber: 53, group: "A", homeTeam: "República Tcheca", awayTeam: "México", homeFlag: "cz", awayFlag: "mx", homeScore: 0, awayScore: 2 }),
  finishedGroupMatch({ matchNumber: 54, group: "A", homeTeam: "África do Sul", awayTeam: "Coreia do Sul", homeFlag: "za", awayFlag: "kr", homeScore: 1, awayScore: 1 }),
];

const knockoutR32: MatchForResolve = {
  id: "k79",
  matchNumber: 79,
  homeTeam: "1º Grupo A",
  awayTeam: "3º CEFHI",
  homeFlag: "xx",
  awayFlag: "xx",
  homeScore: null,
  awayScore: null,
  phase: "ROUND_OF_32",
  group: null,
};

(() => {
  const enriched = enrichKnockoutTeams([...groupAMatches, knockoutR32]);
  const r32 = enriched.find((m) => m.matchNumber === 79)!;
  assert(r32.homeFlag === "mx", "1º Grupo A resolves to Mexico flag when group A is complete");
  assert(r32.homeTeam === "México", "1º Grupo A resolves to Mexico name");
  assert(r32.awayFlag === "xx", "3rd place slot stays TBD when no group thirds are available yet");
})();

(() => {
  const finishedR32: MatchForResolve = {
    id: "k74",
    matchNumber: 74,
    homeTeam: "Alemanha",
    awayTeam: "Equador",
    homeFlag: "de",
    awayFlag: "ec",
    homeScore: 2,
    awayScore: 1,
    phase: "ROUND_OF_32",
    group: null,
  };

  const r16: MatchForResolve = {
    id: "k89",
    matchNumber: 89,
    homeTeam: "Venc. Jogo 74",
    awayTeam: "Venc. Jogo 77",
    homeFlag: "xx",
    awayFlag: "xx",
    homeScore: null,
    awayScore: null,
    phase: "ROUND_OF_16",
    group: null,
  };

  const enriched = enrichKnockoutTeams([finishedR32, r16]);
  const resolved = enriched.find((m) => m.matchNumber === 89)!;
  assert(resolved.homeFlag === "de", "Winner of match 74 propagates to R16");
  assert(resolved.homeTeam === "Alemanha", "Winner shows resolved team name");
})();

(() => {
  const drawnR32: MatchForResolve = {
    id: "k74",
    matchNumber: 74,
    homeTeam: "Alemanha",
    awayTeam: "Paraguai",
    homeFlag: "de",
    awayFlag: "py",
    homeScore: 1,
    awayScore: 1,
    winnerSide: "away",
    phase: "ROUND_OF_32",
    group: null,
  };

  const r16: MatchForResolve = {
    id: "k89",
    matchNumber: 89,
    homeTeam: "Venc. Jogo 74",
    awayTeam: "Venc. Jogo 77",
    homeFlag: "xx",
    awayFlag: "xx",
    homeScore: null,
    awayScore: null,
    phase: "ROUND_OF_16",
    group: null,
  };

  const enriched = enrichKnockoutTeams([drawnR32, r16]);
  const resolved = enriched.find((m) => m.matchNumber === 89)!;
  assert(resolved.homeFlag === "py", "Penalty winner (away) propagates on draw");
  assert(resolved.homeTeam === "Paraguai", "Paraguay advances after 1-1");
})();

console.log("\nAll knockout-resolve tests passed!");

// FIFA Annex C lookup for confirmed 2026 group-stage third-place combination
(() => {
  const { lookupThirdPlaceMapping } = require("../lib/third-place-annex-c") as typeof import("../lib/third-place-annex-c");
  const map = lookupThirdPlaceMapping(["B", "D", "E", "F", "I", "J", "K", "L"]);
  assert(map?.get("E") === "D", "Annex C: Germany (1E) faces Paraguay (3D)");
  assert(map?.get("I") === "F", "Annex C: France (1I) faces Sweden (3F)");
  assert(map?.get("L") === "K", "Annex C: England (1L) faces DR Congo (3K)");
  assert(map?.get("G") === "I", "Annex C: Belgium (1G) faces Senegal (3I)");
  assert(map?.get("B") === "J", "Annex C: Switzerland (1B) faces Algeria (3J)");
})();

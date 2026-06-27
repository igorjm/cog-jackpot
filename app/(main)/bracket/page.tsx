import { prisma } from "@/lib/prisma";
import { enrichKnockoutTeams } from "@/lib/knockout-resolve";
import { KNOCKOUT_MATCH_NUMBER_MIN } from "@/lib/bracket-tree";
import { KnockoutBracket } from "@/components/bracket/knockout-bracket";
import Link from "next/link";

const matchSelect = {
  id: true,
  matchNumber: true,
  homeTeam: true,
  awayTeam: true,
  homeFlag: true,
  awayFlag: true,
  homeScore: true,
  awayScore: true,
  phase: true,
  group: true,
} as const;

export default async function BracketPage() {
  // Need ALL matches (including group stage) so placeholders resolve correctly.
  const allMatches = await prisma.match.findMany({
    orderBy: { matchNumber: "asc" },
    select: matchSelect,
  });

  const matches = enrichKnockoutTeams(allMatches)
    .filter((m) => m.matchNumber >= KNOCKOUT_MATCH_NUMBER_MIN)
    .map((m) => ({
      id: m.id,
      matchNumber: m.matchNumber,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeFlag: m.homeFlag,
      awayFlag: m.awayFlag,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
    }));

  return (
    <div className="space-y-4 -mx-2 md:-mx-4 max-w-none">
      <div className="flex items-center justify-between px-2 md:px-4">
        <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
          Chave do Mata-Mata
        </h1>
        <Link
          href="/matches?phase=ROUND_OF_32"
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#38BDF8]/30 text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-all"
        >
          Ver jogos →
        </Link>
      </div>

      <KnockoutBracket matches={matches} />
    </div>
  );
}

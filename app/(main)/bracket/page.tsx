import { getCachedBracketMatches } from "@/lib/cached-data";
import { KnockoutBracket } from "@/components/bracket/knockout-bracket";
import Link from "next/link";

export default async function BracketPage() {
  const matches = await getCachedBracketMatches();

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

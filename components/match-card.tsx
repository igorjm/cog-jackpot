import { CountdownTimer } from "./countdown-timer";
import { Badge } from "./ui/badge";
import { isBeforeDeadline } from "@/lib/deadline";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MatchCardProps {
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeFlag: string;
    awayFlag: string;
    matchDate: Date;
    venue?: string | null;
    homeScore?: number | null;
    awayScore?: number | null;
    multiplier: number;
  };
  userBet?: {
    homeScore: number;
    awayScore: number;
    points?: number | null;
    rawPoints?: number | null;
  } | null;
  showBetLink?: boolean;
}

export function MatchCard({ match, userBet, showBetLink = true }: MatchCardProps) {
  const isFinished = match.homeScore !== null && match.awayScore !== null;
  const isOpen = isBeforeDeadline(match.matchDate);
  const isExactScore = userBet?.rawPoints === 10;
  const hasGoodScore = userBet?.rawPoints && userBet.rawPoints >= 5;

  const dateStr = new Date(match.matchDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "card-match p-4",
        isExactScore && "card-match-exact",
        hasGoodScore && !isExactScore && "border-[#FACC15]/35"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-xs leading-snug text-[#A8C3E8]">
          {dateStr}
          {match.venue && (
            <>
              <span className="text-[#5A7A9A]"> • </span>
              <span className="text-[#94B8D8]">{match.venue}</span>
            </>
          )}
        </p>
        {match.multiplier > 1 && (
          <Badge variant="warning">{match.multiplier}×</Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-sm font-semibold text-white">
            {match.homeTeam}
          </p>
          <p className="mt-0.5 text-xl leading-none">
            {getFlagEmoji(match.homeFlag)}
          </p>
        </div>

        <div className="shrink-0 px-2 text-center">
          {isFinished ? (
            <div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-2xl font-bold tabular-nums text-white">
                  {match.homeScore}
                </span>
                <span className="font-bold text-[#FACC15]">×</span>
                <span className="font-mono text-2xl font-bold tabular-nums text-white">
                  {match.awayScore}
                </span>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wide text-[#A8C3E8]">
                Final
              </span>
            </div>
          ) : (
            <span className="page-title text-lg text-[#FACC15]">VS</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {match.awayTeam}
          </p>
          <p className="mt-0.5 text-xl leading-none">
            {getFlagEmoji(match.awayFlag)}
          </p>
        </div>
      </div>

      <div className="mt-3 border-t border-white/10 pt-3">
        {isFinished && userBet ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#A8C3E8]">
              Seu palpite: {userBet.homeScore} × {userBet.awayScore}
            </span>
            <Badge variant={userBet.points && userBet.points > 0 ? "points" : "error"}>
              +{userBet.points ?? 0} pts
            </Badge>
          </div>
        ) : isFinished && !userBet ? (
          <div className="flex items-center justify-between">
            <Badge variant="error">Não palpitou</Badge>
            <span className="text-xs text-[#A8C3E8]">0 pts</span>
          </div>
        ) : isOpen ? (
          <div className="flex items-center justify-between gap-2">
            <CountdownTimer matchDate={new Date(match.matchDate)} />
            {showBetLink && (
              <Link
                href={`/matches/${match.id}`}
                className="shrink-0 rounded-lg bg-[#22C55E] px-3 py-1.5 text-xs font-semibold text-[#020810] shadow-md shadow-[#22C55E]/30 transition-all hover:bg-[#34D65C] hover:shadow-[#22C55E]/40 active:scale-[0.97]"
              >
                {userBet ? "Editar →" : "Palpitar →"}
              </Link>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A8C3E8]">
              🔒 Palpite encerrado
            </span>
            {userBet && (
              <span className="text-xs text-[#A8C3E8]">
                {userBet.homeScore} × {userBet.awayScore}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

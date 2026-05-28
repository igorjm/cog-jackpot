import { CountdownTimer } from "./countdown-timer";
import { Badge } from "./ui/badge";
import { Flag } from "./ui/flag";
import { isBeforeDeadline } from "@/lib/deadline";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getKnockoutHint } from "@/lib/knockout-hints";

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
  const isTbd = match.homeFlag === "xx";
  const homeHint = isTbd ? getKnockoutHint(match.homeTeam) : null;
  const awayHint = isTbd ? getKnockoutHint(match.awayTeam) : null;

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
        <div className="flex-1 text-right">
          <p className="text-sm font-medium leading-tight line-clamp-2">{match.homeTeam}</p>
          {homeHint && (
            <p className="text-[10px] text-[#5A7A9A] leading-tight mt-0.5 line-clamp-2">{homeHint}</p>
          )}
          {match.homeFlag !== "xx" ? (
            <img
              src={`https://flagcdn.com/w40/${match.homeFlag.toLowerCase()}.png`}
              srcSet={`https://flagcdn.com/w80/${match.homeFlag.toLowerCase()}.png 2x`}
              width={32}
              height={24}
              alt={match.homeTeam}
              className="inline-block rounded-sm mt-1"
            />
          ) : (
            <span className="inline-block w-8 h-6 rounded-sm bg-[#1A3058] border border-[#1E3A6E] mt-1 text-center text-[10px] leading-6 text-[#5A7A9A]">?</span>
          )}
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

        <div className="flex-1">
          <p className="text-sm font-medium leading-tight line-clamp-2">{match.awayTeam}</p>
          {awayHint && (
            <p className="text-[10px] text-[#5A7A9A] leading-tight mt-0.5 line-clamp-2">{awayHint}</p>
          )}
          {match.awayFlag !== "xx" ? (
            <img
              src={`https://flagcdn.com/w40/${match.awayFlag.toLowerCase()}.png`}
              srcSet={`https://flagcdn.com/w80/${match.awayFlag.toLowerCase()}.png 2x`}
              width={32}
              height={24}
              alt={match.awayTeam}
              className="inline-block rounded-sm mt-1"
            />
          ) : (
            <span className="inline-block w-8 h-6 rounded-sm bg-[#1A3058] border border-[#1E3A6E] mt-1 text-center text-[10px] leading-6 text-[#5A7A9A]">?</span>
          )}
        </div>
      </div>

      <div className="mt-3 border-t border-white/10 pt-3">
        {isFinished && userBet ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#A8C3E8]">
              Seu palpite: {userBet.homeScore} × {userBet.awayScore}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={userBet.points && userBet.points > 0 ? "points" : "error"}>
                +{userBet.points ?? 0} pts
              </Badge>
              <span className="text-xs text-[#38BDF8]">Ver →</span>
            </div>
          </div>
        ) : isFinished && !userBet ? (
          <div className="flex items-center justify-between">
            <Badge variant="error">Não palpitou</Badge>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94B8D8]">0 pts</span>
              <span className="text-xs text-[#38BDF8]">Ver →</span>
            </div>
          </div>
        ) : isOpen ? (
          <div className="space-y-2">
            {userBet && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94B8D8]">
                  Seu palpite: <span className="font-mono font-bold text-white">{userBet.homeScore} × {userBet.awayScore}</span>
                </span>
                <Badge variant="success">✓</Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <CountdownTimer matchDate={new Date(match.matchDate)} />
              {showBetLink && (
                <a
                  href={`/matches/${match.id}`}
                  className="text-xs font-medium text-[#22C55E] hover:text-[#22C55E]/80 transition-colors"
                >
                  {userBet ? "Editar →" : "Palpitar →"}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94B8D8]">🔒 Palpite encerrado</span>
            <div className="flex items-center gap-2">
              {userBet && (
                <span className="text-xs text-[#94B8D8]">
                  {userBet.homeScore} × {userBet.awayScore}
                </span>
              )}
              <span className="text-xs text-[#38BDF8]">Ver palpites →</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



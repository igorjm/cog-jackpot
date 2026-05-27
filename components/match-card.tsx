import { CountdownTimer } from "./countdown-timer";
import { Badge } from "./ui/badge";
import { isBeforeDeadline } from "@/lib/deadline";

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

  return (
    <div
      className={`bg-[#122448] rounded-2xl border p-4 transition-all ${
        isExactScore
          ? "border-[#FFD60A]/40 shadow-lg shadow-[#FFD60A]/10"
          : userBet && userBet.rawPoints && userBet.rawPoints >= 5
          ? "border-[#22C55E]/30"
          : "border-[#1E3A6E]"
      }`}
    >
      {/* Header: date + venue + multiplier */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-[#94B8D8]">
          {new Date(match.matchDate).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {match.venue && ` • ${match.venue}`}
        </div>
        {match.multiplier > 1 && (
          <Badge variant="warning">{match.multiplier}×</Badge>
        )}
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-right">
          <p className="text-sm font-medium truncate">{match.homeTeam}</p>
          <img
            src={`https://flagcdn.com/w40/${match.homeFlag.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w80/${match.homeFlag.toLowerCase()}.png 2x`}
            width={32}
            height={24}
            alt={match.homeTeam}
            className="inline-block rounded-sm"
          />
        </div>

        <div className="flex items-center gap-2 px-3">
          {isFinished ? (
            <div className="text-center">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-mono font-bold tabular-nums">
                  {match.homeScore}
                </span>
                <span className="text-[#FFD60A] font-bold">×</span>
                <span className="text-2xl font-mono font-bold tabular-nums">
                  {match.awayScore}
                </span>
              </div>
              <span className="text-[10px] text-[#94B8D8] uppercase">Final</span>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-lg text-[#FFD60A] font-bold">vs</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium truncate">{match.awayTeam}</p>
          <img
            src={`https://flagcdn.com/w40/${match.awayFlag.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w80/${match.awayFlag.toLowerCase()}.png 2x`}
            width={32}
            height={24}
            alt={match.awayTeam}
            className="inline-block rounded-sm"
          />
        </div>
      </div>

      {/* Status / Bet info */}
      <div className="mt-3 pt-3 border-t border-[#1E3A6E]">
        {isFinished && userBet ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94B8D8]">
              Seu palpite: {userBet.homeScore} × {userBet.awayScore}
            </span>
            <Badge variant={userBet.points && userBet.points > 0 ? "points" : "error"}>
              +{userBet.points ?? 0} pts
            </Badge>
          </div>
        ) : isFinished && !userBet ? (
          <div className="flex items-center justify-between">
            <Badge variant="error">Não palpitou</Badge>
            <span className="text-xs text-[#94B8D8]">0 pts</span>
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
            {userBet && (
              <span className="text-xs text-[#94B8D8]">
                {userBet.homeScore} × {userBet.awayScore}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



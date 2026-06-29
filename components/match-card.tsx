import Image from "next/image";
import { CountdownTimer } from "./countdown-timer";
import { Badge } from "./ui/badge";
import { LiveMatchScore } from "./live-match-score";
import { isBeforeDeadline } from "@/lib/deadline";
import { getDisplayScore, isMatchLiveNow } from "@/lib/match-live";
import type { MatchStatus } from "@prisma/client";
import { getKnockoutHint } from "@/lib/knockout-hints";
import { getFlagSrc, isClubFlag, formatPoints } from "@/lib/utils";

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
    liveHomeScore?: number | null;
    liveAwayScore?: number | null;
    matchStatus?: MatchStatus;
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
  const matchDate = new Date(match.matchDate);
  const scoreFields = {
    homeScore: match.homeScore ?? null,
    awayScore: match.awayScore ?? null,
    liveHomeScore: match.liveHomeScore ?? null,
    liveAwayScore: match.liveAwayScore ?? null,
    matchStatus: match.matchStatus ?? "SCHEDULED",
    matchDate,
  };
  const display = getDisplayScore(scoreFields);
  const isFinished = display.isFinished;
  const isOpen = isBeforeDeadline(matchDate);
  const isExactScore = userBet?.rawPoints === 10;
  const isTbdHome = match.homeFlag === "xx";
  const isTbdAway = match.awayFlag === "xx";
  const homeHint = isTbdHome ? getKnockoutHint(match.homeTeam) : null;
  const awayHint = isTbdAway ? getKnockoutHint(match.awayTeam) : null;
  const isLive = isMatchLiveNow(scoreFields);

  return (
    <div
      className={`bg-[#162D54] rounded-2xl border p-4 transition-all ${
        isLive
          ? "border-red-500/50 shadow-lg shadow-red-500/10"
          : isExactScore
          ? "border-[#FFD60A]/40 shadow-lg shadow-[#FFD60A]/10"
          : userBet && userBet.rawPoints && userBet.rawPoints >= 5
          ? "border-[#22C55E]/30"
          : "border-[#2A4A7A]"
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
            timeZone: "America/Sao_Paulo",
          })}
          {match.venue && ` • ${match.venue}`}
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full animate-pulse">
              🔴 AO VIVO
            </span>
          )}
          {match.multiplier > 1 && (
            <Badge variant="warning">{match.multiplier}×</Badge>
          )}
        </div>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-right">
          <p className="text-sm font-medium leading-tight line-clamp-2">{match.homeTeam}</p>
          {homeHint && (
            <p className="text-[10px] text-[#5A7A9A] leading-tight mt-0.5 line-clamp-2">{homeHint}</p>
          )}
          {match.homeFlag !== "xx" ? (
            <Image
              src={getFlagSrc(match.homeFlag)}
              width={isClubFlag(match.homeFlag) ? 24 : 32}
              height={24}
              alt={match.homeTeam}
              className={`inline-block mt-1 ${isClubFlag(match.homeFlag) ? "w-6 h-6 object-contain" : "rounded-sm"}`}
            />
          ) : (
            <span className="inline-block w-8 h-6 rounded-sm bg-[#1E3862] border border-[#2A4A7A] mt-1 text-center text-[10px] leading-6 text-[#5A7A9A]">?</span>
          )}
        </div>

        <div className="flex items-center gap-2 px-3">
          <LiveMatchScore
            matchId={match.id}
            initialHome={display.home}
            initialAway={display.away}
            initialIsLive={display.isLive}
            initialIsFinished={display.isFinished}
            pollEnabled={false}
            size="sm"
          />
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium leading-tight line-clamp-2">{match.awayTeam}</p>
          {awayHint && (
            <p className="text-[10px] text-[#5A7A9A] leading-tight mt-0.5 line-clamp-2">{awayHint}</p>
          )}
          {match.awayFlag !== "xx" ? (
            <Image
              src={getFlagSrc(match.awayFlag)}
              width={isClubFlag(match.awayFlag) ? 24 : 32}
              height={24}
              alt={match.awayTeam}
              className={`inline-block mt-1 ${isClubFlag(match.awayFlag) ? "w-6 h-6 object-contain" : "rounded-sm"}`}
            />
          ) : (
            <span className="inline-block w-8 h-6 rounded-sm bg-[#1E3862] border border-[#2A4A7A] mt-1 text-center text-[10px] leading-6 text-[#5A7A9A]">?</span>
          )}
        </div>
      </div>

      {/* Status / Bet info */}
      <div className="mt-3 pt-3 border-t border-[#2A4A7A]">
        {isFinished && userBet ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94B8D8]">
              Seu palpite: {userBet.homeScore} × {userBet.awayScore}
            </span>
            <div className="flex items-center gap-2">
              <Badge
                variant={userBet.points && userBet.points > 0 ? "points" : "error"}
                className="shrink-0 whitespace-nowrap tabular-nums"
              >
                +{formatPoints(userBet.points ?? 0)} pts
              </Badge>
              <span className="text-xs font-medium text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-1 rounded-full border border-[#38BDF8]/20">Ver →</span>
            </div>
          </div>
        ) : isFinished && !userBet ? (
          <div className="flex items-center justify-between">
            <Badge variant="error">Não palpitou</Badge>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94B8D8]">0 pts</span>
              <span className="text-xs font-medium text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-1 rounded-full border border-[#38BDF8]/20">Ver →</span>
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
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer ${
                    userBet
                      ? "border border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/10"
                      : "bg-[#22C55E] text-black hover:bg-[#34D65C] shadow-sm shadow-[#22C55E]/20"
                  }`}
                >
                  {userBet ? "Editar" : "Palpitar"}
                </a>
              )}
            </div>
          </div>
        ) : isLive ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-400 font-medium">🔴 Ao vivo agora</span>
            <div className="flex items-center gap-2">
              {userBet && (
                <span className="text-xs text-[#94B8D8]">
                  {userBet.homeScore} × {userBet.awayScore}
                </span>
              )}
              <span className="text-xs font-medium text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-1 rounded-full border border-[#38BDF8]/20">
                Acompanhar →
              </span>
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
              <span className="text-xs font-medium text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-1 rounded-full border border-[#38BDF8]/20">Ver palpites →</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



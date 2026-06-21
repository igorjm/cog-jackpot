import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BetForm } from "@/components/bet-form";
import { getFlagSrc, isClubFlag } from "@/lib/utils";
import { CountdownTimer } from "@/components/countdown-timer";
import { Badge } from "@/components/ui/badge";
import { isBeforeDeadline } from "@/lib/deadline";
import { PHASE_LABELS } from "@/lib/constants";

export default async function MatchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const session = await auth();
  const userId = session!.user!.id;

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) notFound();

  const userBet = await prisma.bet.findUnique({
    where: { userId_matchId: { userId, matchId: id } },
  });

  const isOpen = isBeforeDeadline(match.matchDate);
  const isFinished = match.homeScore !== null && match.awayScore !== null;
  const returnTo =
    from === "my-bets"
      ? "/my-bets"
      : `/matches?phase=${match.phase}${match.group ? `&group=${match.group}` : ""}`;

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Back link */}
      <a
        href={returnTo}
        className="text-sm text-[#94B8D8] hover:text-white cursor-pointer"
      >
        ← Voltar
      </a>

      {/* Match info card */}
      <div className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-6 space-y-4">
        {/* Phase + Date */}
        <div className="flex items-center justify-between">
          <Badge variant="info">{PHASE_LABELS[match.phase]}</Badge>
          {match.multiplier > 1 && (
            <Badge variant="warning">{match.multiplier}×</Badge>
          )}
        </div>

        <div className="text-center text-xs text-[#94B8D8]">
          {new Date(match.matchDate).toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo",
          })}
          {match.venue && ` • ${match.venue}`}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="text-center space-y-1">
            {match.homeFlag !== "xx" ? (
              <Image
                src={getFlagSrc(match.homeFlag, 160)}
                width={isClubFlag(match.homeFlag) ? 48 : 64}
                height={48}
                alt={match.homeTeam}
                className={`inline-block ${isClubFlag(match.homeFlag) ? "w-12 h-12 object-contain" : "rounded-sm"}`}
              />
            ) : (
              <span className="inline-block w-16 h-12 rounded-sm bg-[#1E3862] border border-[#2A4A7A] text-center text-lg leading-[48px] text-[#5A7A9A]">?</span>
            )}
            <p className="text-sm font-medium">{match.homeTeam}</p>
          </div>

          {isFinished ? (
            <div className="text-center">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-mono font-bold">{match.homeScore}</span>
                <span className="text-xl text-[#FFD60A]">×</span>
                <span className="text-3xl font-mono font-bold">{match.awayScore}</span>
              </div>
              <span className="text-xs text-[#94B8D8]">Final</span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-[#FFD60A]">×</span>
          )}

          <div className="text-center space-y-1">
            {match.awayFlag !== "xx" ? (
              <Image
                src={getFlagSrc(match.awayFlag, 160)}
                width={isClubFlag(match.awayFlag) ? 48 : 64}
                height={48}
                alt={match.awayTeam}
                className={`inline-block ${isClubFlag(match.awayFlag) ? "w-12 h-12 object-contain" : "rounded-sm"}`}
              />
            ) : (
              <span className="inline-block w-16 h-12 rounded-sm bg-[#1E3862] border border-[#2A4A7A] text-center text-lg leading-[48px] text-[#5A7A9A]">?</span>
            )}
            <p className="text-sm font-medium">{match.awayTeam}</p>
          </div>
        </div>

        {/* Countdown */}
        {!isFinished && (
          <div className="text-center">
            <CountdownTimer matchDate={match.matchDate} />
          </div>
        )}

        {/* Result info if finished */}
        {isFinished && userBet && (
          <div className="bg-[black] rounded-lg p-3 text-center">
            <p className="text-xs text-[#94B8D8] mb-1">Seu palpite</p>
            <p className="font-mono font-bold">
              {userBet.homeScore} × {userBet.awayScore}
            </p>
            <Badge
              variant={userBet.points && userBet.points > 0 ? "points" : "error"}
              className="mt-2"
            >
              +{userBet.points ?? 0} pontos
            </Badge>
          </div>
        )}
      </div>

      {/* Bet Form */}
      {!isFinished && (
        <div className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-6">
          <h2 className="text-sm font-bold uppercase text-[#94B8D8] tracking-wide mb-4 text-center">
            {isOpen ? "Seu Palpite" : "Palpite Encerrado"}
          </h2>
          <BetForm
            matchId={match.id}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeFlag={match.homeFlag}
            awayFlag={match.awayFlag}
            existingBet={
              userBet ? { homeScore: userBet.homeScore, awayScore: userBet.awayScore } : undefined
            }
            isLocked={!isOpen}
            phase={match.phase}
            group={match.group}
            returnTo={returnTo}
          />
        </div>
      )}
    </div>
  );
}



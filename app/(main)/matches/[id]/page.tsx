import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BetForm } from "@/components/bet-form";
import { MatchLivePanel } from "@/components/match-live-panel";
import { MatchBetsDrawerTrigger } from "@/components/match-bets-drawer-trigger";
import { CountdownTimer } from "@/components/countdown-timer";
import { Badge } from "@/components/ui/badge";
import { isBeforeDeadline } from "@/lib/deadline";
import { getDisplayScore, isMatchLiveNow } from "@/lib/match-live";
import { refreshLiveScoresIfDue, shouldRefreshLiveScoresOnDemand } from "@/lib/live-sync";
import { parseMatchGoals } from "@/lib/match-goals";
import { PHASE_LABELS } from "@/lib/constants";
import { enrichKnockoutTeams } from "@/lib/knockout-resolve";
import { formatPoints } from "@/lib/utils";

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

  let match = await prisma.match.findUnique({ where: { id } });
  if (!match) notFound();

  const scoreFieldsBeforeSync = {
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    liveHomeScore: match.liveHomeScore,
    liveAwayScore: match.liveAwayScore,
    matchStatus: match.matchStatus,
    matchDate: match.matchDate,
  };

  if (isMatchLiveNow(scoreFieldsBeforeSync) && shouldRefreshLiveScoresOnDemand()) {
    await refreshLiveScoresIfDue();
    match = await prisma.match.findUnique({ where: { id } });
    if (!match) notFound();
  }

  const allMatches = await prisma.match.findMany({ orderBy: { matchNumber: "asc" } });
  match = enrichKnockoutTeams(allMatches).find((m) => m.id === id)!;

  const userBet = await prisma.bet.findUnique({
    where: { userId_matchId: { userId, matchId: id } },
  });

  const isOpen = isBeforeDeadline(match.matchDate);
  const scoreFields = {
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    liveHomeScore: match.liveHomeScore,
    liveAwayScore: match.liveAwayScore,
    matchStatus: match.matchStatus,
    matchDate: match.matchDate,
  };
  const display = getDisplayScore(scoreFields);
  const isFinished = display.isFinished;
  const isLive = isMatchLiveNow(scoreFields);
  const goals = parseMatchGoals(match.liveGoals);
  const returnTo =
    from === "my-bets"
      ? "/my-bets"
      : `/matches?phase=${match.phase}${match.group ? `&group=${match.group}` : ""}`;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <a
        href={returnTo}
        className="text-sm text-[#94B8D8] hover:text-white cursor-pointer"
      >
        ← Voltar
      </a>

      <div
        className={`bg-[#162D54] rounded-2xl border p-6 space-y-5 ${
          isLive && !isFinished ? "border-red-500/40 shadow-lg shadow-red-500/10" : "border-[#2A4A7A]"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <Badge variant="info">{PHASE_LABELS[match.phase]}</Badge>
          <div className="flex items-center gap-2">
            {isLive && !isFinished && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                AO VIVO
              </span>
            )}
            {match.multiplier > 1 && <Badge variant="warning">{match.multiplier}×</Badge>}
          </div>
        </div>

        <div className="text-center text-xs text-[#94B8D8] leading-relaxed">
          {new Date(match.matchDate).toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo",
          })}
          {match.venue && (
            <>
              <br />
              <span className="text-[#5A7A9A]">{match.venue}</span>
            </>
          )}
        </div>

        <MatchLivePanel
          matchId={match.id}
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          homeFlag={match.homeFlag}
          awayFlag={match.awayFlag}
          initialHome={display.home}
          initialAway={display.away}
          initialIsLive={display.isLive}
          initialIsFinished={display.isFinished}
          initialHalfTimeHome={match.halfTimeHome}
          initialHalfTimeAway={match.halfTimeAway}
          initialGoals={goals}
          pollEnabled={isLive || display.isLive}
        />

        {!isFinished && !isLive && (
          <div className="text-center pt-1">
            <CountdownTimer matchDate={match.matchDate} />
          </div>
        )}

        {userBet && (isLive || isFinished || !isOpen) && (
          <div className="rounded-xl border border-[#2A4A7A] bg-[#0F2347]/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#94B8D8] mb-1">
                  Seu palpite
                </p>
                <p className="font-mono text-xl font-bold">
                  {userBet.homeScore} × {userBet.awayScore}
                </p>
              </div>
              {isFinished ? (
                <Badge variant={userBet.points && userBet.points > 0 ? "points" : "error"}>
                  +{formatPoints(userBet.points ?? 0)} pts
                </Badge>
              ) : isLive ? (
                <Badge variant="info">Em andamento</Badge>
              ) : (
                <Badge variant="error">Encerrado</Badge>
              )}
            </div>
          </div>
        )}

        {(isLive || (!isOpen && !isFinished)) && (
          <MatchBetsDrawerTrigger matchId={match.id} />
        )}
      </div>

      {!isFinished && isOpen && (
        <div className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-6">
          <h2 className="text-sm font-bold uppercase text-[#94B8D8] tracking-wide mb-4 text-center">
            Seu Palpite
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

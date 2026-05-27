import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BetForm } from "@/components/bet-form";
import { CountdownTimer } from "@/components/countdown-timer";
import { Badge } from "@/components/ui/badge";
import { isBeforeDeadline } from "@/lib/deadline";
import { PHASE_LABELS } from "@/lib/constants";
import Image from "next/image";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) notFound();

  const userBet = await prisma.bet.findUnique({
    where: { userId_matchId: { userId, matchId: id } },
  });

  const isOpen = isBeforeDeadline(match.matchDate);
  const isFinished = match.homeScore !== null && match.awayScore !== null;

  const homeFlag = getFlagEmoji(match.homeFlag);
  const awayFlag = getFlagEmoji(match.awayFlag);

  return (
    <div className="max-w-md mx-auto flex flex-col">
      {/* ── Match Info Card ── */}
      <div className="card-premium relative z-0 rounded-2xl px-5 pt-4 pb-10">
        {/* Fase + countdown na mesma linha */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge variant="info">{PHASE_LABELS[match.phase]}</Badge>
            {match.multiplier > 1 && (
              <Badge variant="warning">{match.multiplier}×</Badge>
            )}
          </div>
          {!isFinished && (
            <div className="shrink-0">
              <CountdownTimer matchDate={match.matchDate} />
            </div>
          )}
        </div>


        {/* Date */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#A8C3E8] mb-1">
          <span>
            {new Date(match.matchDate).toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Venue */}
        {match.venue && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#A8C3E8] mb-4">
            <span>{match.venue}</span>
          </div>
        )}

        {/* Teams */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-4xl leading-none">{homeFlag}</span>
            <span className="text-xs font-semibold text-center leading-tight max-w-[80px]">
              {match.homeTeam}
            </span>
          </div>

          <div className="flex-shrink-0 px-3">
            {isFinished ? (
              <div className="text-center">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-mono font-bold">{match.homeScore}</span>
                  <span className="text-xl font-bold text-[#FACC15]">×</span>
                  <span className="text-3xl font-mono font-bold">{match.awayScore}</span>
                </div>
                <span className="text-xs text-[#A8C3E8]">Final</span>
              </div>
            ) : (
              <span className="page-title text-2xl text-[#FACC15]">VS</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-4xl leading-none">{awayFlag}</span>
            <span className="text-xs font-semibold text-center leading-tight max-w-[80px]">
              {match.awayTeam}
            </span>
          </div>
        </div>

        

        {/* Result info if finished */}
        {isFinished && userBet && (
          <div className="rounded-xl border border-[#FACC15]/20 bg-[#020810]/80 p-3 text-center mt-3">
            <p className="mb-1 text-xs text-[#A8C3E8]">Seu palpite</p>
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

      {/* ── Derlis Hero (overlaps card above ~76px, sits below bet form) ── */}
      {!isFinished && (
        <div className="group relative z-10 -mt-[76px] w-full">
          {/* Flag overlays on crystal balls */}
          {/* Left ball — home team */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{ left: "24%", top: "66%", transform: "translate(-50%, -50%)" }}
          >
            <span className="text-5xl drop-shadow-lg leading-none">{homeFlag}</span>
          </div>

          {/* Right ball — away team */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{ left: "79%", top: "67%", transform: "translate(-50%, -50%)" }}
          >
            <span className="text-5xl drop-shadow-lg leading-none">{awayFlag}</span>
          </div>

          {/* Hover aura */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(ellipse 75% 60% at 50% 58%, rgb(255, 204, 0) 0%, rgba(250,160,21,0.15) 45%, transparent 75%)",
            }}
          />

          <Image
            src="/derlis-game.png"
            alt="Derlis"
            width={500}
            height={500}
            className="relative z-10 w-full object-cover"
            priority
          />

          {/* Bottom depth shadow */}
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, rgba(2,8,16,0.7) 60%, rgba(2,8,16,0.97) 100%)",
            }}
          />
        </div>
      )}

      {/* ── Bet Form ── */}
      {!isFinished && (
        <div className="card-premium relative z-20 rounded-2xl px-6 pt-5 pb-6 -mt-10">
          <h2 className="mb-5 text-center text-sm font-extrabold uppercase tracking-widest text-[#A8C3E8]">
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
          />
        </div>
      )}
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

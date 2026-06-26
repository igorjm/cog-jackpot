"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MatchStatus } from "@prisma/client";
import type { MatchGoal } from "@/lib/match-goals";
import { parseMatchGoals } from "@/lib/match-goals";
import { MatchGoalsList } from "@/components/match-goals-list";
import { getFlagSrc, isClubFlag } from "@/lib/utils";

interface MatchLivePanelProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  initialHome: number | null;
  initialAway: number | null;
  initialIsLive: boolean;
  initialIsFinished: boolean;
  initialHalfTimeHome: number | null;
  initialHalfTimeAway: number | null;
  initialGoals: MatchGoal[];
  pollEnabled?: boolean;
}

interface LivePayload {
  homeScore: number | null;
  awayScore: number | null;
  isLive: boolean;
  isFinished: boolean;
  matchStatus: MatchStatus;
  halfTimeHome: number | null;
  halfTimeAway: number | null;
  goals: MatchGoal[];
  pollRecommended: boolean;
}

const POLL_INTERVAL_MS = 30_000;

export function MatchLivePanel({
  matchId,
  homeTeam,
  awayTeam,
  homeFlag,
  awayFlag,
  initialHome,
  initialAway,
  initialIsLive,
  initialIsFinished,
  initialHalfTimeHome,
  initialHalfTimeAway,
  initialGoals,
  pollEnabled = true,
}: MatchLivePanelProps) {
  const [home, setHome] = useState(initialHome);
  const [away, setAway] = useState(initialAway);
  const [isLive, setIsLive] = useState(initialIsLive);
  const [isFinished, setIsFinished] = useState(initialIsFinished);
  const [halfTimeHome, setHalfTimeHome] = useState(initialHalfTimeHome);
  const [halfTimeAway, setHalfTimeAway] = useState(initialHalfTimeAway);
  const [goals, setGoals] = useState(initialGoals);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setHome(initialHome);
    setAway(initialAway);
    setIsLive(initialIsLive);
    setIsFinished(initialIsFinished);
    setHalfTimeHome(initialHalfTimeHome);
    setHalfTimeAway(initialHalfTimeAway);
    setGoals(initialGoals);
  }, [
    initialHome,
    initialAway,
    initialIsLive,
    initialIsFinished,
    initialHalfTimeHome,
    initialHalfTimeAway,
    initialGoals,
  ]);

  useEffect(() => {
    if (!pollEnabled || isFinished) return;

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/matches/${matchId}/live`);
        if (!res.ok || cancelled) return;

        const data: LivePayload = await res.json();
        if (cancelled) return;

        setHome((prev) => {
          if (prev !== data.homeScore && data.homeScore !== null) {
            setPulse(true);
            setTimeout(() => setPulse(false), 600);
          }
          return data.homeScore;
        });
        setAway((prev) => {
          if (prev !== data.awayScore && data.awayScore !== null) {
            setPulse(true);
            setTimeout(() => setPulse(false), 600);
          }
          return data.awayScore;
        });
        setIsLive(data.isLive);
        setIsFinished(data.isFinished);
        setHalfTimeHome(data.halfTimeHome);
        setHalfTimeAway(data.halfTimeAway);
        setGoals(parseMatchGoals(data.goals));
      } catch {
        // ignore transient network errors
      }
    }

    poll();
    const id = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [matchId, pollEnabled, isFinished]);

  const showScore = home !== null && away !== null;
  const showHalfTime =
    halfTimeHome !== null &&
    halfTimeAway !== null &&
    (isLive || isFinished);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-center space-y-2">
          {homeFlag !== "xx" ? (
            <Image
              src={getFlagSrc(homeFlag, 160)}
              width={isClubFlag(homeFlag) ? 56 : 72}
              height={56}
              alt={homeTeam}
              className={`mx-auto ${isClubFlag(homeFlag) ? "w-14 h-14 object-contain" : "rounded-sm w-[72px] h-auto"}`}
            />
          ) : (
            <span className="inline-block w-[72px] h-14 rounded-sm bg-[#1E3862] border border-[#2A4A7A] text-center text-lg leading-[56px] text-[#5A7A9A]">
              ?
            </span>
          )}
          <p className="text-sm font-semibold leading-tight">{homeTeam}</p>
        </div>

        <div className="text-center px-2 min-w-[108px]">
          {showScore ? (
            <div className={`flex items-center justify-center gap-2 ${pulse ? "animate-pulse" : ""}`}>
              <span className="text-4xl font-mono font-bold tabular-nums">{home}</span>
              <span className="text-[#FFD60A] text-2xl font-bold">×</span>
              <span className="text-4xl font-mono font-bold tabular-nums">{away}</span>
            </div>
          ) : (
            <span className="text-3xl font-bold text-[#FFD60A]">vs</span>
          )}
          {isFinished && showScore && (
            <p className="text-[10px] text-[#94B8D8] uppercase mt-1">Final</p>
          )}
        </div>

        <div className="text-center space-y-2">
          {awayFlag !== "xx" ? (
            <Image
              src={getFlagSrc(awayFlag, 160)}
              width={isClubFlag(awayFlag) ? 56 : 72}
              height={56}
              alt={awayTeam}
              className={`mx-auto ${isClubFlag(awayFlag) ? "w-14 h-14 object-contain" : "rounded-sm w-[72px] h-auto"}`}
            />
          ) : (
            <span className="inline-block w-[72px] h-14 rounded-sm bg-[#1E3862] border border-[#2A4A7A] text-center text-lg leading-[56px] text-[#5A7A9A]">
              ?
            </span>
          )}
          <p className="text-sm font-semibold leading-tight">{awayTeam}</p>
        </div>
      </div>

      {showHalfTime && (
        <p className="text-center text-[11px] text-[#94B8D8]">
          Intervalo:{" "}
          <span className="font-mono font-semibold text-white">
            {halfTimeHome} × {halfTimeAway}
          </span>
        </p>
      )}

      <MatchGoalsList homeTeam={homeTeam} awayTeam={awayTeam} goals={goals} />
    </div>
  );
}

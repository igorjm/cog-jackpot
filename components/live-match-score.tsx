"use client";

import { useEffect, useState } from "react";
import type { MatchStatus } from "@prisma/client";

interface LiveMatchScoreProps {
  matchId: string;
  initialHome: number | null;
  initialAway: number | null;
  initialIsLive: boolean;
  initialIsFinished: boolean;
  pollEnabled?: boolean;
  size?: "sm" | "lg";
}

interface LivePayload {
  homeScore: number | null;
  awayScore: number | null;
  isLive: boolean;
  isFinished: boolean;
  matchStatus: MatchStatus;
  pollRecommended: boolean;
}

const POLL_INTERVAL_MS = 60_000;

export function LiveMatchScore({
  matchId,
  initialHome,
  initialAway,
  initialIsLive,
  initialIsFinished,
  pollEnabled = true,
  size = "sm",
}: LiveMatchScoreProps) {
  const [home, setHome] = useState(initialHome);
  const [away, setAway] = useState(initialAway);
  const [isLive, setIsLive] = useState(initialIsLive);
  const [isFinished, setIsFinished] = useState(initialIsFinished);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setHome(initialHome);
    setAway(initialAway);
    setIsLive(initialIsLive);
    setIsFinished(initialIsFinished);
  }, [initialHome, initialAway, initialIsLive, initialIsFinished]);

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

        if (!data.pollRecommended) return;
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

  const scoreClass =
    size === "lg"
      ? "text-3xl font-mono font-bold tabular-nums"
      : "text-2xl font-mono font-bold tabular-nums";

  if (isFinished && home !== null && away !== null) {
    return (
      <div className="text-center">
        <div className={`flex items-center gap-1 ${pulse ? "animate-pulse" : ""}`}>
          <span className={scoreClass}>{home}</span>
          <span className="text-[#FFD60A] font-bold">×</span>
          <span className={scoreClass}>{away}</span>
        </div>
        <span className="text-[10px] text-[#94B8D8] uppercase">Final</span>
      </div>
    );
  }

  if (isLive && home !== null && away !== null) {
    return (
      <div className="text-center">
        <div className={`flex items-center gap-1 ${pulse ? "animate-pulse" : ""}`}>
          <span className={scoreClass}>{home}</span>
          <span className="text-[#FFD60A] font-bold">×</span>
          <span className={scoreClass}>{away}</span>
        </div>
        <span className="text-[10px] text-red-400 uppercase font-semibold">Ao vivo</span>
      </div>
    );
  }

  return (
    <div className="text-center">
      <span className={size === "lg" ? "text-2xl font-bold text-[#FFD60A]" : "text-lg text-[#FFD60A] font-bold"}>
        vs
      </span>
    </div>
  );
}

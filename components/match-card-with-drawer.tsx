"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { MatchCard } from "./match-card";
import { MatchBetsDrawer } from "./match-bets-drawer";
import { isBeforeDeadline } from "@/lib/deadline";
import { isMatchLiveNow } from "@/lib/match-live";
import type { MatchStatus } from "@prisma/client";

interface MatchCardWithDrawerProps {
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
  /** When set, overrides deadline-based detection (e.g. from API isLocked) */
  isLocked?: boolean;
  matchHref?: string;
}

export function MatchCardWithDrawer({
  match,
  userBet,
  showBetLink = true,
  isLocked,
  matchHref,
}: MatchCardWithDrawerProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const closeGuard = useRef(false);

  const matchDate = new Date(match.matchDate);
  const scoreFields = {
    homeScore: match.homeScore ?? null,
    awayScore: match.awayScore ?? null,
    liveHomeScore: match.liveHomeScore ?? null,
    liveAwayScore: match.liveAwayScore ?? null,
    matchStatus: match.matchStatus ?? "SCHEDULED",
    matchDate,
  };
  const isFinished =
    scoreFields.homeScore !== null && scoreFields.awayScore !== null;
  const isLive = isMatchLiveNow(scoreFields);
  const canViewBets =
    isLocked ?? (isFinished || !isBeforeDeadline(matchDate));
  const detailHref = matchHref ?? `/matches/${match.id}`;

  const handleOpen = (matchId: string) => {
    if (closeGuard.current) return;
    setSelectedMatchId(matchId);
  };

  const handleClose = () => {
    setSelectedMatchId(null);
    closeGuard.current = true;
    setTimeout(() => {
      closeGuard.current = false;
    }, 300);
  };

  const card = (
    <MatchCard match={match} userBet={userBet} showBetLink={showBetLink} />
  );

  if (isLive && !isFinished) {
    return (
      <Link href={detailHref} className="block w-full text-left cursor-pointer">
        {card}
      </Link>
    );
  }

  return (
    <>
      {canViewBets ? (
        <button
          type="button"
          onClick={() => handleOpen(match.id)}
          className="text-left w-full cursor-pointer"
        >
          {card}
        </button>
      ) : (
        card
      )}

      {selectedMatchId && (
        <MatchBetsDrawer matchId={selectedMatchId} onClose={handleClose} />
      )}
    </>
  );
}

"use client";

import { useState, useRef } from "react";
import { MatchCard } from "./match-card";
import { MatchBetsDrawer } from "./match-bets-drawer";
import { isBeforeDeadline } from "@/lib/deadline";

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
}

export function MatchCardWithDrawer({
  match,
  userBet,
  showBetLink = true,
  isLocked,
}: MatchCardWithDrawerProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const closeGuard = useRef(false);

  const isFinished =
    match.homeScore !== null && match.homeScore !== undefined &&
    match.awayScore !== null && match.awayScore !== undefined;
  const canViewBets =
    isLocked ?? (isFinished || !isBeforeDeadline(match.matchDate));

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

"use client";

import { useState, useRef } from "react";
import { MatchCard } from "./match-card";
import { MatchBetsDrawer } from "./match-bets-drawer";

interface RecentMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  matchDate: string;
  venue?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  multiplier: number;
  isLocked: boolean;
}

interface RecentResultsProps {
  matches: RecentMatch[];
  betsMap: Record<string, { homeScore: number; awayScore: number; points?: number | null; rawPoints?: number | null }>;
}

export function RecentResults({ matches, betsMap }: RecentResultsProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const closeGuard = useRef(false);

  const handleOpen = (matchId: string) => {
    if (closeGuard.current) return;
    setSelectedMatchId(matchId);
  };

  const handleClose = () => {
    setSelectedMatchId(null);
    closeGuard.current = true;
    setTimeout(() => { closeGuard.current = false; }, 300);
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {matches.map((match) =>
          match.isLocked ? (
            <button
              key={match.id}
              type="button"
              onClick={() => handleOpen(match.id)}
              className="text-left w-full"
            >
              <MatchCard
                match={{ ...match, matchDate: new Date(match.matchDate) }}
                userBet={betsMap[match.id] ?? null}
                showBetLink={false}
              />
            </button>
          ) : (
            <div key={match.id}>
              <MatchCard
                match={{ ...match, matchDate: new Date(match.matchDate) }}
                userBet={betsMap[match.id] ?? null}
                showBetLink={false}
              />
            </div>
          )
        )}
      </div>

      {selectedMatchId && (
        <MatchBetsDrawer
          matchId={selectedMatchId}
          onClose={handleClose}
        />
      )}
    </>
  );
}

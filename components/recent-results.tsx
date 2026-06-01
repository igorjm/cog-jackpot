"use client";

import { useState } from "react";
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

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {matches.map((match) => (
          <div
            key={match.id}
            onClick={() => match.isLocked ? setSelectedMatchId(match.id) : undefined}
            className={match.isLocked ? "cursor-pointer" : ""}
          >
            <MatchCard
              match={{ ...match, matchDate: new Date(match.matchDate) }}
              userBet={betsMap[match.id] ?? null}
              showBetLink={false}
            />
          </div>
        ))}
      </div>

      {selectedMatchId && (
        <MatchBetsDrawer
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
    </>
  );
}

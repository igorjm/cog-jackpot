"use client";

import { MatchCardWithDrawer } from "./match-card-with-drawer";

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
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {matches.map((match) => (
        <MatchCardWithDrawer
          key={match.id}
          match={{ ...match, matchDate: new Date(match.matchDate) }}
          userBet={betsMap[match.id] ?? null}
          showBetLink={false}
          isLocked={match.isLocked}
        />
      ))}
    </div>
  );
}

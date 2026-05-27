"use client";

import { useState, useEffect } from "react";
import { MatchCard } from "@/components/match-card";
import { PhaseTabs } from "@/components/phase-tabs";
import { Phase } from "@prisma/client";

interface MatchWithBet {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  matchDate: string;
  venue: string | null;
  homeScore: number | null;
  awayScore: number | null;
  multiplier: number;
  phase: Phase;
  group: string | null;
  userBet: {
    homeScore: number;
    awayScore: number;
    points: number | null;
    rawPoints: number | null;
  } | null;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithBet[]>([]);
  const [activePhase, setActivePhase] = useState<Phase>("GROUP");
  const [activeGroup, setActiveGroup] = useState<string>("A");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        setLoading(false);
      });
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (m.phase !== activePhase) return false;
    if (activePhase === "GROUP" && m.group !== activeGroup) return false;
    return true;
  });

  const groups = [
    ...new Set(
      matches.filter((m) => m.phase === "GROUP").map((m) => m.group!)
    ),
  ].sort();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-[#122448] rounded-lg animate-pulse" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-[#122448] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
        Jogos
      </h1>

      <PhaseTabs
        activePhase={activePhase}
        onPhaseChange={setActivePhase}
        activeGroup={activeGroup}
        onGroupChange={setActiveGroup}
        groups={groups}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {filteredMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={{ ...match, matchDate: new Date(match.matchDate) }}
            userBet={match.userBet}
          />
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-8 text-[#94B8D8]">
          Nenhum jogo nesta fase/grupo.
        </div>
      )}
    </div>
  );
}

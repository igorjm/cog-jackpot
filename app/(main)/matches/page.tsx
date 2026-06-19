"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MatchCardWithDrawer } from "@/components/match-card-with-drawer";
import { PhaseTabs } from "@/components/phase-tabs";
import { Phase } from "@prisma/client";
import { cn } from "@/lib/utils";

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
  isLocked: boolean;
  userBet: {
    homeScore: number;
    awayScore: number;
    points: number | null;
    rawPoints: number | null;
  } | null;
}

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const [matches, setMatches] = useState<MatchWithBet[]>([]);
  const [activePhase, setActivePhase] = useState<Phase>(
    (searchParams.get("phase") as Phase) || "GROUP"
  );
  const [activeGroup, setActiveGroup] = useState<string>(
    searchParams.get("group") || "A"
  );
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"phase" | "agenda">("phase");
  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        setLoading(false);
      });
  }, []);

  const friendlyMatches = matches.filter((m) => m.phase === "FRIENDLY" && m.homeScore === null);

  const filteredMatches = matches.filter((m) => {
    if (m.phase === "FRIENDLY") return false;
    if (m.phase !== activePhase) return false;
    if (activePhase === "GROUP" && m.group !== activeGroup) return false;
    return true;
  });

  const groups = [
    ...new Set(
      matches.filter((m) => m.phase === "GROUP").map((m) => m.group!)
    ),
  ].sort();

  const agendaMatches = matches
    .filter((m) => m.phase !== "FRIENDLY")
    .sort((a, b) => {
      const aFinished = a.homeScore !== null && a.awayScore !== null;
      const bFinished = b.homeScore !== null && b.awayScore !== null;
      if (aFinished !== bFinished) return aFinished ? 1 : -1;
      return new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
    });

  const agendaByDate = agendaMatches.reduce((acc, match) => {
    const key = new Date(match.matchDate).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      timeZone: "America/Sao_Paulo",
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {} as Record<string, MatchWithBet[]>);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-[#162D54] rounded-lg animate-pulse" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-[#162D54] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
          Jogos
        </h1>
        <div className="flex rounded-lg overflow-hidden border border-[#2A4A7A]">
          <button
            onClick={() => setActiveView("phase")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-all",
              activeView === "phase" ? "bg-[#38BDF8] text-[#0F2347]" : "bg-[#162D54] text-[#94B8D8] hover:text-white"
            )}
          >
            Fase
          </button>
          <button
            onClick={() => setActiveView("agenda")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-all",
              activeView === "agenda" ? "bg-[#38BDF8] text-[#0F2347]" : "bg-[#162D54] text-[#94B8D8] hover:text-white"
            )}
          >
            📅 Agenda
          </button>
        </div>
      </div>

      {/* Special matches section */}
      {friendlyMatches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase text-[#FFD60A] tracking-wide">
              ⭐ Jogos Especiais
            </span>
            <span className="text-[10px] text-[#94B8D8] bg-[#1E3862] px-2 py-0.5 rounded-full">
              Não contam no ranking
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {friendlyMatches.map((match) => (
              <MatchCardWithDrawer
                key={match.id}
                match={{ ...match, matchDate: new Date(match.matchDate) }}
                userBet={match.userBet}
                isLocked={match.isLocked}
              />
            ))}
          </div>
          <div className="border-t border-[#2A4A7A]" />
        </section>
      )}

      {/* Predictions link */}
      <Link
        href="/predictions"
        className="block bg-gradient-to-r from-[#1a3a6b] to-[#2a1a5e] rounded-xl border border-[#2A4A7A] p-4 hover:border-[#FFD60A]/40 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold uppercase text-[#FFD60A] tracking-wide">
                🏆 Palpites Especiais
              </span>
              <span className="text-[10px] text-[#94B8D8] bg-[#1E3862] px-2 py-0.5 rounded-full">
                +10 pts cada
              </span>
            </div>
            <p className="text-xs text-[#94B8D8]">
              Escolha o campeão e o artilheiro da Copa
            </p>
          </div>
          <span className="text-[#94B8D8] group-hover:text-[#FFD60A] transition-colors text-lg">→</span>
        </div>
      </Link>

      {activeView === "phase" && (
        <>
          <PhaseTabs
            activePhase={activePhase}
            onPhaseChange={setActivePhase}
            activeGroup={activeGroup}
            onGroupChange={setActiveGroup}
            groups={groups}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {filteredMatches.map((match) => (
              <MatchCardWithDrawer
                key={match.id}
                match={{ ...match, matchDate: new Date(match.matchDate) }}
                userBet={match.userBet}
                isLocked={match.isLocked}
              />
            ))}
          </div>

          {filteredMatches.length === 0 && (
            <div className="text-center py-8 text-[#94B8D8]">
              Nenhum jogo nesta fase/grupo.
            </div>
          )}
        </>
      )}

      {activeView === "agenda" && (
        <div className="space-y-6">
          {Object.entries(agendaByDate).map(([dateLabel, dayMatches]) => (
            <div key={dateLabel} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wide text-[#FFD60A] capitalize">
                  {dateLabel}
                </span>
                <div className="flex-1 h-px bg-[#2A4A7A]" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {dayMatches.map((match) => (
                  <MatchCardWithDrawer
                    key={match.id}
                    match={{ ...match, matchDate: new Date(match.matchDate) }}
                    userBet={match.userBet}
                    isLocked={match.isLocked}
                  />
                ))}
              </div>
            </div>
          ))}
          {agendaMatches.length === 0 && (
            <div className="text-center py-8 text-[#94B8D8]">
              Nenhum jogo cadastrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

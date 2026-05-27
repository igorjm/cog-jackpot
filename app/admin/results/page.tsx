"use client";

import { Button } from "@/components/ui/button";
import { saveResult } from "@/app/actions/admin";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  matchDate: string;
  homeScore: number | null;
  awayScore: number | null;
  matchNumber: number;
  phase: string;
  group: string | null;
}

const PHASE_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "GROUP", label: "Grupos" },
  { value: "ROUND_OF_16", label: "Oitavas" },
  { value: "QUARTER_FINAL", label: "Quartas" },
  { value: "SEMI_FINAL", label: "Semis" },
  { value: "THIRD_PLACE", label: "3º Lugar" },
  { value: "FINAL", label: "Final" },
];

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function AdminResultsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, { home: number; away: number }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState("PENDING");

  useEffect(() => {
    fetch("/api/admin/matches")
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        const initial: Record<string, { home: number; away: number }> = {};
        data.forEach((m: Match) => {
          initial[m.id] = {
            home: m.homeScore ?? 0,
            away: m.awayScore ?? 0,
          };
        });
        setScores(initial);
        setLoading(false);
      });
  }, []);

  const handleSave = async (matchId: string) => {
    setSaving(matchId);
    const formData = new FormData();
    formData.set("matchId", matchId);
    formData.set("homeScore", scores[matchId].home.toString());
    formData.set("awayScore", scores[matchId].away.toString());
    const result = await saveResult(formData);
    if (result?.success) {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? { ...m, homeScore: scores[matchId].home, awayScore: scores[matchId].away }
            : m
        )
      );
      setSaved((prev) => new Set(prev).add(matchId));
      setTimeout(() => setSaved((prev) => {
        const next = new Set(prev);
        next.delete(matchId);
        return next;
      }), 2000);
    }
    setSaving(null);
  };

  const filteredMatches = matches
    .filter((m) => {
      if (activeFilter === "ALL") return true;
      if (activeFilter === "PENDING") return m.homeScore === null;
      return m.phase === activeFilter;
    })
    .sort((a, b) => {
      if (a.homeScore === null && b.homeScore !== null) return -1;
      if (a.homeScore !== null && b.homeScore === null) return 1;
      return new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
    });

  const pendingCount = matches.filter((m) => m.homeScore === null).length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-[#122448] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
          Resultados
        </h1>
        {pendingCount > 0 && (
          <span className="text-xs bg-[#FFD60A]/15 text-[#FFD60A] px-2.5 py-1 rounded-full border border-[#FFD60A]/30">
            {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Phase filter tabs */}
      <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-hide">
        {PHASE_OPTIONS.map((phase) => (
          <button
            key={phase.value}
            onClick={() => setActiveFilter(phase.value)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
              activeFilter === phase.value
                ? "bg-[#EF4444] text-white"
                : "bg-[#122448] text-[#94B8D8] hover:text-white"
            )}
          >
            {phase.label}
          </button>
        ))}
      </div>

      {/* Match list */}
      <div className="space-y-3">
        {filteredMatches.map((match) => {
          const hasResult = match.homeScore !== null;
          const justSaved = saved.has(match.id);

          return (
            <div
              key={match.id}
              className={cn(
                "bg-[#122448] rounded-xl border p-4 transition-all",
                justSaved
                  ? "border-[#22C55E]/50 shadow-lg shadow-[#22C55E]/10"
                  : hasResult
                  ? "border-[#1E3A6E]"
                  : "border-[#FFD60A]/30"
              )}
            >
              {/* Match header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#5A7A9A]">
                    #{match.matchNumber}
                  </span>
                  <span className="text-xs text-[#94B8D8]">
                    {new Date(match.matchDate).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {justSaved ? (
                  <span className="text-xs text-[#22C55E] font-medium animate-pulse">
                    ✓ Salvo!
                  </span>
                ) : hasResult ? (
                  <span className="text-[10px] text-[#22C55E]">✓ Resultado</span>
                ) : (
                  <span className="text-[10px] text-[#FFD60A]">Pendente</span>
                )}
              </div>

              {/* Teams + Score inputs */}
              <div className="flex items-center gap-3">
                {/* Home team */}
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-medium truncate">
                      {match.homeTeam}
                    </span>
                    <span className="text-lg flex-shrink-0">
                      {getFlagEmoji(match.homeFlag)}
                    </span>
                  </div>
                </div>

                {/* Score inputs */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={scores[match.id]?.home ?? 0}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: { ...prev[match.id], home: Number(e.target.value) },
                      }))
                    }
                    className="w-12 h-11 sm:w-14 sm:h-12 text-center bg-black border border-[#1E3A6E] rounded-lg text-xl font-mono font-bold focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]/50 transition-colors"
                  />
                  <span className="text-[#FFD60A] font-bold text-lg">×</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={scores[match.id]?.away ?? 0}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: { ...prev[match.id], away: Number(e.target.value) },
                      }))
                    }
                    className="w-12 h-11 sm:w-14 sm:h-12 text-center bg-black border border-[#1E3A6E] rounded-lg text-xl font-mono font-bold focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]/50 transition-colors"
                  />
                </div>

                {/* Away team */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg flex-shrink-0">
                      {getFlagEmoji(match.awayFlag)}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {match.awayTeam}
                    </span>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => handleSave(match.id)}
                  disabled={saving === match.id}
                  className="min-w-[90px]"
                >
                  {saving === match.id ? "Salvando..." : hasResult ? "Atualizar" : "Salvar"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12 text-[#94B8D8]">
          {activeFilter === "PENDING"
            ? "🎉 Todos os jogos já possuem resultado!"
            : "Nenhum jogo encontrado nesta fase."}
        </div>
      )}
    </div>
  );
}

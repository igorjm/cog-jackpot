"use client";

import { Button } from "@/components/ui/button";
import { saveResult } from "@/app/actions/admin";
import { useEffect, useState } from "react";

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
}

export default function AdminResultsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, { home: number; away: number }>>({});
  const [saving, setSaving] = useState<string | null>(null);

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
    }
    setSaving(null);
  };

  if (loading) {
    return <div className="animate-pulse h-40 bg-[#122448] rounded-xl" />;
  }

  // Sort: matches without result first, then by date
  const sortedMatches = [...matches].sort((a, b) => {
    if (a.homeScore === null && b.homeScore !== null) return -1;
    if (a.homeScore !== null && b.homeScore === null) return 1;
    return new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
        Resultados
      </h1>

      <div className="space-y-2">
        {sortedMatches.map((match) => (
          <div
            key={match.id}
            className={`bg-[#122448] rounded-xl border p-4 ${
              match.homeScore !== null ? "border-[#1E3A6E]" : "border-[#FFD60A]/30"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs text-[#94B8D8]">
                #{match.matchNumber} •{" "}
                {new Date(match.matchDate).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
              {match.homeScore !== null && (
                <span className="text-[10px] text-[#22C55E]">✓ Resultado salvo</span>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm flex-1 text-right truncate">{match.homeTeam}</span>

              <div className="flex items-center gap-2">
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
                  className="w-12 h-10 text-center bg-[black] border border-[#1E3A6E] rounded-lg text-lg font-mono font-bold focus:border-[#22C55E] focus:outline-none"
                />
                <span className="text-[#FFD60A] font-bold">×</span>
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
                  className="w-12 h-10 text-center bg-[black] border border-[#1E3A6E] rounded-lg text-lg font-mono font-bold focus:border-[#22C55E] focus:outline-none"
                />
              </div>

              <span className="text-sm flex-1 truncate">{match.awayTeam}</span>

              <Button
                size="sm"
                onClick={() => handleSave(match.id)}
                disabled={saving === match.id}
              >
                {saving === match.id ? "..." : "Salvar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

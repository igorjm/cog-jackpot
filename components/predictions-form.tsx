"use client";

import { useState, useEffect } from "react";
import { savePrediction } from "@/app/actions/predictions";

const TEAMS = [
  "África do Sul", "Alemanha", "Arábia Saudita", "Argélia", "Argentina",
  "Austrália", "Áustria", "Bélgica", "Bósnia e Herzegovina", "Brasil",
  "Cabo Verde", "Canadá", "Colômbia", "Coreia do Sul", "Costa do Marfim",
  "Croácia", "Curaçao", "Egito", "Equador", "Escócia",
  "Espanha", "Estados Unidos", "França", "Gana", "Haiti",
  "Holanda", "Inglaterra", "Irã", "Iraque", "Japão",
  "Jordânia", "Marrocos", "México", "Noruega", "Nova Zelândia",
  "Panamá", "Paraguai", "Portugal", "Catar", "RD Congo",
  "República Tcheca", "Senegal", "Suécia", "Suíça", "Tunísia",
  "Turquia", "Uruguai", "Uzbequistão",
];

// Deadline: June 11, 2026 19:00 UTC
const PREDICTIONS_DEADLINE = new Date("2026-06-11T19:00:00Z");

export function PredictionsForm() {
  const [champion, setChampion] = useState("");
  const [topScorer, setTopScorer] = useState("");
  const [loading, setLoading] = useState<"CHAMPION" | "TOP_SCORER" | null>(null);
  const [messages, setMessages] = useState<{ champion?: string; topScorer?: string }>({});
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setIsLocked(new Date() >= PREDICTIONS_DEADLINE);

    // Load existing predictions
    fetch("/api/predictions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          for (const p of data) {
            if (p.type === "CHAMPION") setChampion(p.value);
            if (p.type === "TOP_SCORER") setTopScorer(p.value);
          }
        }
      });
  }, []);

  const handleSave = async (type: "CHAMPION" | "TOP_SCORER") => {
    const value = type === "CHAMPION" ? champion : topScorer;
    if (!value.trim()) return;

    setLoading(type);
    setMessages((prev) => ({ ...prev, [type === "CHAMPION" ? "champion" : "topScorer"]: undefined }));

    const result = await savePrediction(type, value);

    if (result.error) {
      setMessages((prev) => ({
        ...prev,
        [type === "CHAMPION" ? "champion" : "topScorer"]: result.error,
      }));
    } else {
      setMessages((prev) => ({
        ...prev,
        [type === "CHAMPION" ? "champion" : "topScorer"]: "Salvo!",
      }));
      setTimeout(() => {
        setMessages((prev) => ({
          ...prev,
          [type === "CHAMPION" ? "champion" : "topScorer"]: undefined,
        }));
      }, 2000);
    }

    setLoading(null);
  };

  return (
    <div className="space-y-4">
      {/* Champion */}
      <div className="bg-[var(--color-bg-elevated)] rounded-xl p-4 border border-[var(--color-separator)]">
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          🏆 Campeão do Mundo
        </label>
        {isLocked ? (
          <div className="text-white font-medium">
            {champion || <span className="text-[var(--color-text-tertiary)]">Não definido</span>}
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              value={champion}
              onChange={(e) => setChampion(e.target.value)}
              className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-separator)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50"
            >
              <option value="">Selecione um time...</option>
              {TEAMS.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleSave("CHAMPION")}
              disabled={!champion || loading === "CHAMPION"}
              className="px-4 py-2 bg-[var(--color-green)] text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:brightness-110 transition-all"
            >
              {loading === "CHAMPION" ? "..." : "Salvar"}
            </button>
          </div>
        )}
        {messages.champion && (
          <p className={`text-xs mt-1 ${messages.champion === "Salvo!" ? "text-[var(--color-green)]" : "text-[var(--color-red)]"}`}>
            {messages.champion}
          </p>
        )}
      </div>

      {/* Top Scorer */}
      <div className="bg-[var(--color-bg-elevated)] rounded-xl p-4 border border-[var(--color-separator)]">
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          ⚽ Artilheiro da Copa
        </label>
        {isLocked ? (
          <div className="text-white font-medium">
            {topScorer || <span className="text-[var(--color-text-tertiary)]">Não definido</span>}
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={topScorer}
              onChange={(e) => setTopScorer(e.target.value)}
              placeholder="Nome do jogador..."
              className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-separator)] rounded-lg px-3 py-2 text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50"
            />
            <button
              onClick={() => handleSave("TOP_SCORER")}
              disabled={!topScorer.trim() || loading === "TOP_SCORER"}
              className="px-4 py-2 bg-[var(--color-green)] text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:brightness-110 transition-all"
            >
              {loading === "TOP_SCORER" ? "..." : "Salvar"}
            </button>
          </div>
        )}
        {messages.topScorer && (
          <p className={`text-xs mt-1 ${messages.topScorer === "Salvo!" ? "text-[var(--color-green)]" : "text-[var(--color-red)]"}`}>
            {messages.topScorer}
          </p>
        )}
      </div>

      {!isLocked && (
        <p className="text-xs text-[var(--color-text-tertiary)] text-center">
          Prazo: até o início do primeiro jogo da fase de grupos (11/06/2026)
        </p>
      )}
    </div>
  );
}

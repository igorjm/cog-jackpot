"use client";

import { useState } from "react";
import { placeBet } from "@/app/actions/bets";

interface BetFormProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  existingBet?: { homeScore: number; awayScore: number };
  isLocked: boolean;
}

export function BetForm({
  matchId,
  homeTeam,
  awayTeam,
  existingBet,
  isLocked,
}: BetFormProps) {
  const [homeScore, setHomeScore] = useState(existingBet?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(existingBet?.awayScore ?? 0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.set("matchId", matchId);
    formData.set("homeScore", homeScore.toString());
    formData.set("awayScore", awayScore.toString());

    const result = await placeBet(formData);
    if (result?.error) {
      setMessage(result.error);
    } else {
      setMessage("Palpite salvo!");
    }
    setLoading(false);
  };

  if (isLocked) {
    return (
      <div className="flex items-center justify-center gap-4 py-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="text-3xl font-mono font-bold text-[#94B8D8]">
              {existingBet ? existingBet.homeScore : "-"}
            </span>
            <span className="text-2xl font-bold text-[#FFD60A]">×</span>
            <span className="text-3xl font-mono font-bold text-[#94B8D8]">
              {existingBet ? existingBet.awayScore : "-"}
            </span>
          </div>
          <p className="text-xs text-[#94B8D8] mt-1">
            {existingBet ? "Seu palpite" : "Sem palpite"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Score Inputs */}
      <div className="flex items-center justify-center gap-3">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-[#A8C3E8] text-center w-24 truncate">{homeTeam}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
              className="w-11 h-11 rounded-full border border-[#1E3A6E] bg-[#0a1628] text-white hover:border-[#FACC15] hover:text-[#FACC15] transition-colors flex items-center justify-center text-lg font-bold"
            >
              −
            </button>
            <div className="w-12 h-12 rounded-full bg-[#0d1f3c] border border-[#1E3A6E] flex items-center justify-center">
              <span className="text-2xl font-mono font-bold tabular-nums">{homeScore}</span>
            </div>
            <button
              type="button"
              onClick={() => setHomeScore(Math.min(20, homeScore + 1))}
              className="w-11 h-11 rounded-full border border-[#1E3A6E] bg-[#0a1628] text-white hover:border-[#FACC15] hover:text-[#FACC15] transition-colors flex items-center justify-center text-lg font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Separator */}
        <span className="text-2xl font-bold text-[#FFD60A] mt-6">✕</span>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-[#A8C3E8] text-center w-24 truncate">{awayTeam}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
              className="w-11 h-11 rounded-full border border-[#1E3A6E] bg-[#0a1628] text-white hover:border-[#FACC15] hover:text-[#FACC15] transition-colors flex items-center justify-center text-lg font-bold"
            >
              −
            </button>
            <div className="w-12 h-12 rounded-full bg-[#0d1f3c] border border-[#1E3A6E] flex items-center justify-center">
              <span className="text-2xl font-mono font-bold tabular-nums">{awayScore}</span>
            </div>
            <button
              type="button"
              onClick={() => setAwayScore(Math.min(20, awayScore + 1))}
              className="w-11 h-11 rounded-full border border-[#1E3A6E] bg-[#0a1628] text-white hover:border-[#FACC15] hover:text-[#FACC15] transition-colors flex items-center justify-center text-lg font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 disabled:cursor-not-allowed text-black font-extrabold text-base uppercase tracking-wide transition-colors"
      >
        {loading
          ? "Salvando..."
          : existingBet
          ? "Atualizar Palpite"
          : "Confirmar Palpite"}
      </button>

      {message && (
        <p
          className={`text-xs text-center ${
            message.includes("salvo") ? "text-[#22c55e]" : "text-[#EF4444]"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

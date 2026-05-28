"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { placeBet } from "@/app/actions/bets";
import { Button } from "./ui/button";

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
  const router = useRouter();
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
      setLoading(false);
    } else {
      router.push("/matches");
    }
  };

  if (isLocked) {
    return (
      <div className="flex items-center justify-center gap-4 py-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-mono font-bold text-[#94B8D8]">
              {existingBet ? existingBet.homeScore : "-"}
            </span>
            <span className="text-[#94B8D8]">×</span>
            <span className="text-2xl font-mono font-bold text-[#94B8D8]">
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
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-[#94B8D8] truncate max-w-[80px]">{homeTeam}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
              className="w-8 h-8 rounded-full border border-[#2A4A7A] text-[white] hover:border-[#22C55E] transition-colors flex items-center justify-center"
            >
              -
            </button>
            <span className="text-3xl font-mono font-bold w-10 text-center tabular-nums">
              {homeScore}
            </span>
            <button
              type="button"
              onClick={() => setHomeScore(Math.min(20, homeScore + 1))}
              className="w-8 h-8 rounded-full border border-[#2A4A7A] text-[white] hover:border-[#22C55E] transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        <span className="text-2xl font-bold text-[#FFD60A]">×</span>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-[#94B8D8] truncate max-w-[80px]">{awayTeam}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
              className="w-8 h-8 rounded-full border border-[#2A4A7A] text-[white] hover:border-[#22C55E] transition-colors flex items-center justify-center"
            >
              -
            </button>
            <span className="text-3xl font-mono font-bold w-10 text-center tabular-nums">
              {awayScore}
            </span>
            <button
              type="button"
              onClick={() => setAwayScore(Math.min(20, awayScore + 1))}
              className="w-8 h-8 rounded-full border border-[#2A4A7A] text-[white] hover:border-[#22C55E] transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full"
        size="md"
      >
        {loading
          ? "Salvando..."
          : existingBet
          ? "Atualizar Palpite"
          : "Confirmar Palpite"}
      </Button>

      {message && (
        <p
          className={`text-xs text-center ${
            message.includes("salvo") ? "text-[#22C55E]" : "text-[#EF4444]"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

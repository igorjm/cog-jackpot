"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getFlagSrc, isClubFlag } from "@/lib/utils";

interface BetEntry {
  homeScore: number;
  awayScore: number;
  points: number | null;
  rawPoints: number | null;
  user: {
    nickname: string;
    name: string;
    avatar: string | null;
  };
}

interface MatchInfo {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  homeScore: number | null;
  awayScore: number | null;
  multiplier: number;
}

interface MatchBetsDrawerProps {
  matchId: string;
  onClose: () => void;
}

export function MatchBetsDrawer({ matchId, onClose }: MatchBetsDrawerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [match, setMatch] = useState<MatchInfo | null>(null);
  const [bets, setBets] = useState<BetEntry[]>([]);

  useEffect(() => {
    fetch(`/api/matches/${matchId}/bets`)
      .then((res) => {
        if (!res.ok) throw new Error("Não foi possível carregar os palpites");
        return res.json();
      })
      .then((data) => {
        setMatch(data.match);
        setBets(data.bets);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [matchId]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] flex flex-col bg-[#0F2347] rounded-t-2xl border-t border-[#2A4A7A] shadow-2xl animate-in slide-in-from-bottom duration-300 md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:w-[420px] md:max-h-none md:rounded-t-none md:rounded-l-2xl md:border-t-0 md:border-l">
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-[#2A4A7A]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2A4A7A]">
          <h2 className="text-base font-bold font-[family-name:var(--font-oswald)] uppercase text-[#FFD60A]">
            Palpites do Jogo
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#162D54] text-[#94B8D8] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-[#162D54] rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-[#EF4444] text-center py-4">{error}</p>
          )}

          {!loading && !error && match && (
            <>
              {/* Match summary */}
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="text-right">
                  <p className="text-sm font-medium">{match.homeTeam}</p>
                  {match.homeFlag !== "xx" && (
                    <Image
                      src={getFlagSrc(match.homeFlag)}
                      width={isClubFlag(match.homeFlag) ? 20 : 24}
                      height={isClubFlag(match.homeFlag) ? 20 : 18}
                      alt={match.homeTeam}
                      className={`inline-block mt-0.5 ${isClubFlag(match.homeFlag) ? "w-5 h-5 object-contain" : "rounded-sm"}`}
                    />
                  )}
                </div>
                <div className="text-center px-2">
                  {match.homeScore !== null ? (
                    <span className="font-mono font-bold text-lg">
                      {match.homeScore} × {match.awayScore}
                    </span>
                  ) : (
                    <span className="text-[#FFD60A] font-bold">vs</span>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{match.awayTeam}</p>
                  {match.awayFlag !== "xx" && (
                    <Image
                      src={getFlagSrc(match.awayFlag)}
                      width={isClubFlag(match.awayFlag) ? 20 : 24}
                      height={isClubFlag(match.awayFlag) ? 20 : 18}
                      alt={match.awayTeam}
                      className={`inline-block mt-0.5 ${isClubFlag(match.awayFlag) ? "w-5 h-5 object-contain" : "rounded-sm"}`}
                    />
                  )}
                </div>
              </div>

              {/* Bets list */}
              <div className="space-y-2">
                <p className="text-xs text-[#5A7A9A] uppercase tracking-wide">
                  {bets.length} palpite{bets.length !== 1 ? "s" : ""}
                </p>

                {bets.map((bet, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-3 py-2.5 bg-[#162D54] rounded-xl border border-[#2A4A7A]"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1E3862] flex-shrink-0 flex items-center justify-center">
                      {bet.user.avatar ? (
                        <Image
                          src={bet.user.avatar}
                          alt={bet.user.nickname}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-xs font-bold text-[#94B8D8]">
                          {bet.user.nickname.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Name + bet */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{bet.user.nickname}</p>
                    </div>

                    {/* Predicted score */}
                    <div className="font-mono text-sm font-bold tabular-nums">
                      {bet.homeScore} × {bet.awayScore}
                    </div>

                    {/* Points (if result is in) */}
                    {bet.points !== null && (
                      <div
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          bet.rawPoints === 10
                            ? "bg-[#FFD60A]/20 text-[#FFD60A]"
                            : (bet.points ?? 0) > 0
                            ? "bg-[#22C55E]/20 text-[#22C55E]"
                            : "bg-[#EF4444]/20 text-[#EF4444]"
                        }`}
                      >
                        +{bet.points}
                      </div>
                    )}
                  </div>
                ))}

                {bets.length === 0 && (
                  <p className="text-sm text-[#94B8D8] text-center py-4">
                    Nenhum palpite registrado para este jogo.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

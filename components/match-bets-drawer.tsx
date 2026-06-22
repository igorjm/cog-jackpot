"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
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

type BetSide = "home" | "draw" | "away";

function getBetSide(homeScore: number, awayScore: number): BetSide {
  if (homeScore > awayScore) return "home";
  if (homeScore === awayScore) return "draw";
  return "away";
}

function scoreKey(homeScore: number, awayScore: number): string {
  return `${homeScore}×${awayScore}`;
}

function groupAndSortBets(bets: BetEntry[], side: BetSide) {
  const filtered = bets.filter((b) => getBetSide(b.homeScore, b.awayScore) === side);

  const groups = new Map<string, BetEntry[]>();
  for (const bet of filtered) {
    const key = scoreKey(bet.homeScore, bet.awayScore);
    const list = groups.get(key) ?? [];
    list.push(bet);
    groups.set(key, list);
  }

  const sortedKeys = [...groups.keys()].sort((a, b) => {
    const [ah, aa] = a.split("×").map(Number);
    const [bh, ba] = b.split("×").map(Number);
    if (side === "home") {
      if (bh !== ah) return bh - ah;
      return aa - ba;
    }
    if (side === "away") {
      if (ba !== aa) return ba - aa;
      return ah - bh;
    }
    return bh - ah;
  });

  return sortedKeys.map((key) => {
    const entries = groups.get(key)!;
    entries.sort((x, y) => x.user.nickname.localeCompare(y.user.nickname));
    const [homeScore, awayScore] = key.split("×").map(Number);
    return { homeScore, awayScore, bets: entries };
  });
}

function BetAvatar({ bet }: { bet: BetEntry }) {
  return (
    <div className="w-7 h-7 rounded-full overflow-hidden bg-[#1E3862] shrink-0 flex items-center justify-center">
      {bet.user.avatar ? (
        <Image
          src={bet.user.avatar}
          alt={bet.user.nickname}
          width={28}
          height={28}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="text-[10px] font-bold text-[#94B8D8]">
          {bet.user.nickname.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function PointsBadge({ bet }: { bet: BetEntry }) {
  if (bet.points === null) return null;
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
        bet.rawPoints === 10
          ? "bg-[#FFD60A]/20 text-[#FFD60A]"
          : bet.points > 0
          ? "bg-[#22C55E]/20 text-[#22C55E]"
          : "bg-[#EF4444]/20 text-[#EF4444]"
      }`}
    >
      +{bet.points}
    </span>
  );
}

function TeamFlag({
  flag,
  team,
  size = 32,
}: {
  flag: string;
  team: string;
  size?: number;
}) {
  if (flag === "xx") {
    return (
      <span className="inline-flex w-8 h-6 items-center justify-center rounded-sm bg-[#1E3862] border border-[#2A4A7A] text-[10px] text-[#5A7A9A]">
        ?
      </span>
    );
  }
  const club = isClubFlag(flag);
  const imgWidth = club ? size - 4 : size;
  const imgHeight = club ? size - 4 : Math.round(size * 0.75);
  return (
    <Image
      src={getFlagSrc(flag, imgWidth * 2)}
      width={imgWidth}
      height={imgHeight}
      alt={team}
      className={`inline-block ${club ? "object-contain" : "rounded-sm"}`}
      style={{ width: imgWidth, height: imgHeight }}
    />
  );
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-[#5A7A9A] transition-transform duration-200 ${
        expanded ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ScoreGroupCard({
  group,
  defaultExpanded = true,
}: {
  group: { homeScore: number; awayScore: number; bets: BetEntry[] };
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-lg bg-[#0F2347]/60 border border-[#2A4A7A]/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className={`w-full px-2.5 py-1.5 flex items-center justify-between gap-2 hover:bg-[#1E3862]/40 transition-colors cursor-pointer ${
          expanded ? "border-b border-[#2A4A7A]/30" : ""
        }`}
      >
        <span className="font-mono text-sm font-bold text-[#FFD60A] tabular-nums">
          {group.homeScore} × {group.awayScore}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-[#5A7A9A]">
            {group.bets.length}
          </span>
          <CollapseChevron expanded={expanded} />
        </div>
      </button>
      {expanded && (
        <ul className="divide-y divide-[#2A4A7A]/20">
          {group.bets.map((bet) => (
            <li
              key={bet.user.nickname}
              className="flex items-center gap-2 px-2.5 py-2"
            >
              <BetAvatar bet={bet} />
              <span className="text-xs text-white truncate flex-1 min-w-0">
                {bet.user.nickname}
              </span>
              <PointsBadge bet={bet} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BetSideColumn({
  title,
  flag,
  team,
  groups,
  accentClass,
  emptyLabel,
}: {
  title: string;
  flag?: string;
  team?: string;
  groups: { homeScore: number; awayScore: number; bets: BetEntry[] }[];
  accentClass: string;
  emptyLabel: string;
}) {
  const total = groups.reduce((s, g) => s + g.bets.length, 0);
  const hasBets = total > 0;
  const [expanded, setExpanded] = useState(true);
  const showContent = !hasBets || expanded;

  const header = (
    <div className="flex items-center gap-2 min-w-0">
      {flag && team && <TeamFlag flag={flag} team={team} size={28} />}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-white truncate">{title}</p>
        <p className="text-[10px] text-[#5A7A9A]">
          {total} palpite{total !== 1 ? "s" : ""}
          {hasBets && groups.length > 0 && (
            <> · {groups.length} placar{groups.length !== 1 ? "es" : ""}</>
          )}
        </p>
      </div>
      {hasBets && <CollapseChevron expanded={expanded} />}
    </div>
  );

  return (
    <div
      className={`flex flex-col rounded-xl border bg-[#162D54] overflow-hidden ${accentClass} ${
        showContent ? "min-h-[120px]" : ""
      }`}
    >
      {hasBets ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className={`w-full px-3 py-2.5 bg-[#0F2347]/40 text-left transition-colors hover:bg-[#0F2347]/70 cursor-pointer ${
            showContent ? "border-b border-[#2A4A7A]/60" : ""
          }`}
        >
          {header}
        </button>
      ) : (
        <div className="px-3 py-2.5 border-b border-[#2A4A7A]/60 bg-[#0F2347]/40">
          {header}
        </div>
      )}

      {showContent && (
        <div className="flex-1 p-2 space-y-2 max-h-[40vh] overflow-y-auto">
          {groups.length === 0 ? (
            <p className="text-[11px] text-[#5A7A9A] text-center py-4 px-1">
              {emptyLabel}
            </p>
          ) : (
            groups.map((group) => (
              <ScoreGroupCard
                key={scoreKey(group.homeScore, group.awayScore)}
                group={group}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const grouped = useMemo(() => {
    if (!match) return null;
    return {
      home: groupAndSortBets(bets, "home"),
      draw: groupAndSortBets(bets, "draw"),
      away: groupAndSortBets(bets, "away"),
    };
  }, [bets, match]);

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[100]"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 z-[110] max-h-[92vh] flex flex-col bg-[#0F2347] rounded-t-2xl border-t border-[#2A4A7A] shadow-2xl md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-[5vh] md:w-[min(920px,calc(100vw-2rem))] md:max-h-[90vh] md:rounded-2xl md:border">
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-[#2A4A7A]" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2A4A7A] shrink-0">
          <h2 className="text-base font-bold font-[family-name:var(--font-oswald)] uppercase text-[#FFD60A]">
            Palpites do Jogo
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#162D54] text-[#94B8D8] hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-4 space-y-4">
          {loading && (
            <div className="grid gap-3 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-[#162D54] rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-[#EF4444] text-center py-4">{error}</p>
          )}

          {!loading && !error && match && grouped && (
            <>
              <div className="flex items-center justify-center gap-3 py-1">
                <div className="text-center min-w-0 flex-1">
                  <TeamFlag flag={match.homeFlag} team={match.homeTeam} />
                  <p className="text-xs font-medium mt-1 truncate">{match.homeTeam}</p>
                </div>
                <div className="text-center px-2 shrink-0">
                  {match.homeScore !== null ? (
                    <span className="font-mono font-bold text-lg tabular-nums">
                      {match.homeScore} × {match.awayScore}
                    </span>
                  ) : (
                    <span className="text-[#FFD60A] font-bold">vs</span>
                  )}
                </div>
                <div className="text-center min-w-0 flex-1">
                  <TeamFlag flag={match.awayFlag} team={match.awayTeam} />
                  <p className="text-xs font-medium mt-1 truncate">{match.awayTeam}</p>
                </div>
              </div>

              <p className="text-xs text-[#5A7A9A] text-center">
                {bets.length} palpite{bets.length !== 1 ? "s" : ""} no total
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <BetSideColumn
                  title={match.homeTeam}
                  flag={match.homeFlag}
                  team={match.homeTeam}
                  groups={grouped.home}
                  accentClass="border-[#22C55E]/30"
                  emptyLabel="Ninguém apostou na vitória do mandante"
                />
                <BetSideColumn
                  title="Empate"
                  groups={grouped.draw}
                  accentClass="border-[#FFD60A]/30"
                  emptyLabel="Ninguém apostou no empate"
                />
                <BetSideColumn
                  title={match.awayTeam}
                  flag={match.awayFlag}
                  team={match.awayTeam}
                  groups={grouped.away}
                  accentClass="border-[#38BDF8]/30"
                  emptyLabel="Ninguém apostou na vitória do visitante"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

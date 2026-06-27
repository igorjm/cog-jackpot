import Image from "next/image";
import {
  BASE_MATCH_HEIGHT,
  FINAL_MATCH_NUMBER,
  getWinnerSide,
  LEFT_BRACKET_ROUNDS,
  RIGHT_BRACKET_ROUNDS,
  THIRD_PLACE_MATCH_NUMBER,
  type BracketMatchData,
  type BracketRoundDef,
} from "@/lib/bracket-tree";
import { BracketJoinLines } from "./bracket-join-lines";
import { BracketMatchPair } from "./bracket-match-pair";
import { BracketTeamSlot } from "./bracket-team-slot";

interface KnockoutBracketProps {
  matches: BracketMatchData[];
}

function BracketHalf({
  rounds,
  matchByNumber,
  side,
}: {
  rounds: BracketRoundDef[];
  matchByNumber: Map<number, BracketMatchData>;
  side: "left" | "right";
}) {
  const roundsWithDepth = rounds.map((round, depth) => ({ round, depth }));
  const displayRounds =
    side === "right" ? [...roundsWithDepth].reverse() : roundsWithDepth;

  return (
    <div className="flex items-stretch">
      {displayRounds.map(({ round, depth }, displayIndex) => {
        const blockHeight = BASE_MATCH_HEIGHT * 2 ** depth;
        const isFirstInDisplay = displayIndex === 0;
        const isLastInDisplay = displayIndex === displayRounds.length - 1;

        return (
          <div key={round.matches.join("-")} className="flex items-stretch">
            {side === "left" && !isFirstInDisplay && (
              <BracketJoinLines height={blockHeight} side="left" />
            )}

            <div className="flex flex-col">
              {round.matches.map((matchNumber) => (
                <div
                  key={matchNumber}
                  className="flex items-center justify-center px-0.5"
                  style={{ height: blockHeight }}
                >
                  <BracketMatchPair
                    match={matchByNumber.get(matchNumber)}
                    size={round.size}
                  />
                </div>
              ))}
            </div>

            {side === "right" && !isLastInDisplay && (
              <BracketJoinLines height={blockHeight} side="right" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BracketCenter({
  finalMatch,
  thirdPlaceMatch,
}: {
  finalMatch: BracketMatchData | undefined;
  thirdPlaceMatch: BracketMatchData | undefined;
}) {
  const sfBlockHeight = BASE_MATCH_HEIGHT * 8;
  const finalWinner = finalMatch ? getWinnerSide(finalMatch) : null;

  return (
    <div className="flex flex-col items-center justify-center px-1 shrink-0">
      <div
        className="relative flex items-center justify-center gap-2 md:gap-3"
        style={{ height: sfBlockHeight }}
      >
        {finalMatch ? (
          <>
            <BracketTeamSlot
              team={finalMatch.homeTeam}
              flag={finalMatch.homeFlag}
              size="final"
              isWinner={finalWinner === "home"}
              matchId={finalMatch.id}
            />
            <div className="relative flex flex-col items-center mx-1">
              <div
                className="absolute inset-0 -m-8 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,214,10,0.35) 0%, transparent 70%)",
                }}
              />
              <Image
                src="/logo-fifa.png"
                alt="Taça FIFA"
                width={72}
                height={72}
                className="relative h-12 w-auto md:h-[72px] drop-shadow-[0_0_24px_rgba(255,214,10,0.35)]"
              />
              <span className="relative mt-1 text-[9px] uppercase tracking-widest text-[#FFD60A]/60 font-[family-name:var(--font-oswald)]">
                Final
              </span>
            </div>
            <BracketTeamSlot
              team={finalMatch.awayTeam}
              flag={finalMatch.awayFlag}
              size="final"
              isWinner={finalWinner === "away"}
              matchId={finalMatch.id}
            />
          </>
        ) : (
          <div className="relative flex flex-col items-center">
            <Image
              src="/logo-fifa.png"
              alt="Taça FIFA"
              width={72}
              height={72}
              className="h-12 w-auto md:h-[72px] opacity-60"
            />
          </div>
        )}
      </div>

      {thirdPlaceMatch && (
        <div className="mt-6 flex flex-col items-center gap-1.5 pb-2">
          <span className="text-[10px] uppercase tracking-wider text-[#94B8D8] font-[family-name:var(--font-oswald)]">
            3º lugar
          </span>
          <BracketMatchPair match={thirdPlaceMatch} size="md" />
        </div>
      )}
    </div>
  );
}

export function KnockoutBracket({ matches }: KnockoutBracketProps) {
  const matchByNumber = new Map(matches.map((m) => [m.matchNumber, m]));
  const finalMatch = matchByNumber.get(FINAL_MATCH_NUMBER);
  const thirdPlaceMatch = matchByNumber.get(THIRD_PLACE_MATCH_NUMBER);

  return (
    <div className="relative rounded-2xl border border-[#2A4A7A]/80 bg-[#0A1628]/90 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "url('/background-app.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative px-4 pt-6 pb-4 text-center">
        <h2 className="font-[family-name:var(--font-oswald)] text-2xl md:text-3xl font-bold uppercase tracking-[0.2em] text-[#FFD60A]">
          Mata-Mata
        </h2>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#FFD60A]/50" />
          <span className="text-[#FFD60A]/70 text-xs">✦</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#FFD60A]/50" />
        </div>
        <p className="mt-2 text-[11px] text-[#94B8D8]">
          Toque em um time para ver o jogo · borda dourada = vencedor
        </p>
      </div>

      <div className="relative overflow-x-auto pb-6 px-2 md:px-4">
        <div className="flex items-center justify-center min-w-[720px] md:min-w-[960px] mx-auto py-4">
          <BracketHalf
            rounds={LEFT_BRACKET_ROUNDS}
            matchByNumber={matchByNumber}
            side="left"
          />

          <BracketJoinLines
            height={BASE_MATCH_HEIGHT * 8}
            side="left"
            width={18}
          />

          <BracketCenter
            finalMatch={finalMatch}
            thirdPlaceMatch={thirdPlaceMatch}
          />

          <BracketJoinLines
            height={BASE_MATCH_HEIGHT * 8}
            side="right"
            width={18}
          />

          <BracketHalf
            rounds={RIGHT_BRACKET_ROUNDS}
            matchByNumber={matchByNumber}
            side="right"
          />
        </div>
      </div>
    </div>
  );
}

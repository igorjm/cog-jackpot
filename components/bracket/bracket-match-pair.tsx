import {
  getWinnerSide,
  type BracketMatchData,
  type BracketSlotSize,
} from "@/lib/bracket-tree";
import { BracketTeamSlot } from "./bracket-team-slot";

interface BracketMatchPairProps {
  match: BracketMatchData | undefined;
  size: BracketSlotSize;
}

export function BracketMatchPair({ match, size }: BracketMatchPairProps) {
  if (!match) {
    return (
      <div className="flex flex-col justify-center gap-1 opacity-30">
        <BracketTeamSlot team="?" flag="xx" size={size} />
        <BracketTeamSlot team="?" flag="xx" size={size} />
      </div>
    );
  }

  const winner = getWinnerSide(match);

  return (
    <div className="flex flex-col justify-center gap-1">
      <BracketTeamSlot
        team={match.homeTeam}
        flag={match.homeFlag}
        size={size}
        isWinner={winner === "home"}
        matchId={match.id}
      />
      <BracketTeamSlot
        team={match.awayTeam}
        flag={match.awayFlag}
        size={size}
        isWinner={winner === "away"}
        matchId={match.id}
      />
    </div>
  );
}

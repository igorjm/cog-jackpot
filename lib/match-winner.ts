export type WinnerSide = "home" | "away";

export function resolveMatchWinnerSide(match: {
  homeScore: number | null;
  awayScore: number | null;
  winnerSide?: WinnerSide | null;
}): WinnerSide | null {
  if (match.homeScore === null || match.awayScore === null) return null;
  if (match.homeScore > match.awayScore) return "home";
  if (match.awayScore > match.homeScore) return "away";
  return match.winnerSide ?? null;
}

export function mapApiWinner(
  winner: string | null | undefined
): WinnerSide | undefined {
  if (winner === "HOME_TEAM") return "home";
  if (winner === "AWAY_TEAM") return "away";
  return undefined;
}

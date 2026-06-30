/** FIFA 2026 bracket layout — left half converges to SF 101, right half to SF 102. */

export type BracketSlotSize = "sm" | "md" | "lg" | "xl" | "final";

import { resolveMatchWinnerSide, type WinnerSide } from "./match-winner";

export interface BracketMatchData {
  id: string;
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  homeScore: number | null;
  awayScore: number | null;
  winnerSide?: WinnerSide | null;
}

export interface BracketRoundDef {
  matches: number[];
  size: BracketSlotSize;
}

export const LEFT_BRACKET_ROUNDS: BracketRoundDef[] = [
  { matches: [73, 75, 74, 77, 81, 82, 83, 84], size: "sm" },
  { matches: [90, 89, 94, 93], size: "md" },
  { matches: [97, 98], size: "lg" },
  { matches: [101], size: "xl" },
];

export const RIGHT_BRACKET_ROUNDS: BracketRoundDef[] = [
  { matches: [76, 78, 79, 80, 86, 88, 85, 87], size: "sm" },
  { matches: [91, 92, 95, 96], size: "md" },
  { matches: [99, 100], size: "lg" },
  { matches: [102], size: "xl" },
];

export const FINAL_MATCH_NUMBER = 104;
export const THIRD_PLACE_MATCH_NUMBER = 103;
export const KNOCKOUT_MATCH_NUMBER_MIN = 73;

export const BASE_MATCH_HEIGHT = 56;

export function getWinnerSide(
  match: BracketMatchData
): "home" | "away" | null {
  return resolveMatchWinnerSide(match);
}

export function shortPlaceholderLabel(team: string, flag: string): string {
  if (flag !== "xx") return "";

  const group = team.match(/^([12])º Grupo ([A-L])$/);
  if (group) return `${group[1]}${group[2]}`;

  if (team.startsWith("3º")) {
    const letters = team.replace(/^3º\s*/, "").replace(/\s/g, "");
    return letters.length >= 2 ? letters.slice(0, 2) : "3º";
  }

  const win = team.match(/^Venc\. Jogo (\d+)$/);
  if (win) return `V${win[1]}`;

  const lose = team.match(/^Perd\. Jogo (\d+)$/);
  if (lose) return `P${lose[1]}`;

  return team.slice(0, 3).toUpperCase();
}

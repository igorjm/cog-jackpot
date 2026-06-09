import { Phase } from "@prisma/client";

export const POINTS = {
  EXACT_SCORE: 10,
  WINNER_PLUS_ONE_SCORE: 7,
  CORRECT_WINNER: 5,
  CORRECT_DRAW: 5,
  ONE_SCORE_CORRECT: 2,
  NONE: 0,
} as const;

export const MULTIPLIERS: Record<Phase, number> = {
  FRIENDLY: 1,
  GROUP: 1,
  ROUND_OF_32: 1.25,
  ROUND_OF_16: 1.5,
  QUARTER_FINAL: 2,
  SEMI_FINAL: 2.5,
  THIRD_PLACE: 2,
  FINAL: 3,
};

export const BONUS_POINTS = 3;

export const PREDICTION_POINTS = 10;

export const DEADLINE_HOURS_BEFORE = 1;

export const PHASE_LABELS: Record<Phase, string> = {
  FRIENDLY: "Jogo Especial",
  GROUP: "Fase de Grupos",
  ROUND_OF_32: "32 Avos de Final",
  ROUND_OF_16: "Oitavas de Final",
  QUARTER_FINAL: "Quartas de Final",
  SEMI_FINAL: "Semifinais",
  THIRD_PLACE: "3º Lugar",
  FINAL: "Final",
};

export const PRIZE_DISTRIBUTION = {
  first: 0.6,
  second: 0.25,
  third: 0.15,
};

import { POINTS } from "./constants";

interface ScoreInput {
  homeScore: number;
  awayScore: number;
}

interface ScoringResult {
  points: number;
  scenario: number;
}

export function calculatePoints(
  bet: ScoreInput,
  result: ScoreInput
): ScoringResult {
  // Scenario 1: Exact score
  if (bet.homeScore === result.homeScore && bet.awayScore === result.awayScore) {
    return { points: POINTS.EXACT_SCORE, scenario: 1 };
  }

  const betWinner = getWinner(bet);
  const resultWinner = getWinner(result);

  const homeScoreCorrect = bet.homeScore === result.homeScore;
  const awayScoreCorrect = bet.awayScore === result.awayScore;
  const oneScoreCorrect = homeScoreCorrect || awayScoreCorrect;

  // Scenario 2: Correct winner + 1 correct score
  if (betWinner === resultWinner && betWinner !== "draw" && oneScoreCorrect) {
    return { points: POINTS.WINNER_PLUS_ONE_SCORE, scenario: 2 };
  }

  // Scenario 3: Correct winner only
  if (betWinner === resultWinner && betWinner !== "draw") {
    return { points: POINTS.CORRECT_WINNER, scenario: 3 };
  }

  // Scenario 4: Correct draw (but not exact score - already handled)
  if (betWinner === "draw" && resultWinner === "draw") {
    return { points: POINTS.CORRECT_DRAW, scenario: 4 };
  }

  // Scenario 5: One score correct but wrong winner
  if (oneScoreCorrect) {
    return { points: POINTS.ONE_SCORE_CORRECT, scenario: 5 };
  }

  // Scenario 6: Everything wrong
  return { points: POINTS.NONE, scenario: 6 };
}

function getWinner(score: ScoreInput): "home" | "away" | "draw" {
  if (score.homeScore > score.awayScore) return "home";
  if (score.homeScore < score.awayScore) return "away";
  return "draw";
}

export function calculateFinalPoints(
  rawPoints: number,
  multiplier: number
): number {
  return Math.round(rawPoints * multiplier);
}

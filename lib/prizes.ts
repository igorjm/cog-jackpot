import { PRIZE_DISTRIBUTION } from "./constants";

export function getEntryFee(): number {
  return parseFloat(process.env.NEXT_PUBLIC_ENTRY_FEE ?? "50");
}

export interface PrizePool {
  total: number;
  first: number;
  second: number;
  third: number;
}

export function calculatePrizePool(approvedPlayerCount: number): PrizePool {
  const total = approvedPlayerCount * getEntryFee();

  return {
    total,
    first: total * PRIZE_DISTRIBUTION.first,
    second: total * PRIZE_DISTRIBUTION.second,
    third: total * PRIZE_DISTRIBUTION.third,
  };
}

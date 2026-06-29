import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const FLAGCDN_WIDTHS = [20, 40, 80, 160, 320, 640] as const;

function snapFlagcdnWidth(width: number): number {
  return FLAGCDN_WIDTHS.reduce((best, candidate) =>
    Math.abs(candidate - width) < Math.abs(best - width) ? candidate : best
  );
}

export function getFlagSrc(flag: string, width = 80): string {
  // Club logos: 3+ chars without dash (e.g. "psg", "arsenal")
  // Country flags: 2 chars or contains dash (e.g. "br", "gb-eng")
  if (flag.length > 2 && !flag.includes("-")) {
    return `/uefa/${flag.toLowerCase()}.png`;
  }
  return `https://flagcdn.com/w${snapFlagcdnWidth(width)}/${flag.toLowerCase()}.png`;
}

export function isClubFlag(flag: string): boolean {
  return flag.length > 2 && !flag.includes("-");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Format bet/ranking points — integers as-is, decimals up to 2 (pt-BR). */
export function formatPoints(value: number): string {
  const normalized = Math.round(value * 100) / 100;
  const hasFraction = Math.abs(normalized - Math.trunc(normalized)) > 1e-9;

  if (!hasFraction) {
    return String(Math.trunc(normalized));
  }

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(normalized);
}

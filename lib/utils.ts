import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getFlagSrc(flag: string, width = 80): string {
  // Club logos: 3+ chars without dash (e.g. "psg", "arsenal")
  // Country flags: 2 chars or contains dash (e.g. "br", "gb-eng")
  if (flag.length > 2 && !flag.includes("-")) {
    return `/uefa/${flag.toLowerCase()}.png`;
  }
  return `https://flagcdn.com/w${width}/${flag.toLowerCase()}.png`;
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

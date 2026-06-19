export type Confederation =
  | "UEFA"
  | "CAF"
  | "AFC"
  | "CONCACAF"
  | "CONMEBOL"
  | "OFC"
  | "OTHER";

export const CONFEDERATION_LABELS: Record<Confederation, string> = {
  UEFA: "UEFA",
  CAF: "CAF",
  AFC: "AFC",
  CONCACAF: "CONCACAF",
  CONMEBOL: "CONMEBOL",
  OFC: "OFC",
  OTHER: "Outros",
};

/** Display order for confederation charts */
export const CONFEDERATION_ORDER: Confederation[] = [
  "UEFA",
  "CAF",
  "AFC",
  "CONCACAF",
  "CONMEBOL",
  "OFC",
];

const FLAG_TO_CONFED: Record<string, Confederation> = {
  // UEFA
  cz: "UEFA",
  ch: "UEFA",
  ba: "UEFA",
  "gb-sct": "UEFA",
  tr: "UEFA",
  de: "UEFA",
  nl: "UEFA",
  se: "UEFA",
  be: "UEFA",
  es: "UEFA",
  fr: "UEFA",
  no: "UEFA",
  at: "UEFA",
  pt: "UEFA",
  hr: "UEFA",
  "gb-eng": "UEFA",
  // CAF
  za: "CAF",
  ma: "CAF",
  ci: "CAF",
  tn: "CAF",
  eg: "CAF",
  sn: "CAF",
  dz: "CAF",
  cd: "CAF",
  gh: "CAF",
  cv: "CAF",
  // AFC
  kr: "AFC",
  qa: "AFC",
  jp: "AFC",
  ir: "AFC",
  sa: "AFC",
  jo: "AFC",
  uz: "AFC",
  iq: "AFC",
  // CONCACAF
  mx: "CONCACAF",
  ca: "CONCACAF",
  ht: "CONCACAF",
  us: "CONCACAF",
  cw: "CONCACAF",
  pa: "CONCACAF",
  // CONMEBOL
  br: "CONMEBOL",
  py: "CONMEBOL",
  ec: "CONMEBOL",
  uy: "CONMEBOL",
  ar: "CONMEBOL",
  co: "CONMEBOL",
  // OFC
  au: "OFC",
  nz: "OFC",
};

export function getConfederation(flag: string): Confederation | null {
  if (!flag || flag === "xx") return null;
  return FLAG_TO_CONFED[flag.toLowerCase()] ?? "OTHER";
}

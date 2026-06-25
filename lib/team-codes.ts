/** FIFA 3-letter codes (football-data.org) → our flag codes */
export const FIFA_TLA_TO_FLAG: Record<string, string> = {
  MEX: "mx",
  RSA: "za",
  KOR: "kr",
  CZE: "cz",
  CAN: "ca",
  BIH: "ba",
  QAT: "qa",
  SUI: "ch",
  BRA: "br",
  MAR: "ma",
  HAI: "ht",
  SCO: "gb-sct",
  USA: "us",
  PAR: "py",
  AUS: "au",
  TUR: "tr",
  GER: "de",
  CUW: "cw",
  CIV: "ci",
  ECU: "ec",
  NED: "nl",
  JPN: "jp",
  SWE: "se",
  TUN: "tn",
  BEL: "be",
  EGY: "eg",
  IRN: "ir",
  NZL: "nz",
  ESP: "es",
  CPV: "cv",
  KSA: "sa",
  SAU: "sa",
  URU: "uy",
  FRA: "fr",
  SEN: "sn",
  IRQ: "iq",
  NOR: "no",
  ARG: "ar",
  ALG: "dz",
  AUT: "at",
  JOR: "jo",
  POR: "pt",
  COD: "cd",
  UZB: "uz",
  COL: "co",
  ENG: "gb-eng",
  CRO: "hr",
  GHA: "gh",
  PAN: "pa",
};

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** API team names (English / Portuguese) → our flag codes */
const NAME_TO_FLAG: Record<string, string> = {
  mexico: "mx",
  "south africa": "za",
  "korea republic": "kr",
  "south korea": "kr",
  "czech republic": "cz",
  czechia: "cz",
  canada: "ca",
  "bosnia and herzegovina": "ba",
  "bosnia-herzegovina": "ba",
  qatar: "qa",
  switzerland: "ch",
  brazil: "br",
  morocco: "ma",
  haiti: "ht",
  scotland: "gb-sct",
  "united states": "us",
  usa: "us",
  paraguay: "py",
  australia: "au",
  turkey: "tr",
  turkiye: "tr",
  germany: "de",
  curacao: "cw",
  "cote d'ivoire": "ci",
  "ivory coast": "ci",
  ecuador: "ec",
  netherlands: "nl",
  japan: "jp",
  sweden: "se",
  tunisia: "tn",
  belgium: "be",
  egypt: "eg",
  iran: "ir",
  "new zealand": "nz",
  spain: "es",
  "cape verde": "cv",
  "saudi arabia": "sa",
  uruguay: "uy",
  france: "fr",
  senegal: "sn",
  iraq: "iq",
  norway: "no",
  argentina: "ar",
  algeria: "dz",
  austria: "at",
  jordan: "jo",
  portugal: "pt",
  "dr congo": "cd",
  "congo dr": "cd",
  uzbekistan: "uz",
  colombia: "co",
  england: "gb-eng",
  croatia: "hr",
  ghana: "gh",
  panama: "pa",
  "africa do sul": "za",
  "coreia do sul": "kr",
  "republica tcheca": "cz",
  "bosnia e herzegovina": "ba",
  catar: "qa",
  suica: "ch",
  brasil: "br",
  marrocos: "ma",
  escocia: "gb-sct",
  "estados unidos": "us",
  paraguai: "py",
  turquia: "tr",
  alemanha: "de",
  "costa do marfim": "ci",
  equador: "ec",
  holanda: "nl",
  japao: "jp",
  suecia: "se",
  belgica: "be",
  egito: "eg",
  ira: "ir",
  "nova zelandia": "nz",
  espanha: "es",
  "cabo verde": "cv",
  "arabia saudita": "sa",
  uruguai: "uy",
  franca: "fr",
  iraque: "iq",
  noruega: "no",
  argelia: "dz",
  jordania: "jo",
  "rd congo": "cd",
  uzbequistao: "uz",
  inglaterra: "gb-eng",
  croacia: "hr",
  gana: "gh",
};

export function resolveFlagCode(input: { tla?: string; name?: string }): string | null {
  if (input.tla) {
    const fromTla = FIFA_TLA_TO_FLAG[input.tla.toUpperCase()];
    if (fromTla) return fromTla;
  }
  if (input.name) {
    const fromName = NAME_TO_FLAG[normalizeName(input.name)];
    if (fromName) return fromName;
  }
  return null;
}

export function teamsMatchFlags(
  apiHome: { tla?: string; name?: string },
  apiAway: { tla?: string; name?: string },
  dbHomeFlag: string,
  dbAwayFlag: string
): boolean {
  const homeFlag = resolveFlagCode(apiHome);
  const awayFlag = resolveFlagCode(apiAway);
  return homeFlag === dbHomeFlag && awayFlag === dbAwayFlag;
}

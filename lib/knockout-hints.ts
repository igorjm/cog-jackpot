// Maps group positions to their possible teams for knockout match hints

const GROUPS: Record<string, string[]> = {
  A: ["México", "Áfr. do Sul", "Coreia do Sul", "Rep. Tcheca"],
  B: ["Canadá", "Bósnia", "Catar", "Suíça"],
  C: ["Brasil", "Marrocos", "Haiti", "Escócia"],
  D: ["EUA", "Paraguai", "Austrália", "Turquia"],
  E: ["Alemanha", "Curaçao", "C. do Marfim", "Equador"],
  F: ["Holanda", "Japão", "Suécia", "Tunísia"],
  G: ["Bélgica", "Egito", "Irã", "Nova Zelândia"],
  H: ["Espanha", "Cabo Verde", "Arábia Saud.", "Uruguai"],
  I: ["França", "Senegal", "Iraque", "Noruega"],
  J: ["Argentina", "Argélia", "Áustria", "Jordânia"],
  K: ["Portugal", "RD Congo", "Uzbequistão", "Colômbia"],
  L: ["Inglaterra", "Croácia", "Gana", "Panamá"],
};

// R32 match sources: matchNumber → which group positions feed it
const R32_SOURCES: Record<number, [string, string]> = {
  73: ["2º A", "2º B"],
  74: ["1º E", "3º ABCDF"],
  75: ["1º F", "2º C"],
  76: ["1º C", "2º F"],
  77: ["1º I", "3º CDFGH"],
  78: ["2º E", "2º I"],
  79: ["1º A", "3º CEFHI"],
  80: ["1º L", "3º EHIJK"],
  81: ["1º D", "3º BEFIJ"],
  82: ["1º G", "3º AEHIJ"],
  83: ["2º K", "2º L"],
  84: ["1º H", "2º J"],
  85: ["1º B", "3º EFGIJ"],
  86: ["1º J", "2º H"],
  87: ["1º K", "3º DEIJL"],
  88: ["2º D", "2º G"],
};

/**
 * Given a knockout team placeholder name, return a short hint of possible teams.
 * Returns null if no resolution is possible.
 */
export function getKnockoutHint(teamName: string): string | null {
  // Pattern: "1º Grupo A" or "2º Grupo A"
  const groupPosMatch = teamName.match(/^([12])º Grupo ([A-L])$/);
  if (groupPosMatch) {
    const group = groupPosMatch[2];
    const teams = GROUPS[group];
    if (teams) return teams.join(", ");
    return null;
  }

  // Pattern: "3º ABCDF" (best 3rd from those groups)
  const thirdMatch = teamName.match(/^3º ([A-L]+)$/);
  if (thirdMatch) {
    const groupLetters = thirdMatch[1].split("");
    const teams = groupLetters.flatMap((g) => GROUPS[g] || []);
    // Too many to list all, show group letters
    return `3º melhor dos grupos ${groupLetters.join(", ")}`;
  }

  // Pattern: "Venc. Jogo 74" — winner of a match
  const winnerMatch = teamName.match(/^Venc\. Jogo (\d+)$/);
  if (winnerMatch) {
    const matchNum = parseInt(winnerMatch[1]);
    const sources = R32_SOURCES[matchNum];
    if (sources) {
      // Resolve each source to group teams
      const hints = sources.map((s) => resolveSource(s));
      return hints.filter(Boolean).join(" ou ") || null;
    }
    return null;
  }

  // Pattern: "Perd. Jogo 101" — loser
  const loserMatch = teamName.match(/^Perd\. Jogo (\d+)$/);
  if (loserMatch) {
    return null; // Too complex to trace back
  }

  return null;
}

function resolveSource(source: string): string | null {
  // "1º A" → first place from group A
  const match = source.match(/^([12])º ([A-L])$/);
  if (match) {
    const group = match[2];
    const teams = GROUPS[group];
    if (teams) return teams.slice(0, 2).join("/"); // Show top 2 likely
  }

  // "3º ABCDF"
  const thirdMatch = source.match(/^3º ([A-L]+)$/);
  if (thirdMatch) {
    return `3º (${thirdMatch[1]})`;
  }

  return null;
}

/**
 * Returns possible teams for both sides of a R32 match by match number.
 */
export function getR32MatchHints(matchNumber: number): { home: string; away: string } | null {
  const sources = R32_SOURCES[matchNumber];
  if (!sources) return null;

  return {
    home: resolveSourceFull(sources[0]),
    away: resolveSourceFull(sources[1]),
  };
}

function resolveSourceFull(source: string): string {
  const match = source.match(/^([12])º ([A-L])$/);
  if (match) {
    const group = match[2];
    const teams = GROUPS[group];
    if (teams) return teams.join(", ");
  }

  const thirdMatch = source.match(/^3º ([A-L]+)$/);
  if (thirdMatch) {
    return `3º melhor: Gr. ${thirdMatch[1].split("").join(", ")}`;
  }

  return source;
}

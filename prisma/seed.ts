import { PrismaClient, Phase } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { hash } from "bcryptjs";
import { MULTIPLIERS } from "../lib/constants";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface MatchSeed {
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  phase: Phase;
  group?: string;
  matchNumber: number;
  matchDate: Date;
  venue: string;
  isLocked?: boolean;
}

// FIFA World Cup 2026 — Official draw Dec 5, 2025
// 48 teams, 12 groups of 4 — 104 total matches
// June 11 – July 19, 2026 | USA, Canada, Mexico

// ─── GROUP STAGE MATCHES (72) ──────────────────────────────────────────────────

const groupMatches: MatchSeed[] = [
  // ══════ GROUP A ══════
  // Matchday 1 — Jun 11
  { matchNumber: 1, homeTeam: "México", awayTeam: "África do Sul", homeFlag: "mx", awayFlag: "za", phase: "GROUP", group: "A", matchDate: new Date("2026-06-11T19:00:00Z"), venue: "Estadio Azteca, Cidade do México" },
  { matchNumber: 2, homeTeam: "Coreia do Sul", awayTeam: "República Tcheca", homeFlag: "kr", awayFlag: "cz", phase: "GROUP", group: "A", matchDate: new Date("2026-06-12T02:00:00Z"), venue: "Estadio Akron, Zapopan" },
  // Matchday 2 — Jun 18
  { matchNumber: 25, homeTeam: "República Tcheca", awayTeam: "África do Sul", homeFlag: "cz", awayFlag: "za", phase: "GROUP", group: "A", matchDate: new Date("2026-06-18T16:00:00Z"), venue: "Mercedes-Benz Stadium, Atlanta" },
  { matchNumber: 28, homeTeam: "México", awayTeam: "Coreia do Sul", homeFlag: "mx", awayFlag: "kr", phase: "GROUP", group: "A", matchDate: new Date("2026-06-19T01:00:00Z"), venue: "Estadio Akron, Zapopan" },
  // Matchday 3 — Jun 24
  { matchNumber: 53, homeTeam: "República Tcheca", awayTeam: "México", homeFlag: "cz", awayFlag: "mx", phase: "GROUP", group: "A", matchDate: new Date("2026-06-25T01:00:00Z"), venue: "Estadio Azteca, Cidade do México" },
  { matchNumber: 54, homeTeam: "África do Sul", awayTeam: "Coreia do Sul", homeFlag: "za", awayFlag: "kr", phase: "GROUP", group: "A", matchDate: new Date("2026-06-25T01:00:00Z"), venue: "Estadio BBVA, Guadalupe" },

  // ══════ GROUP B ══════
  // Matchday 1
  { matchNumber: 3, homeTeam: "Canadá", awayTeam: "Bósnia e Herzegovina", homeFlag: "ca", awayFlag: "ba", phase: "GROUP", group: "B", matchDate: new Date("2026-06-12T19:00:00Z"), venue: "BMO Field, Toronto" },
  { matchNumber: 8, homeTeam: "Catar", awayTeam: "Suíça", homeFlag: "qa", awayFlag: "ch", phase: "GROUP", group: "B", matchDate: new Date("2026-06-13T19:00:00Z"), venue: "Levi's Stadium, Santa Clara" },
  // Matchday 2 — Jun 18
  { matchNumber: 26, homeTeam: "Suíça", awayTeam: "Bósnia e Herzegovina", homeFlag: "ch", awayFlag: "ba", phase: "GROUP", group: "B", matchDate: new Date("2026-06-18T19:00:00Z"), venue: "SoFi Stadium, Inglewood" },
  { matchNumber: 27, homeTeam: "Canadá", awayTeam: "Catar", homeFlag: "ca", awayFlag: "qa", phase: "GROUP", group: "B", matchDate: new Date("2026-06-18T22:00:00Z"), venue: "BC Place, Vancouver" },
  // Matchday 3 — Jun 24
  { matchNumber: 51, homeTeam: "Suíça", awayTeam: "Canadá", homeFlag: "ch", awayFlag: "ca", phase: "GROUP", group: "B", matchDate: new Date("2026-06-24T19:00:00Z"), venue: "BC Place, Vancouver" },
  { matchNumber: 52, homeTeam: "Bósnia e Herzegovina", awayTeam: "Catar", homeFlag: "ba", awayFlag: "qa", phase: "GROUP", group: "B", matchDate: new Date("2026-06-24T19:00:00Z"), venue: "Lumen Field, Seattle" },

  // ══════ GROUP C ══════
  // Matchday 1 — Jun 13
  { matchNumber: 7, homeTeam: "Brasil", awayTeam: "Marrocos", homeFlag: "br", awayFlag: "ma", phase: "GROUP", group: "C", matchDate: new Date("2026-06-13T22:00:00Z"), venue: "MetLife Stadium, East Rutherford" },
  { matchNumber: 5, homeTeam: "Haiti", awayTeam: "Escócia", homeFlag: "ht", awayFlag: "gb-sct", phase: "GROUP", group: "C", matchDate: new Date("2026-06-14T01:00:00Z"), venue: "Gillette Stadium, Foxborough" },
  // Matchday 2 — Jun 19
  { matchNumber: 30, homeTeam: "Escócia", awayTeam: "Marrocos", homeFlag: "gb-sct", awayFlag: "ma", phase: "GROUP", group: "C", matchDate: new Date("2026-06-19T22:00:00Z"), venue: "Gillette Stadium, Foxborough" },
  { matchNumber: 29, homeTeam: "Brasil", awayTeam: "Haiti", homeFlag: "br", awayFlag: "ht", phase: "GROUP", group: "C", matchDate: new Date("2026-06-20T00:30:00Z"), venue: "Lincoln Financial Field, Filadélfia" },
  // Matchday 3 — Jun 24
  { matchNumber: 49, homeTeam: "Escócia", awayTeam: "Brasil", homeFlag: "gb-sct", awayFlag: "br", phase: "GROUP", group: "C", matchDate: new Date("2026-06-24T22:00:00Z"), venue: "Hard Rock Stadium, Miami Gardens" },
  { matchNumber: 50, homeTeam: "Marrocos", awayTeam: "Haiti", homeFlag: "ma", awayFlag: "ht", phase: "GROUP", group: "C", matchDate: new Date("2026-06-24T22:00:00Z"), venue: "Mercedes-Benz Stadium, Atlanta" },

  // ══════ GROUP D ══════
  // Matchday 1
  { matchNumber: 4, homeTeam: "Estados Unidos", awayTeam: "Paraguai", homeFlag: "us", awayFlag: "py", phase: "GROUP", group: "D", matchDate: new Date("2026-06-13T01:00:00Z"), venue: "SoFi Stadium, Inglewood" },
  { matchNumber: 6, homeTeam: "Austrália", awayTeam: "Turquia", homeFlag: "au", awayFlag: "tr", phase: "GROUP", group: "D", matchDate: new Date("2026-06-14T04:00:00Z"), venue: "BC Place, Vancouver" },
  // Matchday 2 — Jun 19
  { matchNumber: 32, homeTeam: "Estados Unidos", awayTeam: "Austrália", homeFlag: "us", awayFlag: "au", phase: "GROUP", group: "D", matchDate: new Date("2026-06-19T19:00:00Z"), venue: "Lumen Field, Seattle" },
  { matchNumber: 31, homeTeam: "Turquia", awayTeam: "Paraguai", homeFlag: "tr", awayFlag: "py", phase: "GROUP", group: "D", matchDate: new Date("2026-06-20T03:00:00Z"), venue: "Levi's Stadium, Santa Clara" },
  // Matchday 3 — Jun 25
  { matchNumber: 59, homeTeam: "Turquia", awayTeam: "Estados Unidos", homeFlag: "tr", awayFlag: "us", phase: "GROUP", group: "D", matchDate: new Date("2026-06-26T02:00:00Z"), venue: "SoFi Stadium, Inglewood" },
  { matchNumber: 60, homeTeam: "Paraguai", awayTeam: "Austrália", homeFlag: "py", awayFlag: "au", phase: "GROUP", group: "D", matchDate: new Date("2026-06-26T02:00:00Z"), venue: "Levi's Stadium, Santa Clara" },

  // ══════ GROUP E ══════
  // Matchday 1 — Jun 14
  { matchNumber: 10, homeTeam: "Alemanha", awayTeam: "Curaçao", homeFlag: "de", awayFlag: "cw", phase: "GROUP", group: "E", matchDate: new Date("2026-06-14T17:00:00Z"), venue: "NRG Stadium, Houston" },
  { matchNumber: 9, homeTeam: "Costa do Marfim", awayTeam: "Equador", homeFlag: "ci", awayFlag: "ec", phase: "GROUP", group: "E", matchDate: new Date("2026-06-14T23:00:00Z"), venue: "Lincoln Financial Field, Filadélfia" },
  // Matchday 2 — Jun 20
  { matchNumber: 33, homeTeam: "Alemanha", awayTeam: "Costa do Marfim", homeFlag: "de", awayFlag: "ci", phase: "GROUP", group: "E", matchDate: new Date("2026-06-20T20:00:00Z"), venue: "BMO Field, Toronto" },
  { matchNumber: 34, homeTeam: "Equador", awayTeam: "Curaçao", homeFlag: "ec", awayFlag: "cw", phase: "GROUP", group: "E", matchDate: new Date("2026-06-21T00:00:00Z"), venue: "Arrowhead Stadium, Kansas City" },
  // Matchday 3 — Jun 25
  { matchNumber: 55, homeTeam: "Curaçao", awayTeam: "Costa do Marfim", homeFlag: "cw", awayFlag: "ci", phase: "GROUP", group: "E", matchDate: new Date("2026-06-25T20:00:00Z"), venue: "Lincoln Financial Field, Filadélfia" },
  { matchNumber: 56, homeTeam: "Equador", awayTeam: "Alemanha", homeFlag: "ec", awayFlag: "de", phase: "GROUP", group: "E", matchDate: new Date("2026-06-25T20:00:00Z"), venue: "MetLife Stadium, East Rutherford" },

  // ══════ GROUP F ══════
  // Matchday 1 — Jun 14
  { matchNumber: 11, homeTeam: "Holanda", awayTeam: "Japão", homeFlag: "nl", awayFlag: "jp", phase: "GROUP", group: "F", matchDate: new Date("2026-06-14T20:00:00Z"), venue: "AT&T Stadium, Arlington" },
  { matchNumber: 12, homeTeam: "Suécia", awayTeam: "Tunísia", homeFlag: "se", awayFlag: "tn", phase: "GROUP", group: "F", matchDate: new Date("2026-06-15T02:00:00Z"), venue: "Estadio BBVA, Guadalupe" },
  // Matchday 2 — Jun 20
  { matchNumber: 35, homeTeam: "Holanda", awayTeam: "Suécia", homeFlag: "nl", awayFlag: "se", phase: "GROUP", group: "F", matchDate: new Date("2026-06-20T17:00:00Z"), venue: "NRG Stadium, Houston" },
  { matchNumber: 36, homeTeam: "Tunísia", awayTeam: "Japão", homeFlag: "tn", awayFlag: "jp", phase: "GROUP", group: "F", matchDate: new Date("2026-06-21T04:00:00Z"), venue: "Estadio BBVA, Guadalupe" },
  // Matchday 3 — Jun 25
  { matchNumber: 57, homeTeam: "Japão", awayTeam: "Suécia", homeFlag: "jp", awayFlag: "se", phase: "GROUP", group: "F", matchDate: new Date("2026-06-25T23:00:00Z"), venue: "AT&T Stadium, Arlington" },
  { matchNumber: 58, homeTeam: "Tunísia", awayTeam: "Holanda", homeFlag: "tn", awayFlag: "nl", phase: "GROUP", group: "F", matchDate: new Date("2026-06-25T23:00:00Z"), venue: "Arrowhead Stadium, Kansas City" },

  // ══════ GROUP G ══════
  // Matchday 1 — Jun 15
  { matchNumber: 16, homeTeam: "Bélgica", awayTeam: "Egito", homeFlag: "be", awayFlag: "eg", phase: "GROUP", group: "G", matchDate: new Date("2026-06-15T19:00:00Z"), venue: "Lumen Field, Seattle" },
  { matchNumber: 15, homeTeam: "Irã", awayTeam: "Nova Zelândia", homeFlag: "ir", awayFlag: "nz", phase: "GROUP", group: "G", matchDate: new Date("2026-06-16T01:00:00Z"), venue: "SoFi Stadium, Inglewood" },
  // Matchday 2 — Jun 21
  { matchNumber: 39, homeTeam: "Bélgica", awayTeam: "Irã", homeFlag: "be", awayFlag: "ir", phase: "GROUP", group: "G", matchDate: new Date("2026-06-21T19:00:00Z"), venue: "SoFi Stadium, Inglewood" },
  { matchNumber: 40, homeTeam: "Nova Zelândia", awayTeam: "Egito", homeFlag: "nz", awayFlag: "eg", phase: "GROUP", group: "G", matchDate: new Date("2026-06-22T01:00:00Z"), venue: "BC Place, Vancouver" },
  // Matchday 3 — Jun 26
  { matchNumber: 63, homeTeam: "Egito", awayTeam: "Irã", homeFlag: "eg", awayFlag: "ir", phase: "GROUP", group: "G", matchDate: new Date("2026-06-27T03:00:00Z"), venue: "Lumen Field, Seattle" },
  { matchNumber: 64, homeTeam: "Nova Zelândia", awayTeam: "Bélgica", homeFlag: "nz", awayFlag: "be", phase: "GROUP", group: "G", matchDate: new Date("2026-06-27T03:00:00Z"), venue: "BC Place, Vancouver" },

  // ══════ GROUP H ══════
  // Matchday 1 — Jun 15
  { matchNumber: 14, homeTeam: "Espanha", awayTeam: "Cabo Verde", homeFlag: "es", awayFlag: "cv", phase: "GROUP", group: "H", matchDate: new Date("2026-06-15T16:00:00Z"), venue: "Mercedes-Benz Stadium, Atlanta" },
  { matchNumber: 13, homeTeam: "Arábia Saudita", awayTeam: "Uruguai", homeFlag: "sa", awayFlag: "uy", phase: "GROUP", group: "H", matchDate: new Date("2026-06-15T22:00:00Z"), venue: "Hard Rock Stadium, Miami Gardens" },
  // Matchday 2 — Jun 21
  { matchNumber: 38, homeTeam: "Espanha", awayTeam: "Arábia Saudita", homeFlag: "es", awayFlag: "sa", phase: "GROUP", group: "H", matchDate: new Date("2026-06-21T16:00:00Z"), venue: "Mercedes-Benz Stadium, Atlanta" },
  { matchNumber: 37, homeTeam: "Uruguai", awayTeam: "Cabo Verde", homeFlag: "uy", awayFlag: "cv", phase: "GROUP", group: "H", matchDate: new Date("2026-06-21T22:00:00Z"), venue: "Hard Rock Stadium, Miami Gardens" },
  // Matchday 3 — Jun 26
  { matchNumber: 65, homeTeam: "Cabo Verde", awayTeam: "Arábia Saudita", homeFlag: "cv", awayFlag: "sa", phase: "GROUP", group: "H", matchDate: new Date("2026-06-27T00:00:00Z"), venue: "NRG Stadium, Houston" },
  { matchNumber: 66, homeTeam: "Uruguai", awayTeam: "Espanha", homeFlag: "uy", awayFlag: "es", phase: "GROUP", group: "H", matchDate: new Date("2026-06-27T00:00:00Z"), venue: "Estadio Akron, Zapopan" },

  // ══════ GROUP I ══════
  // Matchday 1 — Jun 16
  { matchNumber: 17, homeTeam: "França", awayTeam: "Senegal", homeFlag: "fr", awayFlag: "sn", phase: "GROUP", group: "I", matchDate: new Date("2026-06-16T19:00:00Z"), venue: "MetLife Stadium, East Rutherford" },
  { matchNumber: 18, homeTeam: "Iraque", awayTeam: "Noruega", homeFlag: "iq", awayFlag: "no", phase: "GROUP", group: "I", matchDate: new Date("2026-06-16T22:00:00Z"), venue: "Gillette Stadium, Foxborough" },
  // Matchday 2 — Jun 22
  { matchNumber: 42, homeTeam: "França", awayTeam: "Iraque", homeFlag: "fr", awayFlag: "iq", phase: "GROUP", group: "I", matchDate: new Date("2026-06-22T21:00:00Z"), venue: "Lincoln Financial Field, Filadélfia" },
  { matchNumber: 41, homeTeam: "Noruega", awayTeam: "Senegal", homeFlag: "no", awayFlag: "sn", phase: "GROUP", group: "I", matchDate: new Date("2026-06-23T00:00:00Z"), venue: "MetLife Stadium, East Rutherford" },
  // Matchday 3 — Jun 26
  { matchNumber: 61, homeTeam: "Noruega", awayTeam: "França", homeFlag: "no", awayFlag: "fr", phase: "GROUP", group: "I", matchDate: new Date("2026-06-26T19:00:00Z"), venue: "Gillette Stadium, Foxborough" },
  { matchNumber: 62, homeTeam: "Senegal", awayTeam: "Iraque", homeFlag: "sn", awayFlag: "iq", phase: "GROUP", group: "I", matchDate: new Date("2026-06-26T19:00:00Z"), venue: "BMO Field, Toronto" },

  // ══════ GROUP J ══════
  // Matchday 1 — Jun 16
  { matchNumber: 19, homeTeam: "Argentina", awayTeam: "Argélia", homeFlag: "ar", awayFlag: "dz", phase: "GROUP", group: "J", matchDate: new Date("2026-06-17T01:00:00Z"), venue: "Arrowhead Stadium, Kansas City" },
  { matchNumber: 20, homeTeam: "Áustria", awayTeam: "Jordânia", homeFlag: "at", awayFlag: "jo", phase: "GROUP", group: "J", matchDate: new Date("2026-06-17T04:00:00Z"), venue: "Levi's Stadium, Santa Clara" },
  // Matchday 2 — Jun 22
  { matchNumber: 43, homeTeam: "Argentina", awayTeam: "Áustria", homeFlag: "ar", awayFlag: "at", phase: "GROUP", group: "J", matchDate: new Date("2026-06-22T17:00:00Z"), venue: "AT&T Stadium, Arlington" },
  { matchNumber: 44, homeTeam: "Jordânia", awayTeam: "Argélia", homeFlag: "jo", awayFlag: "dz", phase: "GROUP", group: "J", matchDate: new Date("2026-06-23T03:00:00Z"), venue: "Levi's Stadium, Santa Clara" },
  // Matchday 3 — Jun 27
  { matchNumber: 69, homeTeam: "Argélia", awayTeam: "Áustria", homeFlag: "dz", awayFlag: "at", phase: "GROUP", group: "J", matchDate: new Date("2026-06-28T02:00:00Z"), venue: "Arrowhead Stadium, Kansas City" },
  { matchNumber: 70, homeTeam: "Jordânia", awayTeam: "Argentina", homeFlag: "jo", awayFlag: "ar", phase: "GROUP", group: "J", matchDate: new Date("2026-06-28T02:00:00Z"), venue: "AT&T Stadium, Arlington" },

  // ══════ GROUP K ══════
  // Matchday 1 — Jun 17
  { matchNumber: 23, homeTeam: "Portugal", awayTeam: "RD Congo", homeFlag: "pt", awayFlag: "cd", phase: "GROUP", group: "K", matchDate: new Date("2026-06-17T17:00:00Z"), venue: "NRG Stadium, Houston" },
  { matchNumber: 24, homeTeam: "Uzbequistão", awayTeam: "Colômbia", homeFlag: "uz", awayFlag: "co", phase: "GROUP", group: "K", matchDate: new Date("2026-06-18T02:00:00Z"), venue: "Estadio Azteca, Cidade do México" },
  // Matchday 2 — Jun 23
  { matchNumber: 47, homeTeam: "Portugal", awayTeam: "Uzbequistão", homeFlag: "pt", awayFlag: "uz", phase: "GROUP", group: "K", matchDate: new Date("2026-06-23T17:00:00Z"), venue: "NRG Stadium, Houston" },
  { matchNumber: 48, homeTeam: "Colômbia", awayTeam: "RD Congo", homeFlag: "co", awayFlag: "cd", phase: "GROUP", group: "K", matchDate: new Date("2026-06-24T02:00:00Z"), venue: "Estadio Akron, Zapopan" },
  // Matchday 3 — Jun 27
  { matchNumber: 71, homeTeam: "Colômbia", awayTeam: "Portugal", homeFlag: "co", awayFlag: "pt", phase: "GROUP", group: "K", matchDate: new Date("2026-06-27T23:30:00Z"), venue: "Hard Rock Stadium, Miami Gardens" },
  { matchNumber: 72, homeTeam: "RD Congo", awayTeam: "Uzbequistão", homeFlag: "cd", awayFlag: "uz", phase: "GROUP", group: "K", matchDate: new Date("2026-06-27T23:30:00Z"), venue: "Mercedes-Benz Stadium, Atlanta" },

  // ══════ GROUP L ══════
  // Matchday 1 — Jun 17
  { matchNumber: 22, homeTeam: "Inglaterra", awayTeam: "Croácia", homeFlag: "gb-eng", awayFlag: "hr", phase: "GROUP", group: "L", matchDate: new Date("2026-06-17T20:00:00Z"), venue: "AT&T Stadium, Arlington" },
  { matchNumber: 21, homeTeam: "Gana", awayTeam: "Panamá", homeFlag: "gh", awayFlag: "pa", phase: "GROUP", group: "L", matchDate: new Date("2026-06-17T23:00:00Z"), venue: "BMO Field, Toronto" },
  // Matchday 2 — Jun 23
  { matchNumber: 45, homeTeam: "Inglaterra", awayTeam: "Gana", homeFlag: "gb-eng", awayFlag: "gh", phase: "GROUP", group: "L", matchDate: new Date("2026-06-23T20:00:00Z"), venue: "Gillette Stadium, Foxborough" },
  { matchNumber: 46, homeTeam: "Panamá", awayTeam: "Croácia", homeFlag: "pa", awayFlag: "hr", phase: "GROUP", group: "L", matchDate: new Date("2026-06-23T23:00:00Z"), venue: "BMO Field, Toronto" },
  // Matchday 3 — Jun 27
  { matchNumber: 67, homeTeam: "Panamá", awayTeam: "Inglaterra", homeFlag: "pa", awayFlag: "gb-eng", phase: "GROUP", group: "L", matchDate: new Date("2026-06-27T21:00:00Z"), venue: "MetLife Stadium, East Rutherford" },
  { matchNumber: 68, homeTeam: "Croácia", awayTeam: "Gana", homeFlag: "hr", awayFlag: "gh", phase: "GROUP", group: "L", matchDate: new Date("2026-06-27T21:00:00Z"), venue: "Lincoln Financial Field, Filadélfia" },
];

// ─── KNOCKOUT STAGE MATCHES (32) ───────────────────────────────────────────────
// Teams TBD — locked until group stage concludes

const knockoutMatches: MatchSeed[] = [
  // Round of 32 (16 matches)
  { matchNumber: 73, homeTeam: "2º Grupo A", awayTeam: "2º Grupo B", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-06-28T19:00:00Z"), venue: "SoFi Stadium, Inglewood", isLocked: true },
  { matchNumber: 74, homeTeam: "1º Grupo E", awayTeam: "3º ABCDF", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-06-29T20:30:00Z"), venue: "Gillette Stadium, Foxborough", isLocked: true },
  { matchNumber: 75, homeTeam: "1º Grupo F", awayTeam: "2º Grupo C", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-06-30T01:00:00Z"), venue: "Estadio BBVA, Guadalupe", isLocked: true },
  { matchNumber: 76, homeTeam: "1º Grupo C", awayTeam: "2º Grupo F", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-06-29T17:00:00Z"), venue: "NRG Stadium, Houston", isLocked: true },
  { matchNumber: 77, homeTeam: "1º Grupo I", awayTeam: "3º CDFGH", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-06-30T21:00:00Z"), venue: "MetLife Stadium, East Rutherford", isLocked: true },
  { matchNumber: 78, homeTeam: "2º Grupo E", awayTeam: "2º Grupo I", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-06-30T17:00:00Z"), venue: "AT&T Stadium, Arlington", isLocked: true },
  { matchNumber: 79, homeTeam: "1º Grupo A", awayTeam: "3º CEFHI", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-07-01T01:00:00Z"), venue: "Estadio Azteca, Cidade do México", isLocked: true },
  { matchNumber: 80, homeTeam: "1º Grupo L", awayTeam: "3º EHIJK", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-07-01T16:00:00Z"), venue: "Mercedes-Benz Stadium, Atlanta", isLocked: true },
  { matchNumber: 81, homeTeam: "1º Grupo D", awayTeam: "3º BEFIJ", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-07-02T00:00:00Z"), venue: "Levi's Stadium, Santa Clara", isLocked: true },
  { matchNumber: 82, homeTeam: "1º Grupo G", awayTeam: "3º AEHIJ", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-07-01T20:00:00Z"), venue: "Lumen Field, Seattle", isLocked: true },
  { matchNumber: 83, homeTeam: "2º Grupo K", awayTeam: "2º Grupo L", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-07-02T23:00:00Z"), venue: "BMO Field, Toronto", isLocked: true },
  { matchNumber: 84, homeTeam: "1º Grupo H", awayTeam: "2º Grupo J", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-07-02T19:00:00Z"), venue: "SoFi Stadium, Inglewood", isLocked: true },
  { matchNumber: 85, homeTeam: "1º Grupo B", awayTeam: "3º EFGIJ", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-07-03T03:00:00Z"), venue: "BC Place, Vancouver", isLocked: true },
  { matchNumber: 86, homeTeam: "1º Grupo J", awayTeam: "2º Grupo H", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-07-03T22:00:00Z"), venue: "Hard Rock Stadium, Miami Gardens", isLocked: true },
  { matchNumber: 87, homeTeam: "1º Grupo K", awayTeam: "3º DEIJL", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-07-04T01:30:00Z"), venue: "Arrowhead Stadium, Kansas City", isLocked: true },
  { matchNumber: 88, homeTeam: "2º Grupo D", awayTeam: "2º Grupo G", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_32", matchDate: new Date("2026-07-03T18:00:00Z"), venue: "AT&T Stadium, Arlington", isLocked: true },

  // Round of 16 (8 matches)
  { matchNumber: 89, homeTeam: "Venc. Jogo 74", awayTeam: "Venc. Jogo 77", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_16", matchDate: new Date("2026-07-04T21:00:00Z"), venue: "Lincoln Financial Field, Filadélfia", isLocked: true },
  { matchNumber: 90, homeTeam: "Venc. Jogo 73", awayTeam: "Venc. Jogo 75", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_16", matchDate: new Date("2026-07-04T17:00:00Z"), venue: "NRG Stadium, Houston", isLocked: true },
  { matchNumber: 91, homeTeam: "Venc. Jogo 76", awayTeam: "Venc. Jogo 78", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_16", matchDate: new Date("2026-07-05T20:00:00Z"), venue: "MetLife Stadium, East Rutherford", isLocked: true },
  { matchNumber: 92, homeTeam: "Venc. Jogo 79", awayTeam: "Venc. Jogo 80", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_16", matchDate: new Date("2026-07-06T00:00:00Z"), venue: "Estadio Azteca, Cidade do México", isLocked: true },
  { matchNumber: 93, homeTeam: "Venc. Jogo 83", awayTeam: "Venc. Jogo 84", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_16", matchDate: new Date("2026-07-06T19:00:00Z"), venue: "AT&T Stadium, Arlington", isLocked: true },
  { matchNumber: 94, homeTeam: "Venc. Jogo 81", awayTeam: "Venc. Jogo 82", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_16", matchDate: new Date("2026-07-07T00:00:00Z"), venue: "Lumen Field, Seattle", isLocked: true },
  { matchNumber: 95, homeTeam: "Venc. Jogo 86", awayTeam: "Venc. Jogo 88", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_16", matchDate: new Date("2026-07-07T16:00:00Z"), venue: "Mercedes-Benz Stadium, Atlanta", isLocked: true },
  { matchNumber: 96, homeTeam: "Venc. Jogo 85", awayTeam: "Venc. Jogo 87", homeFlag: "xx", awayFlag: "xx", phase: "ROUND_OF_16", matchDate: new Date("2026-07-07T20:00:00Z"), venue: "BC Place, Vancouver", isLocked: true },

  // Quarterfinals (4 matches)
  { matchNumber: 97, homeTeam: "Venc. Jogo 89", awayTeam: "Venc. Jogo 90", homeFlag: "xx", awayFlag: "xx", phase: "QUARTER_FINAL", matchDate: new Date("2026-07-09T20:00:00Z"), venue: "Gillette Stadium, Foxborough", isLocked: true },
  { matchNumber: 98, homeTeam: "Venc. Jogo 93", awayTeam: "Venc. Jogo 94", homeFlag: "xx", awayFlag: "xx", phase: "QUARTER_FINAL", matchDate: new Date("2026-07-10T19:00:00Z"), venue: "SoFi Stadium, Inglewood", isLocked: true },
  { matchNumber: 99, homeTeam: "Venc. Jogo 91", awayTeam: "Venc. Jogo 92", homeFlag: "xx", awayFlag: "xx", phase: "QUARTER_FINAL", matchDate: new Date("2026-07-11T21:00:00Z"), venue: "Hard Rock Stadium, Miami Gardens", isLocked: true },
  { matchNumber: 100, homeTeam: "Venc. Jogo 95", awayTeam: "Venc. Jogo 96", homeFlag: "xx", awayFlag: "xx", phase: "QUARTER_FINAL", matchDate: new Date("2026-07-12T01:00:00Z"), venue: "Arrowhead Stadium, Kansas City", isLocked: true },

  // Semifinals (2 matches)
  { matchNumber: 101, homeTeam: "Venc. Jogo 97", awayTeam: "Venc. Jogo 98", homeFlag: "xx", awayFlag: "xx", phase: "SEMI_FINAL", matchDate: new Date("2026-07-14T19:00:00Z"), venue: "AT&T Stadium, Arlington", isLocked: true },
  { matchNumber: 102, homeTeam: "Venc. Jogo 99", awayTeam: "Venc. Jogo 100", homeFlag: "xx", awayFlag: "xx", phase: "SEMI_FINAL", matchDate: new Date("2026-07-15T19:00:00Z"), venue: "Mercedes-Benz Stadium, Atlanta", isLocked: true },

  // Third Place
  { matchNumber: 103, homeTeam: "Perd. Jogo 101", awayTeam: "Perd. Jogo 102", homeFlag: "xx", awayFlag: "xx", phase: "THIRD_PLACE", matchDate: new Date("2026-07-18T21:00:00Z"), venue: "Hard Rock Stadium, Miami Gardens", isLocked: true },

  // Final
  { matchNumber: 104, homeTeam: "Venc. Jogo 101", awayTeam: "Venc. Jogo 102", homeFlag: "xx", awayFlag: "xx", phase: "FINAL", matchDate: new Date("2026-07-19T19:00:00Z"), venue: "MetLife Stadium, East Rutherford", isLocked: true },
];

// ─── SEED FUNCTION ──────────────────────────────────────────────────────────────

async function main() {
  console.log("🏆 Seeding FIFA World Cup 2026...");

  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD is required to seed the admin user. Set it in .env before running db:seed.");
  }

  const adminPassword = await hash(process.env.ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: "admin@bolao.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@bolao.com",
      password: adminPassword,
      nickname: "Admin",
      role: "ADMIN",
      status: "APPROVED",
    },
  });
  console.log("✅ Admin user created");

  // Seed all matches
  const allMatches = [...groupMatches, ...knockoutMatches];
  console.log(`📋 Seeding ${allMatches.length} matches...`);

  for (const match of allMatches) {
    await prisma.match.create({
      data: {
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeFlag: match.homeFlag,
        awayFlag: match.awayFlag,
        phase: match.phase,
        group: match.group || null,
        matchNumber: match.matchNumber,
        matchDate: match.matchDate,
        venue: match.venue,
        multiplier: MULTIPLIERS[match.phase],
        isLocked: match.isLocked || false,
      },
    });
  }

  console.log(`✅ ${allMatches.length} matches seeded successfully`);
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, Phase } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { hash } from "bcryptjs";
import { MULTIPLIERS } from "../lib/constants";

neonConfig.webSocketConstructor = ws;

function createPrisma() {
  const connectionString = process.env.DATABASE_URL!;
  if (/neon\.tech|neon\.database/i.test(connectionString)) {
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

const prisma = createPrisma();

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
}

// FIFA World Cup 2026 - 48 teams, 12 groups of 4
// Tournament dates: June 11 - July 19, 2026
// Venues in USA, Canada, and Mexico

const teams: Record<string, { name: string; flag: string }> = {
  // Group A
  USA: { name: "Estados Unidos", flag: "US" },
  MEX: { name: "México", flag: "MX" },
  COL: { name: "Colômbia", flag: "CO" },
  NZL: { name: "Nova Zelândia", flag: "NZ" },
  // Group B
  ARG: { name: "Argentina", flag: "AR" },
  CAN: { name: "Canadá", flag: "CA" },
  AUS: { name: "Austrália", flag: "AU" },
  PER: { name: "Peru", flag: "PE" },
  // Group C
  FRA: { name: "França", flag: "FR" },
  ECU: { name: "Equador", flag: "EC" },
  URU: { name: "Uruguai", flag: "UY" },
  UAE: { name: "Emirados Árabes", flag: "AE" },
  // Group D
  BRA: { name: "Brasil", flag: "BR" },
  JPN: { name: "Japão", flag: "JP" },
  NGA: { name: "Nigéria", flag: "NG" },
  CRI: { name: "Costa Rica", flag: "CR" },
  // Group E
  ENG: { name: "Inglaterra", flag: "GB" },
  SEN: { name: "Senegal", flag: "SN" },
  CHI: { name: "Chile", flag: "CL" },
  BAH: { name: "Bahrein", flag: "BH" },
  // Group F
  GER: { name: "Alemanha", flag: "DE" },
  MAR: { name: "Marrocos", flag: "MA" },
  KOR: { name: "Coreia do Sul", flag: "KR" },
  TRI: { name: "Trinidad e Tobago", flag: "TT" },
  // Group G
  ESP: { name: "Espanha", flag: "ES" },
  CMR: { name: "Camarões", flag: "CM" },
  PAR: { name: "Paraguai", flag: "PY" },
  IRN: { name: "Irã", flag: "IR" },
  // Group H
  POR: { name: "Portugal", flag: "PT" },
  DEN: { name: "Dinamarca", flag: "DK" },
  GHA: { name: "Gana", flag: "GH" },
  SAU: { name: "Arábia Saudita", flag: "SA" },
  // Group I
  NED: { name: "Holanda", flag: "NL" },
  SUI: { name: "Suíça", flag: "CH" },
  CIV: { name: "Costa do Marfim", flag: "CI" },
  JAM: { name: "Jamaica", flag: "JM" },
  // Group J
  BEL: { name: "Bélgica", flag: "BE" },
  SRB: { name: "Sérvia", flag: "RS" },
  EGY: { name: "Egito", flag: "EG" },
  HON: { name: "Honduras", flag: "HN" },
  // Group K
  ITA: { name: "Itália", flag: "IT" },
  CRO: { name: "Croácia", flag: "HR" },
  TUN: { name: "Tunísia", flag: "TN" },
  PAN: { name: "Panamá", flag: "PA" },
  // Group L
  POL: { name: "Polônia", flag: "PL" },
  SWE: { name: "Suécia", flag: "SE" },
  ALG: { name: "Argélia", flag: "DZ" },
  CRC: { name: "Curaçao", flag: "CW" },
};

const venues = [
  "MetLife Stadium, New Jersey",
  "AT&T Stadium, Dallas",
  "SoFi Stadium, Los Angeles",
  "Hard Rock Stadium, Miami",
  "Lumen Field, Seattle",
  "Gillette Stadium, Boston",
  "Lincoln Financial Field, Philadelphia",
  "Mercedes-Benz Stadium, Atlanta",
  "NRG Stadium, Houston",
  "Arrowhead Stadium, Kansas City",
  "BMO Field, Toronto",
  "Estadio Azteca, Cidade do México",
  "Estadio BBVA, Monterrey",
  "BC Place, Vancouver",
  "Levi's Stadium, San Francisco",
  "Camping World Stadium, Orlando",
];

function createGroupMatches(): MatchSeed[] {
  const groups: Record<string, string[]> = {
    A: ["USA", "MEX", "COL", "NZL"],
    B: ["ARG", "CAN", "AUS", "PER"],
    C: ["FRA", "ECU", "URU", "UAE"],
    D: ["BRA", "JPN", "NGA", "CRI"],
    E: ["ENG", "SEN", "CHI", "BAH"],
    F: ["GER", "MAR", "KOR", "TRI"],
    G: ["ESP", "CMR", "PAR", "IRN"],
    H: ["POR", "DEN", "GHA", "SAU"],
    I: ["NED", "SUI", "CIV", "JAM"],
    J: ["BEL", "SRB", "EGY", "HON"],
    K: ["ITA", "CRO", "TUN", "PAN"],
    L: ["POL", "SWE", "ALG", "CRC"],
  };

  const matches: MatchSeed[] = [];
  let matchNumber = 1;
  let dayOffset = 0;

  // Group stage: June 11 - June 28, 2026
  const baseDate = new Date("2026-06-11T16:00:00Z");

  for (const [group, teamCodes] of Object.entries(groups)) {
    // Each group has 6 matches (round-robin 4 teams)
    const groupMatches = [
      [0, 1], [2, 3], // Round 1
      [0, 2], [1, 3], // Round 2
      [0, 3], [1, 2], // Round 3
    ];

    for (let i = 0; i < groupMatches.length; i++) {
      const [home, away] = groupMatches[i];
      const homeTeam = teams[teamCodes[home]];
      const awayTeam = teams[teamCodes[away]];
      const venue = venues[matchNumber % venues.length];

      // Distribute matches: ~4 per day
      const matchDate = new Date(baseDate);
      matchDate.setDate(matchDate.getDate() + dayOffset);
      // Alternate times: 13:00, 16:00, 19:00, 22:00
      const timeSlots = [13, 16, 19, 22];
      matchDate.setHours(timeSlots[matchNumber % 4], 0, 0, 0);

      matches.push({
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        homeFlag: homeTeam.flag,
        awayFlag: awayTeam.flag,
        phase: "GROUP",
        group,
        matchNumber,
        matchDate,
        venue,
      });

      matchNumber++;
      if (matchNumber % 4 === 0) dayOffset++;
    }
  }

  return matches;
}

function createKnockoutMatches(startMatchNumber: number): MatchSeed[] {
  const matches: MatchSeed[] = [];
  let matchNumber = startMatchNumber;

  // Round of 32 (16 matches): July 1-4, 2026
  const ro32Start = new Date("2026-07-01T16:00:00Z");
  for (let i = 0; i < 16; i++) {
    const matchDate = new Date(ro32Start);
    matchDate.setDate(matchDate.getDate() + Math.floor(i / 4));
    matchDate.setHours([13, 16, 19, 22][i % 4], 0, 0, 0);

    matches.push({
      homeTeam: `Vencedor Jogo R32-${i * 2 + 1}`,
      awayTeam: `Vencedor Jogo R32-${i * 2 + 2}`,
      homeFlag: "XX",
      awayFlag: "XX",
      phase: "ROUND_OF_16",
      matchNumber,
      matchDate,
      venue: venues[i % venues.length],
    });
    matchNumber++;
  }

  // Quarter Finals (8 matches): July 7-8, 2026
  const qfStart = new Date("2026-07-07T16:00:00Z");
  for (let i = 0; i < 8; i++) {
    const matchDate = new Date(qfStart);
    matchDate.setDate(matchDate.getDate() + Math.floor(i / 4));
    matchDate.setHours([13, 16, 19, 22][i % 4], 0, 0, 0);

    matches.push({
      homeTeam: `QF ${i + 1} - Casa`,
      awayTeam: `QF ${i + 1} - Fora`,
      homeFlag: "XX",
      awayFlag: "XX",
      phase: "QUARTER_FINAL",
      matchNumber,
      matchDate,
      venue: venues[i % venues.length],
    });
    matchNumber++;
  }

  // Semi Finals (4 matches): July 12-13, 2026
  const sfStart = new Date("2026-07-12T19:00:00Z");
  for (let i = 0; i < 4; i++) {
    const matchDate = new Date(sfStart);
    matchDate.setDate(matchDate.getDate() + Math.floor(i / 2));
    matchDate.setHours(i % 2 === 0 ? 16 : 20, 0, 0, 0);

    matches.push({
      homeTeam: `SF ${i + 1} - Casa`,
      awayTeam: `SF ${i + 1} - Fora`,
      homeFlag: "XX",
      awayFlag: "XX",
      phase: "SEMI_FINAL",
      matchNumber,
      matchDate,
      venue: venues[i % 4],
    });
    matchNumber++;
  }

  // Third place: July 18, 2026
  matches.push({
    homeTeam: "3º Lugar - Casa",
    awayTeam: "3º Lugar - Fora",
    homeFlag: "XX",
    awayFlag: "XX",
    phase: "THIRD_PLACE",
    matchNumber,
    matchDate: new Date("2026-07-18T16:00:00Z"),
    venue: "Hard Rock Stadium, Miami",
  });
  matchNumber++;

  // Final: July 19, 2026
  matches.push({
    homeTeam: "Final - Casa",
    awayTeam: "Final - Fora",
    homeFlag: "XX",
    awayFlag: "XX",
    phase: "FINAL",
    matchNumber,
    matchDate: new Date("2026-07-19T16:00:00Z"),
    venue: "MetLife Stadium, New Jersey",
  });

  return matches;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.bonusBet.deleteMany();
  await prisma.bet.deleteMany();
  await prisma.match.deleteMany();
  await prisma.config.deleteMany();

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@bolao.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await hash("admin123", 12);
    await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        password: hashedPassword,
        nickname: "admin",
        role: "ADMIN",
        status: "APPROVED",
      },
    });
    console.log(`✅ Admin user created: ${adminEmail} / admin123`);
  }

  // Seed group matches
  const groupMatches = createGroupMatches();
  console.log(`📋 Created ${groupMatches.length} group stage matches`);

  // Seed knockout matches
  const knockoutMatches = createKnockoutMatches(groupMatches.length + 1);
  console.log(`📋 Created ${knockoutMatches.length} knockout stage matches`);

  const allMatches = [...groupMatches, ...knockoutMatches];

  // Insert matches with multipliers
  for (const match of allMatches) {
    await prisma.match.create({
      data: {
        ...match,
        multiplier: MULTIPLIERS[match.phase],
      },
    });
  }

  console.log(`✅ Total matches seeded: ${allMatches.length}`);

  // Seed config
  await prisma.config.createMany({
    data: [
      { key: "entry_fee", value: "50" },
      { key: "pix_key", value: process.env.NEXT_PUBLIC_PIX_KEY ?? "sua-chave-pix" },
      { key: "prize_1st", value: "60" },
      { key: "prize_2nd", value: "25" },
      { key: "prize_3rd", value: "15" },
    ],
  });

  console.log("✅ Config seeded");
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

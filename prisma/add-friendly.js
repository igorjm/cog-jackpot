require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected.');

  // Add FRIENDLY to Phase enum
  await client.query(`ALTER TYPE "Phase" ADD VALUE IF NOT EXISTS 'FRIENDLY' BEFORE 'GROUP'`);
  console.log('FRIENDLY added to Phase enum.');

  // Insert 3 special matches
  const matches = [
    {
      homeTeam: 'PSG', awayTeam: 'Arsenal',
      homeFlag: 'fr', awayFlag: 'gb-eng',
      matchNumber: 900,
      matchDate: '2026-05-30T16:00:00.000Z', // 13h BRT
      venue: 'Puskás Aréna',
    },
    {
      homeTeam: 'Brasil', awayTeam: 'Panamá',
      homeFlag: 'br', awayFlag: 'pa',
      matchNumber: 901,
      matchDate: '2026-05-31T21:30:00.000Z', // 18:30 BRT
      venue: 'Maracanã',
    },
    {
      homeTeam: 'Brasil', awayTeam: 'Egito',
      homeFlag: 'br', awayFlag: 'eg',
      matchNumber: 902,
      matchDate: '2026-06-06T22:00:00.000Z', // 19h BRT
      venue: 'Huntington Bank Field',
    },
  ];

  for (const m of matches) {
    await client.query(
      `INSERT INTO "Match" (id, "homeTeam", "awayTeam", "homeFlag", "awayFlag", phase, "matchNumber", "matchDate", venue, multiplier, "isLocked", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'FRIENDLY', $5, $6, $7, 1.0, false, NOW(), NOW())
       ON CONFLICT ("matchNumber") DO NOTHING`,
      [m.homeTeam, m.awayTeam, m.homeFlag, m.awayFlag, m.matchNumber, m.matchDate, m.venue]
    );
    console.log(`Match ${m.matchNumber}: ${m.homeTeam} × ${m.awayTeam} inserted.`);
  }

  await client.end();
  console.log('Done!');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

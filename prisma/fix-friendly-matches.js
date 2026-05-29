require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected.');

  // Fix match 900: PSG × Arsenal - date to 2026, correct venue, unlock
  await client.query(
    `UPDATE "Match" SET "matchDate" = '2026-05-30T16:00:00.000Z', venue = $1, "isLocked" = false, "updatedAt" = NOW() WHERE "matchNumber" = 900`,
    ['Puskás Aréna']
  );
  console.log('Match 900 fixed: PSG × Arsenal → Puskás Aréna, 2026-05-30');

  // Fix match 901: Brasil × Panamá - date to 2026, correct venue, unlock
  await client.query(
    `UPDATE "Match" SET "matchDate" = '2026-05-31T21:30:00.000Z', venue = $1, "isLocked" = false, "updatedAt" = NOW() WHERE "matchNumber" = 901`,
    ['Maracanã']
  );
  console.log('Match 901 fixed: Brasil × Panamá → Maracanã, 2026-05-31');

  // Fix match 902: Brasil × Egito - date to 2026, correct venue, unlock
  await client.query(
    `UPDATE "Match" SET "matchDate" = '2026-06-06T22:00:00.000Z', venue = $1, "isLocked" = false, "updatedAt" = NOW() WHERE "matchNumber" = 902`,
    ['Huntington Bank Field']
  );
  console.log('Match 902 fixed: Brasil × Egito → Huntington Bank Field, 2026-06-06');

  await client.end();
  console.log('Done!');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

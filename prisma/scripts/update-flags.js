require('dotenv').config();
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(
    `UPDATE "Match" SET "homeFlag" = $1, "awayFlag" = $2, "updatedAt" = NOW() WHERE "matchNumber" = 900`,
    ['psg', 'arsenal']
  );
  console.log('Updated match 900: PSG × Arsenal → club logos');

  await client.end();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

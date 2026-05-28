require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;');
    console.log('OK: avatar column ensured');
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();

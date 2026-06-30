require("dotenv").config();
const { Client } = require("pg");

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(`
    ALTER TABLE "Match"
    ADD COLUMN IF NOT EXISTS "winnerSide" TEXT;
  `);

  console.log("Match.winnerSide column is ready");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

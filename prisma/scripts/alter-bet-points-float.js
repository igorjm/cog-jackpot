require("dotenv").config();
const { Client } = require("pg");

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(`
    ALTER TABLE "Bet"
    ALTER COLUMN "points" TYPE DOUBLE PRECISION
    USING "points"::double precision;
  `);

  console.log("Bet.points column is now DOUBLE PRECISION");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

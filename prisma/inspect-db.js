require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const tables = ['User', 'Match', 'Bet', 'BonusBet', 'Config'];
    for (const t of tables) {
      const r = await client.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`,
        [t]
      );
      console.log(`\n[${t}]`);
      for (const c of r.rows) console.log(`  ${c.column_name} (${c.data_type})`);
    }
    const enums = await client.query(
      `SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid ORDER BY t.typname, e.enumsortorder`
    );
    console.log('\n[Enums]');
    for (const e of enums.rows) console.log(`  ${e.typname}.${e.enumlabel}`);
  } finally {
    await client.end();
  }
})();

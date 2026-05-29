// Test push notification script
// Usage: node prisma/test-push.js
const webpush = require("web-push");
require("dotenv").config();
const { Client } = require("pg");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

webpush.setVapidDetails(
  "mailto:admin@bolao2026.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query('SELECT * FROM "PushSubscription" LIMIT 5');

  if (rows.length === 0) {
    console.log("No push subscriptions found. Go to /profile and click 'Ativar notificações' first.");
    await client.end();
    return;
  }

  console.log(`Found ${rows.length} subscription(s). Sending test notification...`);

  for (const sub of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({
          title: "⚽ Bolão Copa 2026",
          body: "Teste de notificação! Brasil × Panamá fecha em 1 hora!",
          url: "/matches",
        })
      );
      console.log(`✓ Sent to user ${sub.userId}`);
    } catch (err) {
      console.error(`✗ Failed for user ${sub.userId}:`, err.statusCode || err.message);
    }
  }

  await client.end();
  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

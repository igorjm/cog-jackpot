import { avatarSchema, betSchema, predictionValueSchema, notificationSchema } from "../lib/validations";
import { verifyCronSecret } from "../lib/cron-auth";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

(() => {
  assert(avatarSchema.safeParse("/avatar/brazil/neymar.png").success, "valid avatar path accepted");
  assert(!avatarSchema.safeParse("https://evil.com/x.png").success, "external avatar URL rejected");
  assert(!avatarSchema.safeParse("/avatar/../etc/passwd").success, "path traversal avatar rejected");
})();

(() => {
  assert(!betSchema.safeParse({ matchId: "not-a-cuid", homeScore: 1, awayScore: 0 }).success, "invalid matchId rejected");
  assert(predictionValueSchema.safeParse("Brasil").success, "valid prediction value accepted");
  assert(!predictionValueSchema.safeParse("x".repeat(101)).success, "oversized prediction rejected");
  assert(notificationSchema.safeParse({ title: "Hi", body: "Test" }).success, "valid notification accepted");
  assert(!notificationSchema.safeParse({ title: "x".repeat(101), body: "Test" }).success, "oversized notification title rejected");
})();

(() => {
  const original = process.env.CRON_SECRET;
  process.env.CRON_SECRET = "test-secret-value-12345";

  assert(
    verifyCronSecret(new Request("http://localhost", { headers: { authorization: "Bearer test-secret-value-12345" } })),
    "valid cron secret accepted"
  );
  assert(
    !verifyCronSecret(new Request("http://localhost", { headers: { authorization: "Bearer wrong" } })),
    "invalid cron secret rejected"
  );
  assert(!verifyCronSecret(new Request("http://localhost")), "missing cron header rejected");

  if (original === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = original;
})();

console.log("\nAll security-guards tests passed!");

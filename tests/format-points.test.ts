import { formatPoints } from "../lib/utils";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

(() => {
  assert(formatPoints(13) === "13", "Integer 13 unchanged");
})();

(() => {
  assert(formatPoints(8.75) === "8,75", "8.75 → 8,75");
})();

(() => {
  assert(formatPoints(12.5) === "12,5", "12.5 → 12,5");
})();

(() => {
  assert(formatPoints(0) === "0", "Zero unchanged");
})();

console.log("\n🎉 All formatPoints tests passed!");

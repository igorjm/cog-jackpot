import { resolveFlagCode, teamsMatchFlags } from "../lib/team-codes";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

// TLA resolution
(() => {
  assert(resolveFlagCode({ tla: "MEX" }) === "mx", "MEX → mx");
  assert(resolveFlagCode({ tla: "RSA" }) === "za", "RSA → za");
  assert(resolveFlagCode({ tla: "KOR" }) === "kr", "KOR → kr");
  assert(resolveFlagCode({ tla: "CZE" }) === "cz", "CZE → cz");
})();

// English name fallback
(() => {
  assert(resolveFlagCode({ name: "Mexico" }) === "mx", "Mexico → mx");
  assert(resolveFlagCode({ name: "South Africa" }) === "za", "South Africa → za");
  assert(resolveFlagCode({ name: "Korea Republic" }) === "kr", "Korea Republic → kr");
  assert(resolveFlagCode({ name: "Czech Republic" }) === "cz", "Czech Republic → cz");
})();

// Simultaneous games must not cross-match
(() => {
  const mexicoZa = teamsMatchFlags(
    { tla: "MEX", name: "Mexico" },
    { tla: "RSA", name: "South Africa" },
    "mx",
    "za"
  );
  const koreaCzech = teamsMatchFlags(
    { tla: "KOR", name: "Korea Republic" },
    { tla: "CZE", name: "Czech Republic" },
    "kr",
    "cz"
  );
  const wrongSwap = teamsMatchFlags(
    { tla: "MEX", name: "Mexico" },
    { tla: "RSA", name: "South Africa" },
    "kr",
    "cz"
  );

  assert(mexicoZa === true, "Mexico vs South Africa matches mx/za");
  assert(koreaCzech === true, "Korea vs Czech matches kr/cz");
  assert(wrongSwap === false, "Mexico vs SA does NOT match kr/cz (no swap)");
})();

// Scotland / England special flags
(() => {
  assert(resolveFlagCode({ tla: "SCO" }) === "gb-sct", "SCO → gb-sct");
  assert(resolveFlagCode({ tla: "ENG" }) === "gb-eng", "ENG → gb-eng");
})();

console.log("\nAll match-sync tests passed!");

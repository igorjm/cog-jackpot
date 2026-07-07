import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";

const testsDir = path.join(__dirname, "../tests");
const files = readdirSync(testsDir)
  .filter((file) => file.endsWith(".test.ts"))
  .sort();

if (files.length === 0) {
  console.error("No test files found in tests/");
  process.exit(1);
}

for (const file of files) {
  console.log(`\n--- ${file} ---\n`);
  execSync(`npx tsx ${JSON.stringify(path.join(testsDir, file))}`, {
    stdio: "inherit",
  });
}

console.log(`\n✅ All ${files.length} test file(s) passed.`);

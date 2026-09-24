import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const patterns = [
  { name: "OpenAI secret", value: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g },
  { name: "private key", value: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "Supabase service-role JWT", value: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g }
];

const findings = [];
for (const file of files) {
  if (file === "package-lock.json") continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const pattern of patterns) {
    if (pattern.value.test(text)) findings.push(`${file}: possible ${pattern.name}`);
    pattern.value.lastIndex = 0;
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log(`Secret scan passed for ${files.length} tracked files.`);

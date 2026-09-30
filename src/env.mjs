import { readFileSync } from "node:fs";

// Minimal .env loader — loads KEY=VALUE pairs from .env.local then .env
// (first value wins) without a dotenv dependency.
for (const file of [".env.local", ".env"]) {
  try {
    const raw = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const [, key, rawVal] = m;
      let val = rawVal.trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // .env files are optional for scripts.
  }
}


/**
 * Seed script: pushes canonical content into Supabase.
 * Usage: npm run seed   (requires SUPABASE env vars — see .env.example)
 */
import "../src/env.mjs";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local — cannot seed."
  );
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Inline canonical seed (mirrors src/lib/seed-data.ts to avoid a TS build step).
const seed = JSON.parse(readFileSync(new URL("../seed.json", import.meta.url), "utf8"));

async function upsertAll(table, rows, conflict) {
  if (!rows?.length) return;
  const { error } = await sb.from(table).upsert(rows, { onConflict: conflict });
  if (error) {
    console.error(`✗ ${table}: ${error.message}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ ${table}: ${rows.length} rows`);
  }
}

await upsertAll("projects", seed.projects, "slug");
await upsertAll("experiences", seed.experiences, "id");
await upsertAll("certifications", seed.certifications, "id");
await upsertAll("achievements", seed.achievements, "id");
await upsertAll("skills", seed.skills, "id");
await upsertAll("posts", seed.posts, "slug");

const settingsRows = Object.entries(seed.settings).map(([key, value]) => ({
  key,
  value,
}));
await upsertAll("settings", settingsRows, "key");

console.log("Seed complete.");

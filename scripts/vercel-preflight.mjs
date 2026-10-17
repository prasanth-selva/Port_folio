import { createClient } from "@supabase/supabase-js";

const environment = process.env.VERCEL_ENV ?? "unknown";
const issues = [];
if (!process.env.VERCEL_ENV || !process.env.VERCEL_URL) {
  issues.push("Enable access to Vercel System Environment Variables in the project settings.");
}
const required = [
  "NEXTAUTH_SECRET",
  "ADMIN_EMAIL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const name of required) {
  if (!process.env[name]?.trim()) issues.push(`Set ${name} in the Vercel project environment variables.`);
}
if (!process.env.ADMIN_PASSWORD?.trim() && !process.env.ADMIN_PASSWORD_HASH?.trim()) {
  issues.push("Set ADMIN_PASSWORD_HASH (recommended) or ADMIN_PASSWORD.");
}
if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim().length < 32) {
  issues.push("NEXTAUTH_SECRET must contain at least 32 characters; generate one with `openssl rand -base64 32`.");
}
if (process.env.ADMIN_PASSWORD_HASH?.trim()) {
  const match = process.env.ADMIN_PASSWORD_HASH.trim().match(/^\$2[aby]\$(\d{2})\$[./A-Za-z0-9]{53}$/);
  if (!match || Number(match[1]) < 10 || Number(match[1]) > 31) {
    issues.push("ADMIN_PASSWORD_HASH must be a valid bcrypt hash with a cost of at least 10.");
  }
} else if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length < 12) {
  issues.push("ADMIN_PASSWORD must contain at least 12 characters; prefer ADMIN_PASSWORD_HASH for production.");
}
if (process.env.ADMIN_EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.ADMIN_EMAIL)) {
  issues.push("ADMIN_EMAIL must be a valid email address.");
}
if (process.env.ADMIN_EMAIL?.trim().toLowerCase() === "admin@example.com") {
  issues.push("Replace the example ADMIN_EMAIL with the real portfolio administrator address.");
}

function validateHttpsUrl(name, value) {
  if (!value) return;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") issues.push(`${name} must use https:// on Vercel.`);
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname)) {
      issues.push(`${name} cannot point to localhost in a Vercel deployment.`);
    }
  } catch {
    issues.push(`${name} must be a valid absolute URL.`);
  }
}

validateHttpsUrl("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
if (environment === "production") {
  if (!process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    issues.push("Set NEXT_PUBLIC_SITE_URL to the public production domain (for example https://your-domain.com).");
  }
  validateHttpsUrl("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL);
}
if (process.env.NEXTAUTH_URL) {
  validateHttpsUrl("NEXTAUTH_URL", process.env.NEXTAUTH_URL);
  if (environment === "production" && process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      if (new URL(process.env.NEXTAUTH_URL).hostname !== new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname) {
        issues.push("NEXTAUTH_URL and NEXT_PUBLIC_SITE_URL must use the same production hostname.");
      }
    } catch {
      // The URL validation above already reports invalid values.
    }
  }
  if (environment === "preview" && process.env.VERCEL_URL) {
    try {
      if (new URL(process.env.NEXTAUTH_URL).hostname !== process.env.VERCEL_URL) {
        issues.push("Remove NEXTAUTH_URL from Preview variables; NextAuth infers the Vercel preview URL automatically.");
      }
    } catch {
      // The URL validation above already reports invalid values.
    }
  }
}

if (issues.length) {
  console.error(`Vercel ${environment} preflight failed:\n- ${issues.join("\n- ")}`);
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const schemaChecks = [
  ["projects", "id"],
  ["experiences", "id"],
  ["certifications", "id"],
  ["achievements", "id"],
  ["skills", "id"],
  ["posts", "id"],
  ["messages", "id"],
  ["settings", "key"],
  ["analytics_daily", "day"],
  ["rate_limit_buckets", "bucket_key"],
];

const results = await Promise.all(
  schemaChecks.map(async ([table, column]) => {
    const { error } = await supabase.from(table).select(column).limit(0);
    return { table, error };
  })
);
const failed = results.filter((result) => result.error);
if (failed.length) {
  console.error(
    `Vercel ${environment} preflight could not verify the Supabase schema:\n- ${failed
      .map(({ table, error }) => `${table}: ${error.code ?? error.message}`)
      .join("\n- ")}\nApply supabase/migrations/0001_init.sql and 0002_analytics.sql, then verify the Supabase environment variables.`
  );
  process.exit(1);
}

const publicSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
const [publicProjects, publicSettings, mediaBucket] = await Promise.all([
  publicSupabase.from("projects").select("id").limit(0),
  publicSupabase.from("settings").select("key").limit(0),
  supabase.storage.from("media").list("", { limit: 1 }),
]);
const publicFailures = [
  ...(publicProjects.error ? [`public projects read: ${publicProjects.error.code ?? publicProjects.error.message}`] : []),
  ...(publicSettings.error ? [`public settings read: ${publicSettings.error.code ?? publicSettings.error.message}`] : []),
  ...(mediaBucket.error ? [`media storage bucket: ${mediaBucket.error.code ?? mediaBucket.error.message}`] : []),
];
if (publicFailures.length) {
  console.error(
    `Vercel ${environment} preflight could not verify public reads or media storage:\n- ${publicFailures.join("\n- ")}\nCheck the Supabase anon key, public RLS policies, and the media bucket created by 0001_init.sql.`
  );
  process.exit(1);
}

console.log(
  `Vercel ${environment} preflight passed: environment variables, database schema, public reads, and media storage are ready.`
);

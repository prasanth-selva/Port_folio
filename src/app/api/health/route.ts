import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deployment health probe.
 * GET /api/health → { ok, db: "up" | "down" | "unconfigured", latencyMs }
 * Visit this right after deploying to confirm Supabase is reachable.
 */
export async function GET() {
  const production = process.env.VERCEL_ENV === "production";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secret = process.env.NEXTAUTH_SECRET?.trim() ?? "";
  const email = process.env.ADMIN_EMAIL?.trim() ?? "";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim() ?? "";
  const plainPassword = process.env.ADMIN_PASSWORD ?? "";
  const validBcryptHash = /^\$2[aby]\$(1[0-9]|2[0-9]|3[01])\$[./A-Za-z0-9]{53}$/.test(passwordHash);
  const authConfigured = Boolean(
    secret.length >= 32 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    (passwordHash ? validBcryptHash : plainPassword.length >= 12)
  );

  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json(
      {
        ok: !production,
        db: "unconfigured",
        note: "Set Supabase and admin environment variables to enable the full production app.",
      },
      { status: production ? 503 : 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const started = Date.now();
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const publicDb = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const [probes, publicProbes, mediaBucket] = await Promise.all([
      Promise.all([
        sb.from("settings").select("key").limit(0),
        sb.from("analytics_daily").select("day").limit(0),
        sb.from("rate_limit_buckets").select("bucket_key").limit(0),
      ]),
      Promise.all([
        publicDb.from("projects").select("id").limit(0),
        publicDb.from("settings").select("key").limit(0),
      ]),
      sb.storage.from("media").list("", { limit: 1 }),
    ]);
    const failed = [
      ...["settings", "analytics_daily", "rate_limit_buckets"].filter((_, index) => probes[index]?.error),
      ...(publicProbes[0]?.error ? ["public:projects"] : []),
      ...(publicProbes[1]?.error ? ["public:settings"] : []),
      ...(mediaBucket.error ? ["storage:media"] : []),
    ];
    if (failed.length) {
      console.error("[health] Supabase readiness checks failed:", failed.join(", "));
      return NextResponse.json(
        {
          ok: false,
          db: "degraded",
          error: "Required Supabase schema, public reads, or media storage are unavailable.",
          missing: failed,
          latencyMs: Date.now() - started,
        },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (production && !authConfigured) {
      return NextResponse.json(
        { ok: false, db: "up", auth: "unconfigured", error: "Admin auth environment variables are missing." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: true, db: "up", auth: authConfigured ? "configured" : "unconfigured", latencyMs: Date.now() - started },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    console.error("[health] Supabase check unavailable");
    return NextResponse.json(
      { ok: false, db: "down", error: "Database health check failed", latencyMs: Date.now() - started },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}

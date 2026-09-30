import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deployment health probe.
 * GET /api/health → { ok, db: "up" | "down" | "unconfigured", latencyMs }
 * Visit this right after deploying to confirm Supabase is reachable.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: true, db: "unconfigured", note: "Site runs on seed data; admin CRUD disabled." },
      { status: 200 }
    );
  }

  const started = Date.now();
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await sb.from("settings").select("key").limit(1);
    if (error) {
      return NextResponse.json(
        { ok: false, db: "down", error: error.message, latencyMs: Date.now() - started },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, db: "up", latencyMs: Date.now() - started });
  } catch (err) {
    return NextResponse.json(
      { ok: false, db: "down", error: (err as Error).message, latencyMs: Date.now() - started },
      { status: 503 }
    );
  }
}

import { NextResponse } from "next/server";

import { clientIp, distributedRateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = await distributedRateLimit(`analytics:${ip}`, 60, 60 * 60 * 1000);
  if (!limit.ok) {
    return new NextResponse(null, {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSec), "Cache-Control": "no-store" },
    });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }

  const day = new Date().toISOString().slice(0, 10);
  try {
    const { error } = await supabaseAdmin().rpc("increment_portfolio_view", { p_day: day });
    if (error) {
      console.error("[analytics] view counter unavailable:", error.code ?? "unknown");
      return new NextResponse(null, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("[analytics] view counter unavailable");
    return new NextResponse(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

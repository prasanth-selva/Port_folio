import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

/**
 * /admin protection:
 *  - everything under /admin except /admin/login requires a valid JWT session
 *  - /admin/login attempts are rate-limited per IP (5 per 10 min) at the edge
 */
const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const buckets = new Map<string, number[]>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const hits = (buckets.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= RATE_LIMIT) {
    buckets.set(ip, hits);
    return false;
  }
  hits.push(now);
  buckets.set(ip, hits);
  return true;
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    if (pathname === "/admin/login") {
      const ip =
        req.headers.get("x-real-ip") ??
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";
      if (!rateLimit(ip)) {
        const res = NextResponse.redirect(new URL("/admin/login?e=rate", req.url));
        res.headers.set("Retry-After", "600");
        return res;
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        if (pathname === "/admin/login") return true;
        return Boolean(token);
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

/**
 * /admin protection. /admin/login must always pass through untouched —
 * the explicit NextResponse.next() with the request's own headers prevents
 * NextAuth's default authorized() from redirecting it to itself.
 */
export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
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

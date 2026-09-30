import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";

/** Clears the admin session by hitting NextAuth's signout endpoint. */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL("/admin/login", req.url));

  const { default: NextAuth } = await import("next-auth");
  const handler = NextAuth(authOptions);
  return handler(req);
}

export async function GET(req: Request) {
  return POST(req);
}

import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { rateLimit } from "@/lib/rate-limit";

/**
 * Single-admin credentials auth. Admin credentials come from env:
 *   ADMIN_EMAIL / ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH — preferred).
 *
 * Brute-force protection: each source IP gets 5 login attempts per 10 minutes,
 * enforced inside authorize() so only real authentication calls are counted.
 * Sessions are JWTs in httpOnly cookies (12h).
 */

function passwordMatches(password: string): boolean {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return bcrypt.compareSync(password, hash);
  const plain = process.env.ADMIN_PASSWORD;
  if (!plain) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(plain);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Reads a header from either a Headers instance (edge) or a plain object (pages router). */
function headerOf(req: unknown, name: string): string {
  const headers = (req as { headers?: unknown } | null | undefined)?.headers;
  if (!headers) return "";
  const maybeGet = (headers as { get?: unknown }).get;
  if (typeof maybeGet === "function") {
    return (maybeGet as (n: string) => string | null).call(headers, name) ?? "";
  }
  const v = (headers as Record<string, unknown>)[name];
  if (Array.isArray(v)) return String(v[0] ?? "");
  return typeof v === "string" ? v : "";
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Brute-force throttle per IP (5 attempts / 10 min).
        const forwarded = headerOf(req, "x-forwarded-for");
        const ip =
          headerOf(req, "x-real-ip") ||
          forwarded.split(",")[0]?.trim() ||
          "unknown";
        const rl = rateLimit(`login:${ip}`, 5, 10 * 60 * 1000);
        if (!rl.ok) return null;

        const email = credentials?.email?.trim().toLowerCase() ?? "";
        const password = credentials?.password ?? "";
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
        if (!email || !adminEmail || email !== adminEmail) return null;
        if (!password || !passwordMatches(password)) return null;
        return { id: "admin", name: "Prasanth Selva", email: adminEmail };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = "admin";
      return token;
    },
    session({ session, token }) {
      if (token.role === "admin") {
        session.user = { ...session.user, name: token.name, email: token.email };
      }
      return session;
    },
  },
};

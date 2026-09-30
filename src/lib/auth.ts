import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Single-admin credentials auth. Admin credentials come from env:
 *   ADMIN_EMAIL / ADMIN_PASSWORD (plaintext in env, compared against
 *   ADMIN_PASSWORD_HASH when provided — otherwise bcrypt-hashed at boot).
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
      async authorize(credentials) {
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
